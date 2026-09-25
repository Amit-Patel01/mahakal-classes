import { ObjectId, GridFSFile } from 'mongodb';
import { Response } from 'express';
import { Readable } from 'stream';
import { getGridFSBucket, getNativeDb } from '../config/db';

export class GridFSService {
  /**
   * Uploads an in-memory buffer into MongoDB GridFS in 255KB chunks
   */
  static async uploadBuffer(
    buffer: Buffer,
    filename: string,
    contentType: string,
    metadata: Record<string, any> = {}
  ): Promise<{ fileId: string; filename: string; length: number }> {
    const bucket = getGridFSBucket();

    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: {
          ...metadata,
          uploadedAt: new Date(),
        },
      });

      readableStream
        .pipe(uploadStream)
        .on('error', (err) => reject(err))
        .on('finish', () => {
          resolve({
            fileId: uploadStream.id.toString(),
            filename,
            length: buffer.length,
          });
        });
    });
  }

  /**
   * Retrieves file metadata from fs.files
   */
  static async getFileMetadata(fileId: string): Promise<GridFSFile | null> {
    const db = getNativeDb();
    const filesCollection = db.collection<GridFSFile>('uploads.files');

    if (!ObjectId.isValid(fileId)) {
      return null;
    }

    const file = await filesCollection.findOne({ _id: new ObjectId(fileId) });
    return file;
  }

  /**
   * Streams a file with full HTTP 206 Partial Content Range support
   * Essential for video seeking, audio playback, and segmented PDF reading.
   */
  static async streamWithRange(
    fileId: string,
    rangeHeader: string | undefined,
    res: Response
  ): Promise<void> {
    const bucket = getGridFSBucket();
    const file = await this.getFileMetadata(fileId);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found in GridFS' });
      return;
    }

    const fileSize = file.length;
    let contentType = file.contentType || 'application/octet-stream';
    if (file.filename && file.filename.toLowerCase().endsWith('.pdf')) {
      contentType = 'application/pdf';
    }

    if (rangeHeader) {
      // Parse Range Header (e.g., "bytes=0-1048576" or "bytes=524288-")
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set({
          'Content-Range': `bytes */${fileSize}`,
        }).end();
        return;
      }

      const chunksize = end - start + 1;
      const downloadStream = bucket.openDownloadStream(file._id, {
        start,
        end: end + 1, // GridFS end is exclusive
      });

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename || 'document')}"`,
        'Cache-Control': 'public, max-age=86400',
      });

      downloadStream.on('error', (err) => {
        console.error('[GridFS Stream Error]', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error streaming file chunk' });
        }
      });

      downloadStream.pipe(res);
    } else {
      // Full stream (HTTP 200)
      res.status(200).set({
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename || 'document')}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      });

      const downloadStream = bucket.openDownloadStream(file._id);

      downloadStream.on('error', (err) => {
        console.error('[GridFS Full Stream Error]', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error streaming file' });
        }
      });

      downloadStream.pipe(res);
    }
  }

  /**
   * Forces file download with Content-Disposition attachment header
   */
  static async downloadFile(fileId: string, res: Response): Promise<void> {
    const bucket = getGridFSBucket();
    const file = await this.getFileMetadata(fileId);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Length': file.length,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
    });

    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  }

  /**
   * Deletes file metadata and binary chunks from GridFS
   */
  static async deleteFile(fileId: string): Promise<boolean> {
    if (!ObjectId.isValid(fileId)) {
      return false;
    }

    const bucket = getGridFSBucket();
    try {
      await bucket.delete(new ObjectId(fileId));
      return true;
    } catch (err) {
      console.warn(`[GridFS] Failed to delete file ${fileId}:`, err);
      return false;
    }
  }
}
