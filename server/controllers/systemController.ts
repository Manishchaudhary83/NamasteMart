import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AppConfig } from '../models/AppConfig.js';
import { resetMockProducts } from './productController.js';

export const seedDatabase = async (req: Request, res: Response) => {
    if (mongoose.connection.readyState !== 1) {
        resetMockProducts();
        return res.json({ 
            success: true, 
            message: 'Demo records initialized (Memory Only).',
            demo: true
        });
    }

    try {
        // Sample Products from seed script
        const nepaliProducts = [
            { barcode: '1000000000001', productName: 'Aashirvaad Atta 5kg', category: 'Staples', sellingPrice: 475, stockQuantity: 50, taxRate: 0, unit: 'bag' },
            { barcode: '1000000000002', productName: 'Pokhareli Jino Rice 10kg', category: 'Staples', sellingPrice: 1850, stockQuantity: 30, taxRate: 0, unit: 'bag' },
            { barcode: '1000000000003', productName: 'Dhara Mustard Oil 1L', category: 'Staples', sellingPrice: 285, stockQuantity: 100, taxRate: 13, unit: 'bottle' },
            { barcode: '1000000000004', productName: 'Tata Salt 1kg', category: 'Staples', sellingPrice: 35, stockQuantity: 200, taxRate: 0, unit: 'packet' },
            { barcode: '1000000000005', productName: 'Sugar 1kg', category: 'Staples', sellingPrice: 110, stockQuantity: 150, taxRate: 13, unit: 'kg' },
            { barcode: '1000000000006', productName: 'DDC Ghee 1L', category: 'Dairy & Bakery', sellingPrice: 1200, stockQuantity: 40, taxRate: 0, unit: 'tin' },
            { barcode: '1000000000010', productName: 'Tokla Tea 500g', category: 'Beverages', sellingPrice: 450, stockQuantity: 80, taxRate: 13, unit: 'packet' },
            { barcode: '1000000000013', productName: 'Coca Cola 2.25L', category: 'Beverages', sellingPrice: 270, stockQuantity: 90, taxRate: 13, unit: 'bottle' },
            { barcode: '1000000000015', productName: 'Wai Wai Chicken Noodles', category: 'Packaged Foods', sellingPrice: 20, stockQuantity: 100, taxRate: 13, unit: 'packet' },
        ];

        // Clean and Seed
        await Product.deleteMany({});
        await Product.insertMany(nepaliProducts);

        const adminExists = await User.findOne({ email: 'admin@namastemart.com' });
        if (!adminExists) {
            await User.create({
                fullName: 'System Admin',
                email: 'admin@namastemart.com',
                password: 'password123',
                role: 'Admin'
            });
        }

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
