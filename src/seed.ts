import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../server/models/Product';
import { AppConfig } from '../server/models/AppConfig';
import { User } from '../server/models/User';

dotenv.config();

const nepaliProducts = [
  // Staples
  { barcode: '1000000000001', productName: 'Aashirvaad Atta 5kg', category: 'Staples', sellingPrice: 475, stockQuantity: 50, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000002', productName: 'Pokhareli Jino Rice 10kg', category: 'Staples', sellingPrice: 1850, stockQuantity: 30, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000003', productName: 'Dhara Mustard Oil 1L', category: 'Staples', sellingPrice: 285, stockQuantity: 100, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000004', productName: 'Tata Salt 1kg', category: 'Staples', sellingPrice: 35, stockQuantity: 200, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000005', productName: 'Sugar 1kg', category: 'Staples', sellingPrice: 110, stockQuantity: 150, taxRate: 13, unit: 'kg' },
  // Dairy & Bakery
  { barcode: '1000000000006', productName: 'DDC Ghee 1L', category: 'Dairy & Bakery', sellingPrice: 1200, stockQuantity: 40, taxRate: 0, unit: 'tin' },
  { barcode: '1000000000007', productName: 'Amul Butter 500g', category: 'Dairy & Bakery', sellingPrice: 550, stockQuantity: 60, taxRate: 13, unit: 'brick' },
  { barcode: '1000000000008', productName: 'Nebico Malt N Malt Biscuits', category: 'Dairy & Bakery', sellingPrice: 25, stockQuantity: 100, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000009', productName: 'Standard Bread', category: 'Dairy & Bakery', sellingPrice: 65, stockQuantity: 20, taxRate: 0, unit: 'loaf' },
  // Beverages
  { barcode: '1000000000010', productName: 'Tokla Tea 500g', category: 'Beverages', sellingPrice: 450, stockQuantity: 80, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000011', productName: 'Real Juice Apple 1L', category: 'Beverages', sellingPrice: 230, stockQuantity: 120, taxRate: 13, unit: 'tetra' },
  { barcode: '1000000000012', productName: 'Red Bull 250ml', category: 'Beverages', sellingPrice: 180, stockQuantity: 50, taxRate: 13, unit: 'can' },
  { barcode: '1000000000013', productName: 'Coca Cola 2.25L', category: 'Beverages', sellingPrice: 270, stockQuantity: 90, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000014', productName: 'Mineral Water 1L', category: 'Beverages', sellingPrice: 20, stockQuantity: 300, taxRate: 13, unit: 'bottle' },
  // Packaged Foods
  { barcode: '1000000000015', productName: 'Wai Wai Chicken Noodles (12pcs)', category: 'Packaged Foods', sellingPrice: 240, stockQuantity: 100, taxRate: 13, unit: 'case' },
  { barcode: '1000000000016', productName: 'Current Hot & Spicy Noodles', category: 'Packaged Foods', sellingPrice: 50, stockQuantity: 150, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000017', productName: 'Maggi Noodles 70g', category: 'Packaged Foods', sellingPrice: 20, stockQuantity: 200, taxRate: 13, unit: 'packet' },
  // Cleaning & Household
  { barcode: '1000000000018', productName: 'Surf Excel 1kg', category: 'Household Cleansers', sellingPrice: 240, stockQuantity: 70, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000019', productName: 'Dettol Handwash Refill', category: 'Personal Care', sellingPrice: 195, stockQuantity: 90, taxRate: 13, unit: 'pouch' },
  { barcode: '1000000000020', productName: 'Colgate MaxFresh 150g', category: 'Personal Care', sellingPrice: 165, stockQuantity: 110, taxRate: 13, unit: 'box' },
];

// Generate more to reach 100
for (let i = 21; i <= 100; i++) {
  nepaliProducts.push({
    barcode: (1000000000000 + i).toString(),
    productName: `Product Item ${i}`,
    category: i % 5 === 0 ? 'Snacks' : (i % 3 === 0 ? 'Beveages' : 'Household'),
    sellingPrice: 100 + (i * 5),
    stockQuantity: 20 + i,
    taxRate: i % 7 === 0 ? 0 : 13,
    unit: 'pcs'
  });
}

const seed = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri || uri.trim() === "" || uri.includes('YOUR_MONGODB_URI')) {
      throw new Error('MONGODB_URI is missing or using a placeholder. Please check your environment variables.');
    }
    
    // Sanitize
    uri = uri.trim().replace(/^["'](.+)["']$/, '$1').trim();
    
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MONGODB_URI scheme. Must start with mongodb:// or mongodb+srv://');
    }

    await mongoose.connect(uri);
    
    await Product.deleteMany({});
    await Product.insertMany(nepaliProducts);

    const adminExists = await User.findOne({ email: 'admin@namastemart.com' });
    if (!adminExists) {
        await User.create({
            fullName: 'System Admin',
            email: 'admin@namastemart.com',
            password: 'AdminPassword123',
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

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
