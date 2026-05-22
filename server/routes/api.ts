import express from 'express';
import mongoose from 'mongoose';
import { protect, authorize } from '../middlewares/auth.js';
import { dbCheckMiddleware } from '../middlewares/dbCheck';
import * as userCtrl from '../controllers/userController.js';
import * as prodCtrl from '../controllers/productController.js';
import * as custCtrl from '../controllers/customerController.js';
import * as billCtrl from '../controllers/billingController.js';
import * as sysCtrl from '../controllers/systemController.js';
import { AppConfig } from '../models/AppConfig.js';
import { Transaction } from '../models/Transaction.js';

const router = express.Router();

// Apply DB check to all routes below this point
router.use((req, res, next) => {
    // Allow health check, root, login, checkout and all GET requests to bypass DB block for demo mode
    // Also allow POST /api/products and POST /api/customers for demo flow
    const isPublicOrDemo = req.path === '/health' || 
                          req.path === '/' || 
                          req.path === '/auth/login' || 
                          req.path === '/billing/checkout' ||
                          req.path.startsWith('/products') || 
                          req.path.startsWith('/customers') ||
                          req.path === '/system/seed' ||
                          req.path === '/config' ||
                          req.method === 'GET' ||
                          req.path.startsWith('/auth/register');
    
    if (isPublicOrDemo) return next();
    dbCheckMiddleware(req, res, next);
});

// Auth
router.post('/auth/register', userCtrl.registerUser);
router.post('/auth/login', userCtrl.loginUser);
router.get('/users', protect, authorize('Admin'), userCtrl.getUsers);

// Products
router.get('/products', protect, prodCtrl.getProducts);
router.get('/products/barcode/:barcode', protect, prodCtrl.getProductByBarcode);
router.post('/products', protect, authorize('Admin'), prodCtrl.createProduct);
router.put('/products/:id', protect, authorize('Admin'), prodCtrl.updateProduct);
router.delete('/products/:id', protect, authorize('Admin'), prodCtrl.deleteProduct);

// Customers
router.get('/customers', protect, custCtrl.getCustomers);
router.get('/customers/:phone', protect, custCtrl.getCustomerByPhone);
router.post('/customers', protect, custCtrl.createCustomer);

// Billing
router.post('/billing/checkout', protect, billCtrl.checkout);
router.get('/billing/transactions', protect, async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json(billCtrl.MOCK_TRANSACTIONS);
    }
    const transactions = await Transaction.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(transactions);
});

router.get('/billing/transactions/:id', protect, async (req, res) => {
    const { id } = req.params;
    if (mongoose.connection.readyState !== 1) {
        const mockTx = billCtrl.MOCK_TRANSACTIONS.find(tx => tx._id === id);
        if (mockTx) return res.json(mockTx);
        return res.status(404).json({ message: 'Transaction not found in offline transaction history' });
    }
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            const mockTx = billCtrl.MOCK_TRANSACTIONS.find(tx => tx._id === id);
            if (mockTx) return res.json(mockTx);
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (e: any) {
        const mockTx = billCtrl.MOCK_TRANSACTIONS.find(tx => tx._id === id);
        if (mockTx) return res.json(mockTx);
        res.status(500).json({ message: e.message });
    }
});

// Config
router.get('/config', async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json({
            martName: 'Namaste Mart',
            address: 'Kathmandu, Nepal',
            phone: '01-44455566',
            vatPercentage: 13,
            loyaltyConfig: { pointsPerNPR: 0.1 }
        });
    }
    let config = await AppConfig.findOne();
    if (!config) {
        config = await AppConfig.create({ martName: 'Namaste Mart' });
    }
    res.json(config);
});

router.put('/config', protect, authorize('Admin'), async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json({ ...req.body, message: 'Settings saved in temporary session only (Temporary Mode)' });
    }
    const config = await AppConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(config);
});

// Analytics
router.get('/analytics/sales', protect, authorize('Admin'), async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        const total = billCtrl.MOCK_TRANSACTIONS.reduce((acc, tx) => acc + tx.grandTotal, 0);
        const count = billCtrl.MOCK_TRANSACTIONS.length;
        return res.json({ total, count });
    }
    // Simple mock analytics
    const totalSales = await Transaction.aggregate([
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]);
    res.json(totalSales[0] || { total: 0, count: 0 });
});

// System
router.post('/system/seed', protect, authorize('Admin'), sysCtrl.seedDatabase);

// System / Health
router.get('/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API Documentation / Discoverability
router.get('/', (req, res) => {
    res.json({
        message: 'Namaste Mart API Gateway',
        version: '2.4.0',
        endpoints: {
            auth: ['POST /api/auth/login', 'POST /api/auth/register'],
            products: ['GET /api/products', 'GET /api/products/barcode/:barcode', 'POST /api/products'],
            customers: ['GET /api/customers', 'GET /api/customers/:phone', 'POST /api/customers'],
            billing: ['POST /api/billing/checkout', 'GET /api/billing/transactions'],
            config: ['GET /api/config', 'PUT /api/config'],
            system: ['GET /api/health']
        }
    });
});

export default router;
