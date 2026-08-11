import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, requireRoles, AuthRequest } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

// Create Product
router.post('/', requireRoles(['ADMIN', 'WAREHOUSE']), async (req: AuthRequest, res) => {
  try {
    const { name, sku, category, unitPrice, currentStock, minStockAlert, location } = req.body;
    const userId = req.user.id;

    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Product name is required' });
    if (!sku || typeof sku !== 'string') return res.status(400).json({ error: 'SKU is required' });
    if (unitPrice == null || isNaN(Number(unitPrice)) || Number(unitPrice) < 0) return res.status(400).json({ error: 'Valid unit price is required' });
    if (currentStock == null || isNaN(Number(currentStock)) || Number(currentStock) < 0) return res.status(400).json({ error: 'Valid current stock is required' });

    // We do this in a transaction so we can also create the initial stock movement log
    const product = await prisma.$transaction(async (tx: any) => {
      const prod = await tx.product.create({
        data: { name, sku, category, unitPrice, currentStock, minStockAlert, location }
      });

      if (currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: prod.id,
            quantity: currentStock,
            type: 'IN',
            reason: 'Initial stock',
            createdBy: userId
          }
        });
      }
      return prod;
    });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Product
router.put('/:id', requireRoles(['ADMIN', 'WAREHOUSE']), async (req: AuthRequest, res) => {
  try {
    const { currentStock, reason, ...updateData } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (currentStock !== undefined && (isNaN(Number(currentStock)) || Number(currentStock) < 0)) {
      return res.status(400).json({ error: 'Valid current stock is required' });
    }

    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      const oldProduct = await tx.product.findUnique({ where: { id: productId } });
      if (!oldProduct) throw new Error('Product not found');

      let newStock = oldProduct.currentStock;
      
      // If stock is being updated, create a log
      if (currentStock !== undefined && currentStock !== oldProduct.currentStock) {
        const diff = currentStock - oldProduct.currentStock;
        const type = diff > 0 ? 'IN' : 'OUT';
        
        await tx.stockMovement.create({
          data: {
            productId,
            quantity: Math.abs(diff),
            type,
            reason: reason || 'Manual stock update',
            createdBy: userId
          }
        });
        newStock = currentStock;
      }

      return tx.product.update({
        where: { id: productId },
        data: { ...updateData, currentStock: newStock }
      });
    });

    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get product stock history
router.get('/:id/history', async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });
    res.json(movements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
