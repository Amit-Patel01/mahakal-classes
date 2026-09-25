import { Request, Response } from 'express';
import { GridFSService } from '../services/gridfs.service';

export class FileController {
  /**
   * Byte-range streaming endpoint for videos, audio, and documents
   * Handles HTTP 206 Partial Content with Range headers.
   */
  static async streamFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const rangeHeader = req.headers.range;

      await GridFSService.streamWithRange(fileId, rangeHeader, res);
    } catch (error: any) {
      console.error('[Stream File Error]', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message || 'Streaming failed' });
      }
    }
  }

  /**
   * Forces browser attachment download
   */
  static async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      await GridFSService.downloadFile(fileId, res);
    } catch (error: any) {
      console.error('[Download File Error]', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message || 'Download failed' });
      }
    }
  }

  /**
   * General upload endpoint directly into MongoDB GridFS
   */
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const result = await GridFSService.uploadBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          uploadedBy: req.user?.userId,
        }
      );

      res.status(201).json({
        success: true,
        message: 'File stored in MongoDB GridFS successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('[Upload File Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
  }

  /**
   * Fetches metadata for a GridFS file
   */
  static async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const metadata = await GridFSService.getFileMetadata(fileId);

      if (!metadata) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      res.status(200).json({ success: true, data: metadata });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching metadata' });
    }
  }
}
