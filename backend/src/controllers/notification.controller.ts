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
      await db.collection('notifications').updateMany(
        {
          ...(ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id }),
          recipientId: ObjectId.isValid(recipientId) ? new ObjectId(recipientId) : recipientId,
        },
        {
          $set: {
            readAt: new Date(),
          },
        }
      );

      res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  }
}
