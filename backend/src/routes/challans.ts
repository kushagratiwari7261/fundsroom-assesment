import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, requireRoles, AuthRequest } from '../middlewares/auth';
import { sendChallanEmail } from '../utils/email';

const router = Router();

router.use(authenticateToken);

// Generate unique challan number
const generateChallanNumber = async () => {
  const count = await prisma.challan.count();
  return `CHL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
};

// Create Challan
router.post('/', requireRoles(['ADMIN', 'SALES']), async (req: AuthRequest, res) => {
  try {
    const { customerId, items, status } = req.body;
    const userId = req.user.id;

    if (!customerId || typeof customerId !== 'string') return res.status(400).json({ error: 'Valid customer ID is required' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Challan must have at least one item' });
    }
    
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') return res.status(400).json({ error: 'Valid product ID is required for all items' });
      if (item.quantity == null || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) return res.status(400).json({ error: 'Valid quantity > 0 is required for all items' });
    }

    // Generate challan number BEFORE starting the transaction to prevent timeout
    const challanNumber = await generateChallanNumber();

    const challan = await prisma.$transaction(async (tx: any) => {
      let totalQuantity = 0;
      const challanItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);

        if (status === 'CONFIRMED' && product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        totalQuantity += item.quantity;
        challanItemsData.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productCategory: product.category,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
        });

        if (status === 'CONFIRMED') {
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity }
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Sales Challan`,
              createdBy: userId
            }
          });
        }
      }

      const newChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          status: status || 'DRAFT',
          totalQuantity,
          createdBy: userId,
          items: {
            create: challanItemsData
          }
        },
        include: { items: true }
      });

      return newChallan;
    });

    // Send Email to Customer if it's confirmed or generated
    try {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (customer && customer.email) {
        await sendChallanEmail(customer.email, customer.name, challan.challanNumber, items.length);
      }
    } catch (emailErr) {
      console.error('Failed to send Resend email:', emailErr);
    }

    res.status(201).json(challan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm Draft Challan
router.put('/:id/confirm', requireRoles(['ADMIN', 'SALES']), async (req: AuthRequest, res) => {
  try {
    const challanId = req.params.id;
    const userId = req.user.id;

    const confirmedChallan = await prisma.$transaction(async (tx: any) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      });

      if (!challan) throw new Error('Challan not found');
      if (challan.status !== 'DRAFT') throw new Error('Only draft challans can be confirmed');

      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found`);
        
        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: product.currentStock - item.quantity }
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Sales Challan ${challan.challanNumber}`,
            createdBy: userId
          }
        });
      }

      return tx.challan.update({
        where: { id: challanId },
        data: { status: 'CONFIRMED' }
      });
    });

    res.json(confirmedChallan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all challans
router.get('/', async (req, res) => {
  try {
    const challans = await prisma.challan.findMany({
      include: { customer: true, items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(challans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel Challan (Handles Draft and Confirmed)
router.put('/:id/cancel', requireRoles(['ADMIN', 'SALES']), async (req: AuthRequest, res) => {
  try {
    const challanId = req.params.id;
    const userId = req.user.id;

    const cancelledChallan = await prisma.$transaction(async (tx: any) => {
      const challan = await tx.challan.findUnique({ 
        where: { id: challanId },
        include: { items: true }
      });
      
      if (!challan) throw new Error('Challan not found');
      if (challan.status === 'CANCELLED') throw new Error('Challan is already cancelled');

      // If the challan was previously confirmed, we need to reverse the stock deduction
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            // Restore stock
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: product.currentStock + item.quantity }
            });

            // Log the 'IN' movement
            await tx.stockMovement.create({
              data: {
                productId: product.id,
                quantity: item.quantity,
                type: 'IN',
                reason: `Challan Cancelled: ${challan.challanNumber}`,
                createdBy: userId
              }
            });
          }
        }
      }

      return tx.challan.update({
        where: { id: challanId },
        data: { status: 'CANCELLED' }
      });
    });

    res.json(cancelledChallan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
