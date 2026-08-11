import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role || 'SALES';

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // SUPABASE FREE TIER CONNECTION FIX:
    // By placing ALL queries into a single prisma.$transaction array, 
    // Prisma guarantees they execute over exactly ONE database connection 
    // in a single network round-trip. This completely bypasses the 
    // Supabase strict connection limit queueing issues!
    const [
      // Accounts 
      confirmedChallanCount,
      confirmedChallanItems,
      recentConfirmedItems,
      recentChallansFeed,
      
      // Sales
      totalCustomers,
      totalChallans,
      draftChallans,
      recentChallans,
      recentCustomers,
      
      // Warehouse
      totalProducts,
      products,
      recentMovements,
      totalItemsDispatched
    ] = await prisma.$transaction([
      // Accounts 
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.challanItem.findMany({ where: { challan: { status: 'CONFIRMED' } }, select: { unitPrice: true, quantity: true } }),
      prisma.challanItem.findMany({ where: { challan: { status: 'CONFIRMED', createdAt: { gte: sevenDaysAgo } } }, select: { unitPrice: true, quantity: true, challan: { select: { createdAt: true } } } }),
      prisma.challan.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
      
      // Sales
      prisma.customer.count(),
      prisma.challan.count(),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
      prisma.customer.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      
      // Warehouse
      prisma.product.count(),
      prisma.product.findMany({ orderBy: { currentStock: 'asc' } }),
      prisma.stockMovement.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { product: true } }),
      prisma.stockMovement.aggregate({ _sum: { quantity: true }, where: { type: 'OUT' } })
    ]);

    let responsePayload: any = { role };

    if (role === 'ADMIN' || role === 'ACCOUNTS') {
      let totalRevenue = 0;
      confirmedChallanItems.forEach((i: any) => { totalRevenue += i.unitPrice * i.quantity; });

      const revenueMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(today.getDate() - i);
        revenueMap.set(days[d.getDay()], 0);
      }
      recentConfirmedItems.forEach((i: any) => {
        const dayName = days[i.challan.createdAt.getDay()];
        if (revenueMap.has(dayName)) revenueMap.set(dayName, revenueMap.get(dayName) + (i.unitPrice * i.quantity));
      });

      responsePayload.financials = {
        totalConfirmedChallans: confirmedChallanCount,
        totalRevenue,
        revenueChart: Array.from(revenueMap.entries()).map(([name, revenue]) => ({ name, revenue })),
        recentChallans: recentChallansFeed
      };
    }

    if (role === 'ADMIN' || role === 'SALES') {
      const challanMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(today.getDate() - i);
        challanMap.set(days[d.getDay()], 0);
      }
      recentChallans.forEach((c: any) => {
        const dayName = days[c.createdAt.getDay()];
        if (challanMap.has(dayName)) challanMap.set(dayName, challanMap.get(dayName) + 1);
      });

      responsePayload.sales = {
        totalCustomers,
        totalChallans,
        draftChallans,
        challanChart: Array.from(challanMap.entries()).map(([name, count]) => ({ name, count })),
        recentCustomers
      };
    }

    if (role === 'ADMIN' || role === 'WAREHOUSE') {
      const lowStockCount = products.filter((p: any) => p.currentStock <= p.minStockAlert).length;

      responsePayload.inventory = {
        totalProducts,
        lowStockCount,
        totalDispatched: totalItemsDispatched._sum.quantity || 0,
        lowestStockChart: products.slice(0, 5).map((p: any) => ({
          name: p.name.length > 12 ? p.name.substring(0,12)+'...' : p.name,
          stock: p.currentStock
        })),
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
