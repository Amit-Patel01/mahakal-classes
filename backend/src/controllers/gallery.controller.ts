import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { GridFSService } from '../services/gridfs.service';
import { GalleryCategory } from '@prisma/client';
import { ObjectId } from 'mongodb';

export class GalleryController {
  static async uploadPhoto(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const { title, category, description, eventDate } = req.body;

      if (!file || !title) {
        res.status(400).json({ success: false, message: 'Image file and title are required.' });
        return;
      }

      // Upload directly into MongoDB GridFS
      const gridResult = await GridFSService.uploadBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        { title, category }
      );

      const galleryCategory: GalleryCategory =
        category && Object.values(GalleryCategory).includes(category)
          ? category
          : GalleryCategory.EVENTS;

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();
      const doc = {
        _id: new ObjectId(),
        title,
        category: galleryCategory,
        imageFileId: gridResult.fileId,
        description: description || '',
        eventDate: eventDate ? new Date(eventDate) : now,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('gallery').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Gallery photo uploaded to MongoDB GridFS successfully',
        data: { ...doc, id: doc._id.toString() },
      });
    } catch (error: any) {
      console.error('[Gallery Upload Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Photo upload failed' });
    }
  }

  static async getGallery(req: Request, res: Response): Promise<void> {
    try {
      const { category, search } = req.query;

      // Read-only — safe with Prisma on standalone MongoDB
      const items = await prisma.gallery.findMany({
        where: {
          ...(category && { category: category as GalleryCategory }),
          ...(search && {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: items });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch gallery' });
    }
  }

  static async deletePhoto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: 'Invalid photo ID.' });
        return;
      }

      const db = getNativeDb();
      const item = await db.collection('gallery').findOne({ _id: new ObjectId(id) });

      if (!item) {
        res.status(404).json({ success: false, message: 'Photo not found' });
        return;
      }

      // Delete from GridFS
      if (item.imageFileId) {
        await GridFSService.deleteFile(item.imageFileId);
      }

      // Delete record using native MongoDB
      await db.collection('gallery').deleteOne({ _id: new ObjectId(id) });

      res.status(200).json({ success: true, message: 'Photo deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Delete failed' });
    }
  }
}
