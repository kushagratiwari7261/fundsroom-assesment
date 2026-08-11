import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const notifications: any[] = [];

    // 1. Check for Low Stock Products
    const products = await prisma.product.findMany();
    const lowStockProducts = products.filter((p: any) => p.currentStock <= p.minStockAlert);
    
    lowStockProducts.forEach((p: any) => {
      notifications.push({
        id: `low-stock-${p.id}`,
        type: 'WARNING',
        title: 'Inventory Alert',
        message: `Product ${p.sku} (${p.name}) is low on stock (${p.currentStock} remaining).`,
        createdAt: new Date()
      });
    });

    // 2. Recent Challans (created in the last 24 hours)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const recentChallans = await prisma.challan.findMany({
      where: {
        createdAt: { gte: yesterday }
      },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    recentChallans.forEach((c: any) => {
      notifications.push({
        id: `challan-${c.id}`,
        type: 'INFO',
        title: 'New Challan Generated',
        message: `Challan ${c.challanNumber} generated for ${c.customer.name}.`,
        createdAt: c.createdAt
      });
    });

    // Sort all notifications by descending date
    notifications.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

export default router;
