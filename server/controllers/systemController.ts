import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AppConfig } from '../models/AppConfig.js';
import { resetMockProducts, MOCK_PRODUCTS } from './productController.js';

export const seedDatabase = async (req: Request, res: Response) => {
    if (mongoose.connection.readyState !== 1) {
        resetMockProducts();
        return res.json({ 
            success: true, 
            message: 'Mock records initialized (Memory Only).',
            demo: true
        });
    }

    try {
        // Map from 100 premium MOCK_PRODUCTS, stripping out '_id' so auto-id is used by Mongo
        const nepaliProducts = MOCK_PRODUCTS.map(({ _id, ...p }) => ({
            productName: p.productName,
            barcode: p.barcode,
            category: p.category,
            sellingPrice: p.sellingPrice,
            stockQuantity: p.stockQuantity,
            taxRate: p.taxRate,
            unit: p.unit,
            reorderLevel: p.reorderLevel
        }));

        // Clean and Seed
        await Product.deleteMany({});
        await Product.insertMany(nepaliProducts);

        await User.deleteMany({ email: { $in: ['admin@namastemart.com', 'cashier@namastemart.com'] } });
        
        await User.create({
            fullName: 'System Admin',
            email: 'admin@namastemart.com',
            password: 'adminPass123',
            role: 'Admin'
        });

        await User.create({
            fullName: 'Mart Cashier',
            email: 'cashier@namastemart.com',
            password: 'cashierPass123',
            role: 'Cashier'
        });

        const configExists = await AppConfig.findOne();
        if (!configExists) {
            await AppConfig.create({
                martName: 'Namaste Mart',
                taxRegistrationNumber: 'VAT-123456789',
                address: 'Kathmandu, Nepal',
                phone: '+977-1-4444444'
            });
        }

        res.json({ success: true, message: 'Database initialized with core records.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
