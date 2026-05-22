import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../server/models/Product';
import { AppConfig } from '../server/models/AppConfig';
import { User } from '../server/models/User';

dotenv.config();

const nepaliProducts = [
  { barcode: '1000000000001', productName: 'Aashirvaad Atta 5kg', category: 'Staples', sellingPrice: 475, stockQuantity: 50, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000002', productName: 'Pokhareli Jino Rice 10kg', category: 'Staples', sellingPrice: 1850, stockQuantity: 30, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000003', productName: 'Jeera Masino Rice 20kg', category: 'Staples', sellingPrice: 2450, stockQuantity: 25, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000004', productName: 'Dhara Mustard Oil 1L', category: 'Staples', sellingPrice: 285, stockQuantity: 100, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000005', productName: 'Tata Salt 1kg', category: 'Staples', sellingPrice: 35, stockQuantity: 200, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000006', productName: 'Sugar 1kg', category: 'Staples', sellingPrice: 110, stockQuantity: 150, taxRate: 13, unit: 'kg' },
  { barcode: '1000000000007', productName: 'Fortune Soya Chunk 200g', category: 'Staples', sellingPrice: 55, stockQuantity: 120, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000008', productName: 'Sona Mansuli Rice 25kg', category: 'Staples', sellingPrice: 1950, stockQuantity: 40, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000009', productName: 'Musuro Dal (Red Lentils) 1kg', category: 'Staples', sellingPrice: 160, stockQuantity: 85, taxRate: 0, unit: 'kg' },
  { barcode: '1000000000010', productName: 'Mugi Dal (Moong) 1kg', category: 'Staples', sellingPrice: 190, stockQuantity: 70, taxRate: 0, unit: 'kg' },
  { barcode: '1000000000011', productName: 'Chana Dal (Gram) 1kg', category: 'Staples', sellingPrice: 140, stockQuantity: 95, taxRate: 0, unit: 'kg' },
  { barcode: '1000000000012', productName: 'Kabuli Chana (Chickpeas) 1kg', category: 'Staples', sellingPrice: 210, stockQuantity: 60, taxRate: 0, unit: 'kg' },
  { barcode: '1000000000013', productName: 'Maida (Refined Flour) 1kg', category: 'Staples', sellingPrice: 85, stockQuantity: 110, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000014', productName: 'Suji (Semolina) 500g', category: 'Staples', sellingPrice: 45, stockQuantity: 130, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000015', productName: 'Amrit Sunflower Oil 1L', category: 'Staples', sellingPrice: 235, stockQuantity: 90, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000016', productName: 'Fortune Soyabean Oil 1L', category: 'Staples', sellingPrice: 215, stockQuantity: 100, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000017', productName: 'Basmati Rice Premium 5kg', category: 'Staples', sellingPrice: 1100, stockQuantity: 35, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000018', productName: 'Bhutanese Red Rice 1kg', category: 'Staples', sellingPrice: 320, stockQuantity: 25, taxRate: 0, unit: 'bag' },
  { barcode: '1000000000019', productName: 'Dry Peas (Kerao) 1kg', category: 'Staples', sellingPrice: 130, stockQuantity: 140, taxRate: 0, unit: 'kg' },
  { barcode: '1000000000020', productName: 'Black Lentil (Maas Dal) 1kg', category: 'Staples', sellingPrice: 180, stockQuantity: 75, taxRate: 0, unit: 'kg' },
  { barcode: '1000000000021', productName: 'Kwati Mix Beans 1kg', category: 'Staples', sellingPrice: 175, stockQuantity: 80, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000022', productName: 'Besan (Gram Flour) 1kg', category: 'Staples', sellingPrice: 150, stockQuantity: 90, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000023', productName: 'Saffola Gold Oil 1L', category: 'Staples', sellingPrice: 295, stockQuantity: 65, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000024', productName: 'Aarati Mustard Oil 1L', category: 'Staples', sellingPrice: 260, stockQuantity: 80, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000025', productName: 'Hulas Chiura (Beaten Rice) 1kg', category: 'Staples', sellingPrice: 115, stockQuantity: 110, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000026', productName: 'Century Turmeric Powder 100g', category: 'Staples', sellingPrice: 50, stockQuantity: 200, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000027', productName: 'Century Coriander Powder 100g', category: 'Staples', sellingPrice: 55, stockQuantity: 180, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000028', productName: 'Century Cumin Powder 100g', category: 'Staples', sellingPrice: 95, stockQuantity: 150, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000029', productName: 'Century Garam Masala 100g', category: 'Staples', sellingPrice: 120, stockQuantity: 90, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000030', productName: 'Century Meat Masala 100g', category: 'Staples', sellingPrice: 90, stockQuantity: 120, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000031', productName: 'Century Chicken Masala 100g', category: 'Staples', sellingPrice: 85, stockQuantity: 110, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000032', productName: 'Century Chilli Powder 100g', category: 'Staples', sellingPrice: 65, stockQuantity: 140, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000033', productName: 'Catch Black Salt 100g', category: 'Staples', sellingPrice: 40, stockQuantity: 100, taxRate: 0, unit: 'bottle' },
  { barcode: '1000000000034', productName: 'Everest Kitchen King Masala 100g', category: 'Staples', sellingPrice: 110, stockQuantity: 80, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000035', productName: 'Everest Chhole Masala 100g', category: 'Staples', sellingPrice: 105, stockQuantity: 75, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000036', productName: 'Catch Hing (Asafoetida) 25g', category: 'Staples', sellingPrice: 75, stockQuantity: 130, taxRate: 13, unit: 'container' },
  { barcode: '1000000000037', productName: 'Whole Cumin Seeds (Jeera) 200g', category: 'Staples', sellingPrice: 290, stockQuantity: 95, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000038', productName: 'Whole Coriander Seeds 200g', category: 'Staples', sellingPrice: 110, stockQuantity: 105, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000039', productName: 'Century Mustard Seeds 200g', category: 'Staples', sellingPrice: 80, stockQuantity: 120, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000040', productName: 'Century Kasuri Methi 50g', category: 'Staples', sellingPrice: 60, stockQuantity: 90, taxRate: 13, unit: 'box' },
  { barcode: '1000000000041', productName: 'DDC Ghee 1L', category: 'Dairy & Bakery', sellingPrice: 1200, stockQuantity: 40, taxRate: 0, unit: 'tin' },
  { barcode: '1000000000042', productName: 'Amul Butter 500g', category: 'Dairy & Bakery', sellingPrice: 550, stockQuantity: 60, taxRate: 13, unit: 'brick' },
  { barcode: '1000000000043', productName: 'Nebico Malt N Malt Biscuits', category: 'Dairy & Bakery', sellingPrice: 25, stockQuantity: 100, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000044', productName: 'Standard Bread', category: 'Dairy & Bakery', sellingPrice: 65, stockQuantity: 20, taxRate: 0, unit: 'loaf' },
  { barcode: '1000000000045', productName: 'DDC Paneer 200g', category: 'Dairy & Bakery', sellingPrice: 195, stockQuantity: 30, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000046', productName: 'Amul Cheese Slices 200g', category: 'Dairy & Bakery', sellingPrice: 260, stockQuantity: 45, taxRate: 13, unit: 'box' },
  { barcode: '1000000000047', productName: 'DDC Yak Cheese 250g', category: 'Dairy & Bakery', sellingPrice: 450, stockQuantity: 25, taxRate: 0, unit: 'packet' },
  { barcode: '1000000000048', productName: 'Britannia Marie Gold 250g', category: 'Dairy & Bakery', sellingPrice: 50, stockQuantity: 140, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000049', productName: 'Nebico Coconut Biscuits 75g', category: 'Dairy & Bakery', sellingPrice: 20, stockQuantity: 160, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000050', productName: 'Bourbon Biscuits 120g', category: 'Dairy & Bakery', sellingPrice: 45, stockQuantity: 125, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000051', productName: 'Good Day Cashew Cookies', category: 'Dairy & Bakery', sellingPrice: 35, stockQuantity: 150, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000052', productName: 'Amul Mithai Mate 400g', category: 'Dairy & Bakery', sellingPrice: 220, stockQuantity: 50, taxRate: 13, unit: 'tin' },
  { barcode: '1000000000053', productName: 'Brown Bread Premium', category: 'Dairy & Bakery', sellingPrice: 80, stockQuantity: 15, taxRate: 0, unit: 'loaf' },
  { barcode: '1000000000054', productName: 'Britannia Bread Toast (Rusk)', category: 'Dairy & Bakery', sellingPrice: 70, stockQuantity: 80, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000055', productName: 'DDC Sweet Curd (Dahi) 500ml', category: 'Dairy & Bakery', sellingPrice: 95, stockQuantity: 25, taxRate: 0, unit: 'cup' },
  { barcode: '1000000000056', productName: 'Tokla Tea 500g', category: 'Beverages', sellingPrice: 450, stockQuantity: 80, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000057', productName: 'Real Juice Apple 1L', category: 'Beverages', sellingPrice: 230, stockQuantity: 120, taxRate: 13, unit: 'tetra' },
  { barcode: '1000000000058', productName: 'Red Bull 250ml', category: 'Beverages', sellingPrice: 180, stockQuantity: 50, taxRate: 13, unit: 'can' },
  { barcode: '1000000000059', productName: 'Coca Cola 2.25L', category: 'Beverages', sellingPrice: 270, stockQuantity: 90, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000060', productName: 'Mineral Water 1L', category: 'Beverages', sellingPrice: 20, stockQuantity: 300, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000061', productName: 'Fanta Orange 2.25L', category: 'Beverages', sellingPrice: 270, stockQuantity: 80, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000062', productName: 'Sprite Lychee 2.25L', category: 'Beverages', sellingPrice: 270, stockQuantity: 75, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000063', productName: 'Nescafe Classic Coffee 50g', category: 'Beverages', sellingPrice: 195, stockQuantity: 60, taxRate: 13, unit: 'jar' },
  { barcode: '1000000000064', productName: 'Horlicks Classic Malt 500g', category: 'Beverages', sellingPrice: 425, stockQuantity: 40, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000065', productName: 'Bournvita Chocolate Drink', category: 'Beverages', sellingPrice: 395, stockQuantity: 35, taxRate: 13, unit: 'jar' },
  { barcode: '1000000000066', productName: 'Frooti Mango Drink 250ml', category: 'Beverages', sellingPrice: 40, stockQuantity: 150, taxRate: 13, unit: 'tetra' },
  { barcode: '1000000000067', productName: 'Real Juice Mixed Fruit 1L', category: 'Beverages', sellingPrice: 230, stockQuantity: 95, taxRate: 13, unit: 'tetra' },
  { barcode: '1000000000068', productName: 'Appy Fizz 250ml', category: 'Beverages', sellingPrice: 45, stockQuantity: 110, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000069', productName: 'Lipton Green Tea 25 Bags', category: 'Beverages', sellingPrice: 195, stockQuantity: 55, taxRate: 13, unit: 'box' },
  { barcode: '1000000000070', productName: 'Red Label Tea Leaf 250g', category: 'Beverages', sellingPrice: 210, stockQuantity: 85, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000071', productName: 'Wai Wai Chicken Noodles (Case)', category: 'Packaged Foods', sellingPrice: 240, stockQuantity: 100, taxRate: 13, unit: 'case' },
  { barcode: '1000000000072', productName: 'Current Hot & Spicy Noodles', category: 'Packaged Foods', sellingPrice: 50, stockQuantity: 150, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000073', productName: 'Maggi Noodles 70g', category: 'Packaged Foods', sellingPrice: 20, stockQuantity: 200, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000074', productName: 'Lay’s Potato Chips Classic 50g', category: 'Packaged Foods', sellingPrice: 50, stockQuantity: 120, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000075', productName: 'Kurkure Masala Munch 90g', category: 'Packaged Foods', sellingPrice: 50, stockQuantity: 130, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000076', productName: 'Haldiram Bhujia Sev 150g', category: 'Packaged Foods', sellingPrice: 95, stockQuantity: 110, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000077', productName: 'Haldiram Kaju Katli 250g', category: 'Packaged Foods', sellingPrice: 480, stockQuantity: 40, taxRate: 13, unit: 'box' },
  { barcode: '1000000000078', productName: 'Knorr Tomato Soup 50g', category: 'Packaged Foods', sellingPrice: 55, stockQuantity: 95, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000079', productName: 'Heinz Tomato Ketchup 500g', category: 'Packaged Foods', sellingPrice: 220, stockQuantity: 65, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000080', productName: 'FunFoods Mayonnaise 250g', category: 'Packaged Foods', sellingPrice: 145, stockQuantity: 70, taxRate: 13, unit: 'jar' },
  { barcode: '1000000000081', productName: 'Chocos Corn flakes 300g', category: 'Packaged Foods', sellingPrice: 210, stockQuantity: 50, taxRate: 13, unit: 'box' },
  { barcode: '1000000000082', productName: 'Kelloggs Oats 1kg', category: 'Packaged Foods', sellingPrice: 340, stockQuantity: 45, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000083', productName: 'Premium Mixed Fruit Jam 500g', category: 'Packaged Foods', sellingPrice: 240, stockQuantity: 60, taxRate: 13, unit: 'jar' },
  { barcode: '1000000000084', productName: 'Hershey Chocolate Syrup 650g', category: 'Packaged Foods', sellingPrice: 395, stockQuantity: 30, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000085', productName: 'Wai Wai Quick Veg Pizza 75g', category: 'Packaged Foods', sellingPrice: 20, stockQuantity: 180, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000086', productName: 'Surf Excel 1kg', category: 'Household Cleansers', sellingPrice: 240, stockQuantity: 70, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000087', productName: 'Vim Dishwash Bar 135g', category: 'Household Cleansers', sellingPrice: 25, stockQuantity: 250, taxRate: 13, unit: 'block' },
  { barcode: '1000000000088', productName: 'Harpic Active Fresh 500ml', category: 'Household Cleansers', sellingPrice: 130, stockQuantity: 80, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000089', productName: 'Colin Glass Cleaner 500ml', category: 'Household Cleansers', sellingPrice: 145, stockQuantity: 50, taxRate: 13, unit: 'spray' },
  { barcode: '1000000000090', productName: 'Lizol Floor Cleaner 500ml', category: 'Household Cleansers', sellingPrice: 165, stockQuantity: 75, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000091', productName: 'Comfort Fabric Conditioner', category: 'Household Cleansers', sellingPrice: 75, stockQuantity: 110, taxRate: 13, unit: 'pouch' },
  { barcode: '1000000000092', productName: 'Rin Detergent Powder 1kg', category: 'Household Cleansers', sellingPrice: 130, stockQuantity: 100, taxRate: 13, unit: 'packet' },
  { barcode: '1000000000093', productName: 'Dettol Disinfectant Liquid 500ml', category: 'Household Cleansers', sellingPrice: 365, stockQuantity: 40, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000094', productName: 'Dettol Handwash Refill 175ml', category: 'Personal Care', sellingPrice: 95, stockQuantity: 90, taxRate: 13, unit: 'pouch' },
  { barcode: '1000000000095', productName: 'Colgate MaxFresh Toothpaste 150g', category: 'Personal Care', sellingPrice: 165, stockQuantity: 110, taxRate: 13, unit: 'box' },
  { barcode: '1000000000096', productName: 'Clinic Plus Shampoo 175ml', category: 'Personal Care', sellingPrice: 130, stockQuantity: 95, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000097', productName: 'Dove Cream Beauty Bathing Bar', category: 'Personal Care', sellingPrice: 85, stockQuantity: 120, taxRate: 13, unit: 'soap' },
  { barcode: '1000000000098', productName: 'Pears Pure and Gentle Soap 75g', category: 'Personal Care', sellingPrice: 65, stockQuantity: 140, taxRate: 13, unit: 'soap' },
  { barcode: '1000000000099', productName: 'Parachute Coconut Oil 200ml', category: 'Personal Care', sellingPrice: 110, stockQuantity: 80, taxRate: 13, unit: 'bottle' },
  { barcode: '1000000000100', productName: 'Sensodyne Rapid Relief 80g', category: 'Personal Care', sellingPrice: 195, stockQuantity: 70, taxRate: 13, unit: 'box' }
];

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
