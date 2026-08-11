import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role || 'SALES'; // Default fallback

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let responsePayload: any = { role };

    // Parallelize queries based on role
    const promises: Promise<void>[] = [];

    if (role === 'ADMIN' || role === 'ACCOUNTS') {
      const confirmedChallans = await prisma.challan.findMany({ where: { status: 'CONFIRMED' }, include: { items: true } });
      const recentConfirmed = await prisma.challan.findMany({ where: { status: 'CONFIRMED', createdAt: { gte: sevenDaysAgo } }, include: { items: true } });
      const recentChallansFeed = await prisma.challan.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } });
      
      let totalRevenue = 0;
      confirmedChallans.forEach((c: any) => {
        c.items.forEach((i: any) => { totalRevenue += i.unitPrice * i.quantity; });
      });

      const revenueMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(today.getDate() - i);
        revenueMap.set(days[d.getDay()], 0);
      }

      recentConfirmed.forEach((c: any) => {
        const dayName = days[c.createdAt.getDay()];
        let rev = 0;
        c.items.forEach((i: any) => { rev += i.unitPrice * i.quantity; });
        if (revenueMap.has(dayName)) revenueMap.set(dayName, revenueMap.get(dayName) + rev);
      });

      const revenueChart = Array.from(revenueMap.entries()).map(([name, revenue]) => ({ name, revenue }));

      responsePayload.financials = {
        totalConfirmedChallans: confirmedChallans.length,
        totalRevenue,
        revenueChart,
        recentChallans: recentChallansFeed
      };
    }

    if (role === 'ADMIN' || role === 'SALES') {
      const totalCustomers = await prisma.customer.count();
      const totalChallans = await prisma.challan.count();
      const draftChallans = await prisma.challan.count({ where: { status: 'DRAFT' } });
      const recentChallans = await prisma.challan.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } });
      const recentCustomers = await prisma.customer.findMany({ take: 5, orderBy: { createdAt: 'desc' } });

      const challanMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(today.getDate() - i);
        challanMap.set(days[d.getDay()], 0);
      }
      recentChallans.forEach((c: any) => {
        const dayName = days[c.createdAt.getDay()];
        if (challanMap.has(dayName)) challanMap.set(dayName, challanMap.get(dayName) + 1);
      });

      const challanChart = Array.from(challanMap.entries()).map(([name, count]) => ({ name, count }));

      responsePayload.sales = {
        totalCustomers,
        totalChallans,
        draftChallans,
        challanChart,
        recentCustomers
      };
    }

    if (role === 'ADMIN' || role === 'WAREHOUSE') {
      const totalProducts = await prisma.product.count();
      const products = await prisma.product.findMany({ orderBy: { currentStock: 'asc' } });
      const recentMovements = await prisma.stockMovement.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { product: true } });
      const totalItemsDispatched = await prisma.stockMovement.aggregate({ _sum: { quantity: true }, where: { type: 'OUT' } });
      
      const lowStockCount = products.filter((p: any) => p.currentStock <= p.minStockAlert).length;
      
      const lowestStockChart = products.slice(0, 5).map((p: any) => ({
        name: p.name.length > 12 ? p.name.substring(0,12)+'...' : p.name,
        stock: p.currentStock
      }));

      responsePayload.inventory = {
        totalProducts,
        lowStockCount,
        totalDispatched: totalItemsDispatched._sum.quantity || 0,
        lowestStockChart,
        recentMovements
      };
    }

    res.json(responsePayload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
