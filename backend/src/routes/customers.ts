import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, requireRoles } from '../middlewares/auth';
import { sendWelcomeEmail } from '../utils/email';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Create Customer
router.post('/', requireRoles(['ADMIN', 'SALES']), async (req, res) => {
  try {
    const { name, mobile, type, status } = req.body;
    
    // Strict Validation
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Customer Name is required and must be a string' });
    if (!mobile || typeof mobile !== 'string') return res.status(400).json({ error: 'Mobile number is required and must be a string' });
    if (!type || !['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(type)) return res.status(400).json({ error: 'Valid Customer Type is required' });
    if (status && !['LEAD', 'ACTIVE', 'INACTIVE'].includes(status)) return res.status(400).json({ error: 'Invalid status provided' });

    const customer = await prisma.customer.create({ data: req.body });
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: String(search), mode: 'insensitive' } },
          { mobile: { contains: String(search) } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ]
      };
    }
    const customers = await prisma.customer.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Customer
router.put('/:id', requireRoles(['ADMIN', 'SALES']), async (req, res) => {
  try {
    const { type, status } = req.body;
    
    // Strict Validation
    if (type && !['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'].includes(type)) return res.status(400).json({ error: 'Valid Customer Type is required' });
    if (status && !['LEAD', 'ACTIVE', 'INACTIVE'].includes(status)) return res.status(400).json({ error: 'Invalid status provided' });

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(customer);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Customer not found' });
    res.status(500).json({ error: error.message });
  }
});

export default router;
