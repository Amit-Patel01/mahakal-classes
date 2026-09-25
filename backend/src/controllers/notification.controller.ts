import { Request, Response } from 'express';
import { prisma, getNativeDb } from '../config/db';
import { ObjectId } from 'mongodb';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response): Promise<void> {
    try {
      const recipientId = req.user?.userId;
      if (!recipientId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { recipientId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      const unreadCount = await prisma.notification.count({
        where: { recipientId, readAt: null },
      });

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Error fetching notifications' });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const recipientId = req.user?.userId;
      const { id } = req.params;

      if (!recipientId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const db = getNativeDb();
      const filter: any = {};
      if (id && ObjectId.isValid(id)) {
        filter._id = new ObjectId(id);
      }
      if (recipientId && ObjectId.isValid(recipientId)) {
        filter.recipientId = new ObjectId(recipientId);
      } else {
        filter.recipientId = recipientId;
      }

      await db.collection('notifications').updateMany(filter, {
        $set: {
          readAt: new Date(),
        },
      });

      res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  }
}
