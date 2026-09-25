import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { GridFSService } from '../services/gridfs.service';
import { MaterialCategory } from '@prisma/client';
import { ObjectId } from 'mongodb';

export class MaterialController {
  static async uploadMaterial(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const uploadedById = req.user?.userId;

      if (!file) {
        res.status(400).json({ success: false, message: 'Please upload a document file.' });
        return;
      }

      if (!uploadedById) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { courseId, subjectId, chapterId, title, description, category } = req.body;

      if (!courseId || !subjectId || !title) {
        res.status(400).json({
          success: false,
          message: 'Course ID, Subject ID, and Title are required.',
        });
        return;
      }

      // Validate ObjectIds
      if (!ObjectId.isValid(courseId) || !ObjectId.isValid(subjectId)) {
        res.status(400).json({ success: false, message: 'Invalid courseId or subjectId format.' });
        return;
      }

      // Upload file buffer directly to MongoDB GridFS in 255KB chunks
      const gridfsResult = await GridFSService.uploadBuffer(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          courseId,
          subjectId,
          category: category || MaterialCategory.NOTES,
          uploadedBy: uploadedById,
        }
      );

      const materialCategory: MaterialCategory =
        category && Object.values(MaterialCategory).includes(category)
          ? category
          : MaterialCategory.NOTES;

      // Use native MongoDB to avoid Prisma replica-set transaction error
      const db = getNativeDb();
      const now = new Date();
      const doc: any = {
        _id: new ObjectId(),
        courseId: new ObjectId(courseId),
        subjectId: new ObjectId(subjectId),
        chapterId: chapterId && ObjectId.isValid(chapterId) ? new ObjectId(chapterId) : null,
        title,
        description: description || '',
        category: materialCategory,
        fileId: gridfsResult.fileId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedById: new ObjectId(uploadedById),
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('materials').insertOne(doc);

      res.status(201).json({
        success: true,
        message: 'Material uploaded and stored in MongoDB GridFS successfully',
        data: { ...doc, id: doc._id.toString() },
      });
    } catch (error: any) {
      console.error('[Upload Material Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Upload failed' });
    }
  }

  static async getMaterials(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, subjectId, category, search, sortBy } = req.query;

      // Prisma findMany is read-only — safe on standalone MongoDB
      const materials = await prisma.material.findMany({
        where: {
          ...(courseId && { courseId: String(courseId) }),
          ...(subjectId && { subjectId: String(subjectId) }),
          ...(category && { category: category as MaterialCategory }),
          ...(search && {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
              { fileName: { contains: String(search), mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          course: { select: { title: true, code: true } },
          subject: { select: { name: true, code: true } },
          chapter: { select: { title: true } },
          uploadedBy: { select: { name: true, role: true } },
        },
        orderBy:
          sortBy === 'popular'
            ? { downloadCount: 'desc' }
            : { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, data: materials });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch materials' });
    }
  }

  static async getMaterialById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const material = await prisma.material.findUnique({
        where: { id },
        include: {
          course: true,
          subject: true,
          chapter: true,
          uploadedBy: { select: { name: true, email: true } },
        },
      });

      if (!material) {
        res.status(404).json({ success: false, message: 'Material not found' });
        return;
      }

      // Increment download counter using native MongoDB (avoids Prisma transaction)
      const db = getNativeDb();
      await db.collection('materials').updateOne(
        { _id: new ObjectId(id) },
        { $inc: { downloadCount: 1 }, $set: { updatedAt: new Date() } }
      );

      res.status(200).json({ success: true, data: material });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch material' });
    }
  }

  static async deleteMaterial(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || !ObjectId.isValid(id)) {
        res.status(404).json({ success: false, message: 'Material not found' });
        return;
      }

      const db = getNativeDb();

      // Find material using native MongoDB
      const material = await db.collection('materials').findOne({
        _id: new ObjectId(id),
      });

      if (!material) {
        res.status(404).json({ success: false, message: 'Material not found' });
        return;
      }

      // Remove file from GridFS
      if (material.fileId) {
        await GridFSService.deleteFile(material.fileId);
      }

      // Remove record from database using native MongoDB
      await db.collection('materials').deleteOne({ _id: new ObjectId(id) });

      res.status(200).json({ success: true, message: 'Material deleted successfully' });
    } catch (error: any) {
      console.error('[Delete Material Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Delete failed' });
    }
  }
}
