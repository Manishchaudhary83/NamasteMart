import { Product } from '../models/Product.js';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

export const MOCK_PRODUCTS = [
  { _id: 'm1', productName: 'Aashirvaad Atta 5kg', barcode: '1000000000001', sellingPrice: 475, stockQuantity: 50, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm2', productName: 'Pokhareli Jino Rice 10kg', barcode: '1000000000002', sellingPrice: 1850, stockQuantity: 30, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm3', productName: 'Jeera Masino Rice 20kg', barcode: '1000000000003', sellingPrice: 2450, stockQuantity: 25, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm4', productName: 'Dhara Mustard Oil 1L', barcode: '1000000000004', sellingPrice: 285, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm5', productName: 'Tata Salt 1kg', barcode: '1000000000005', sellingPrice: 35, stockQuantity: 200, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm6', productName: 'Sugar 1kg', barcode: '1000000000006', sellingPrice: 110, stockQuantity: 150, unit: 'kg', category: 'Staples', reorderLevel: 20, taxRate: 13 },
  { _id: 'm7', productName: 'Fortune Soya Chunk 200g', barcode: '1000000000007', sellingPrice: 55, stockQuantity: 120, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm8', productName: 'Sona Mansuli Rice 25kg', barcode: '1000000000008', sellingPrice: 1950, stockQuantity: 40, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm9', productName: 'Musuro Dal (Red Lentils) 1kg', barcode: '1000000000009', sellingPrice: 160, stockQuantity: 85, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm10', productName: 'Mugi Dal (Moong) 1kg', barcode: '1000000000010', sellingPrice: 190, stockQuantity: 70, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm11', productName: 'Chana Dal (Gram) 1kg', barcode: '1000000000011', sellingPrice: 140, stockQuantity: 95, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm12', productName: 'Kabuli Chana (Chickpeas) 1kg', barcode: '1000000000012', sellingPrice: 210, stockQuantity: 60, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm13', productName: 'Maida (Refined Flour) 1kg', barcode: '1000000000013', sellingPrice: 85, stockQuantity: 110, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm14', productName: 'Suji (Semolina) 500g', barcode: '1000000000014', sellingPrice: 45, stockQuantity: 130, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm15', productName: 'Amrit Sunflower Oil 1L', barcode: '1000000000015', sellingPrice: 235, stockQuantity: 90, unit: 'bottle', category: 'Staples', reorderLevel: 12, taxRate: 13 },
  { _id: 'm16', productName: 'Fortune Soyabean Oil 1L', barcode: '1000000000016', sellingPrice: 215, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 12, taxRate: 13 },
  { _id: 'm17', productName: 'Basmati Rice Premium 5kg', barcode: '1000000000017', sellingPrice: 1100, stockQuantity: 35, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm18', productName: 'Bhutanese Red Rice 1kg', barcode: '1000000000018', sellingPrice: 320, stockQuantity: 25, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm19', productName: 'Dry Peas (Kerao) 1kg', barcode: '1000000000019', sellingPrice: 130, stockQuantity: 140, unit: 'kg', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm20', productName: 'Black Lentil (Maas Dal) 1kg', barcode: '1000000000020', sellingPrice: 180, stockQuantity: 75, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm21', productName: 'Kwati Mix Beans 1kg', barcode: '1000000000021', sellingPrice: 175, stockQuantity: 80, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm22', productName: 'Besan (Gram Flour) 1kg', barcode: '1000000000022', sellingPrice: 150, stockQuantity: 90, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm23', productName: 'Saffola Gold Oil 1L', barcode: '1000000000023', sellingPrice: 295, stockQuantity: 65, unit: 'bottle', category: 'Staples', reorderLevel: 8, taxRate: 13 },
  { _id: 'm24', productName: 'Aarati Mustard Oil 1L', barcode: '1000000000024', sellingPrice: 260, stockQuantity: 80, unit: 'bottle', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm25', productName: 'Hulas Chiura (Beaten Rice) 1kg', barcode: '1000000000025', sellingPrice: 115, stockQuantity: 110, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm26', productName: 'Century Turmeric Powder 100g', barcode: '1000000000026', sellingPrice: 50, stockQuantity: 200, unit: 'packet', category: 'Staples', reorderLevel: 25, taxRate: 0 },
  { _id: 'm27', productName: 'Century Coriander Powder 100g', barcode: '1000000000027', sellingPrice: 55, stockQuantity: 180, unit: 'packet', category: 'Staples', reorderLevel: 25, taxRate: 0 },
  { _id: 'm28', productName: 'Century Cumin Powder 100g', barcode: '1000000000028', sellingPrice: 95, stockQuantity: 150, unit: 'packet', category: 'Staples', reorderLevel: 20, taxRate: 0 },
  { _id: 'm29', productName: 'Century Garam Masala 100g', barcode: '1000000000029', sellingPrice: 120, stockQuantity: 90, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 13 },
  { _id: 'm30', productName: 'Century Meat Masala 100g', barcode: '1000000000030', sellingPrice: 90, stockQuantity: 120, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 13 },
  { _id: 'm31', productName: 'Century Chicken Masala 100g', barcode: '1000000000031', sellingPrice: 85, stockQuantity: 110, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 13 },
  { _id: 'm32', productName: 'Century Chilli Powder 100g', barcode: '1000000000032', sellingPrice: 65, stockQuantity: 140, unit: 'packet', category: 'Staples', reorderLevel: 20, taxRate: 0 },
  { _id: 'm33', productName: 'Catch Black Salt 100g', barcode: '1000000000033', sellingPrice: 40, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm34', productName: 'Everest Kitchen King Masala 100g', barcode: '1000000000034', sellingPrice: 110, stockQuantity: 80, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm35', productName: 'Everest Chhole Masala 100g', barcode: '1000000000035', sellingPrice: 105, stockQuantity: 75, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm36', productName: 'Catch Hing (Asafoetida) 25g', barcode: '1000000000036', sellingPrice: 75, stockQuantity: 130, unit: 'container', category: 'Staples', reorderLevel: 20, taxRate: 13 },
  { _id: 'm37', productName: 'Whole Cumin Seeds (Jeera) 200g', barcode: '1000000000037', sellingPrice: 290, stockQuantity: 95, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm38', productName: 'Whole Coriander Seeds 200g', barcode: '1000000000038', sellingPrice: 110, stockQuantity: 105, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm39', productName: 'Century Mustard Seeds 200g', barcode: '1000000000039', sellingPrice: 80, stockQuantity: 120, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm40', productName: 'Century Kasuri Methi 50g', barcode: '1000000000040', sellingPrice: 60, stockQuantity: 90, unit: 'box', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm41', productName: 'DDC Ghee 1L', barcode: '1000000000041', sellingPrice: 1200, stockQuantity: 40, unit: 'tin', category: 'Dairy & Bakery', reorderLevel: 8, taxRate: 0 },
  { _id: 'm42', productName: 'Amul Butter 500g', barcode: '1000000000042', sellingPrice: 550, stockQuantity: 60, unit: 'brick', category: 'Dairy & Bakery', reorderLevel: 10, taxRate: 13 },
  { _id: 'm43', productName: 'Nebico Malt N Malt Biscuits', barcode: '1000000000043', sellingPrice: 25, stockQuantity: 100, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 15, taxRate: 13 },
  { _id: 'm44', productName: 'Standard Bread', barcode: '1000000000044', sellingPrice: 65, stockQuantity: 20, unit: 'loaf', category: 'Dairy & Bakery', reorderLevel: 5, taxRate: 0 },
  { _id: 'm45', productName: 'DDC Paneer 200g', barcode: '1000000000045', sellingPrice: 195, stockQuantity: 30, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 6, taxRate: 0 },
  { _id: 'm46', productName: 'Amul Cheese Slices 200g', barcode: '1000000000046', sellingPrice: 260, stockQuantity: 45, unit: 'box', category: 'Dairy & Bakery', reorderLevel: 8, taxRate: 13 },
  { _id: 'm47', productName: 'DDC Yak Cheese 250g', barcode: '1000000000047', sellingPrice: 450, stockQuantity: 25, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 5, taxRate: 0 },
  { _id: 'm48', productName: 'Britannia Marie Gold 250g', barcode: '1000000000048', sellingPrice: 50, stockQuantity: 140, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 20, taxRate: 13 },
  { _id: 'm49', productName: 'Nebico Coconut Biscuits 75g', barcode: '1000000000049', sellingPrice: 20, stockQuantity: 160, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 25, taxRate: 13 },
  { _id: 'm50', productName: 'Bourbon Biscuits 120g', barcode: '1000000000050', sellingPrice: 45, stockQuantity: 125, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 20, taxRate: 13 },
  { _id: 'm51', productName: 'Good Day Cashew Cookies', barcode: '1000000000051', sellingPrice: 35, stockQuantity: 150, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 20, taxRate: 13 },
  { _id: 'm52', productName: 'Amul Mithai Mate 400g', barcode: '1000000000052', sellingPrice: 220, stockQuantity: 50, unit: 'tin', category: 'Dairy & Bakery', reorderLevel: 10, taxRate: 13 },
  { _id: 'm53', productName: 'Brown Bread Premium', barcode: '1000000000053', sellingPrice: 80, stockQuantity: 15, unit: 'loaf', category: 'Dairy & Bakery', reorderLevel: 5, taxRate: 0 },
  { _id: 'm54', productName: 'Britannia Bread Toast (Rusk)', barcode: '1000000000054', sellingPrice: 70, stockQuantity: 80, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 15, taxRate: 13 },
  { _id: 'm55', productName: 'DDC Sweet Curd (Dahi) 500ml', barcode: '1000000000055', sellingPrice: 95, stockQuantity: 25, unit: 'cup', category: 'Dairy & Bakery', reorderLevel: 8, taxRate: 0 },
  { _id: 'm56', productName: 'Tokla Tea 500g', barcode: '1000000000056', sellingPrice: 450, stockQuantity: 80, unit: 'packet', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm57', productName: 'Real Juice Apple 1L', barcode: '1000000000057', sellingPrice: 230, stockQuantity: 120, unit: 'tetra', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm58', productName: 'Red Bull 250ml', barcode: '1000000000058', sellingPrice: 180, stockQuantity: 50, unit: 'can', category: 'Beverages', reorderLevel: 10, taxRate: 13 },
  { _id: 'm59', productName: 'Coca Cola 2.25L', barcode: '1000000000059', sellingPrice: 270, stockQuantity: 90, unit: 'bottle', category: 'Beverages', reorderLevel: 20, taxRate: 13 },
  { _id: 'm60', productName: 'Mineral Water 1L', barcode: '1000000000060', sellingPrice: 20, stockQuantity: 300, unit: 'bottle', category: 'Beverages', reorderLevel: 50, taxRate: 13 },
  { _id: 'm61', productName: 'Fanta Orange 2.25L', barcode: '1000000000061', sellingPrice: 270, stockQuantity: 80, unit: 'bottle', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm62', productName: 'Sprite Lychee 2.25L', barcode: '1000000000062', sellingPrice: 270, stockQuantity: 75, unit: 'bottle', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm63', productName: 'Nescafe Classic Coffee 50g', barcode: '1000000000063', sellingPrice: 195, stockQuantity: 60, unit: 'jar', category: 'Beverages', reorderLevel: 12, taxRate: 13 },
  { _id: 'm64', productName: 'Horlicks Classic Malt 500g', barcode: '1000000000064', sellingPrice: 425, stockQuantity: 40, unit: 'bottle', category: 'Beverages', reorderLevel: 8, taxRate: 13 },
  { _id: 'm65', productName: 'Bournvita Chocolate Drink', barcode: '1000000000065', sellingPrice: 395, stockQuantity: 35, unit: 'jar', category: 'Beverages', reorderLevel: 8, taxRate: 13 },
  { _id: 'm66', productName: 'Frooti Mango Drink 250ml', barcode: '1000000000066', sellingPrice: 40, stockQuantity: 150, unit: 'tetra', category: 'Beverages', reorderLevel: 25, taxRate: 13 },
  { _id: 'm67', productName: 'Real Juice Mixed Fruit 1L', barcode: '1000000000067', sellingPrice: 230, stockQuantity: 95, unit: 'tetra', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm68', productName: 'Appy Fizz 250ml', barcode: '1000000000068', sellingPrice: 45, stockQuantity: 110, unit: 'bottle', category: 'Beverages', reorderLevel: 20, taxRate: 13 },
  { _id: 'm69', productName: 'Lipton Green Tea 25 Bags', barcode: '1000000000069', sellingPrice: 195, stockQuantity: 55, unit: 'box', category: 'Beverages', reorderLevel: 10, taxRate: 13 },
  { _id: 'm70', productName: 'Red Label Tea Leaf 250g', barcode: '1000000000070', sellingPrice: 210, stockQuantity: 85, unit: 'packet', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm71', productName: 'Wai Wai Chicken Noodles (Case)', barcode: '1000000000071', sellingPrice: 240, stockQuantity: 100, unit: 'case', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm72', productName: 'Current Hot & Spicy Noodles', barcode: '1000000000072', sellingPrice: 50, stockQuantity: 150, unit: 'packet', category: 'Packaged Foods', reorderLevel: 20, taxRate: 13 },
  { _id: 'm73', productName: 'Maggi Noodles 70g', barcode: '1000000000073', sellingPrice: 20, stockQuantity: 200, unit: 'packet', category: 'Packaged Foods', reorderLevel: 30, taxRate: 13 },
  { _id: 'm74', productName: 'Lay’s Potato Chips Classic 50g', barcode: '1000000000074', sellingPrice: 50, stockQuantity: 120, unit: 'packet', category: 'Packaged Foods', reorderLevel: 25, taxRate: 13 },
  { _id: 'm75', productName: 'Kurkure Masala Munch 90g', barcode: '1000000000075', sellingPrice: 50, stockQuantity: 130, unit: 'packet', category: 'Packaged Foods', reorderLevel: 25, taxRate: 13 },
  { _id: 'm76', productName: 'Haldiram Bhujia Sev 150g', barcode: '1000000000076', sellingPrice: 95, stockQuantity: 110, unit: 'packet', category: 'Packaged Foods', reorderLevel: 20, taxRate: 13 },
  { _id: 'm77', productName: 'Haldiram Kaju Katli 250g', barcode: '1000000000077', sellingPrice: 480, stockQuantity: 40, unit: 'box', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm78', productName: 'Knorr Tomato Soup 50g', barcode: '1000000000078', sellingPrice: 55, stockQuantity: 95, unit: 'packet', category: 'Packaged Foods', reorderLevel: 15, taxRate: 13 },
  { _id: 'm79', productName: 'Heinz Tomato Ketchup 500g', barcode: '1000000000079', sellingPrice: 220, stockQuantity: 65, unit: 'bottle', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm80', productName: 'FunFoods Mayonnaise 250g', barcode: '1000000000080', sellingPrice: 145, stockQuantity: 70, unit: 'jar', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm81', productName: 'Chocos Corn flakes 300g', barcode: '1000000000081', sellingPrice: 210, stockQuantity: 50, unit: 'box', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm82', productName: 'Kelloggs Oats 1kg', barcode: '1000000000082', sellingPrice: 340, stockQuantity: 45, unit: 'packet', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm83', productName: 'Premium Mixed Fruit Jam 500g', barcode: '1000000000083', sellingPrice: 240, stockQuantity: 60, unit: 'jar', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm84', productName: 'Hershey Chocolate Syrup 650g', barcode: '1000000000084', sellingPrice: 395, stockQuantity: 30, unit: 'bottle', category: 'Packaged Foods', reorderLevel: 5, taxRate: 13 },
  { _id: 'm85', productName: 'Wai Wai Quick Veg Pizza 75g', barcode: '1000000000085', sellingPrice: 20, stockQuantity: 180, unit: 'packet', category: 'Packaged Foods', reorderLevel: 25, taxRate: 13 },
  { _id: 'm86', productName: 'Surf Excel 1kg', barcode: '1000000000086', sellingPrice: 240, stockQuantity: 70, unit: 'packet', category: 'Household Cleansers', reorderLevel: 15, taxRate: 13 },
  { _id: 'm87', productName: 'Vim Dishwash Bar 135g', barcode: '1000000000087', sellingPrice: 25, stockQuantity: 250, unit: 'block', category: 'Household Cleansers', reorderLevel: 40, taxRate: 13 },
  { _id: 'm88', productName: 'Harpic Active Fresh 500ml', barcode: '1000000000088', sellingPrice: 130, stockQuantity: 80, unit: 'bottle', category: 'Household Cleansers', reorderLevel: 15, taxRate: 13 },
  { _id: 'm89', productName: 'Colin Glass Cleaner 500ml', barcode: '1000000000089', sellingPrice: 145, stockQuantity: 50, unit: 'spray', category: 'Household Cleansers', reorderLevel: 10, taxRate: 13 },
  { _id: 'm90', productName: 'Lizol Floor Cleaner 500ml', barcode: '1000000000090', sellingPrice: 165, stockQuantity: 75, unit: 'bottle', category: 'Household Cleansers', reorderLevel: 15, taxRate: 13 },
  { _id: 'm91', productName: 'Comfort Fabric Conditioner', barcode: '1000000000091', sellingPrice: 75, stockQuantity: 110, unit: 'pouch', category: 'Household Cleansers', reorderLevel: 20, taxRate: 13 },
  { _id: 'm92', productName: 'Rin Detergent Powder 1kg', barcode: '1000000000092', sellingPrice: 130, stockQuantity: 100, unit: 'packet', category: 'Household Cleansers', reorderLevel: 20, taxRate: 13 },
  { _id: 'm93', productName: 'Dettol Disinfectant Liquid 500ml', barcode: '1000000000093', sellingPrice: 365, stockQuantity: 40, unit: 'bottle', category: 'Household Cleansers', reorderLevel: 10, taxRate: 13 },
  { _id: 'm94', productName: 'Dettol Handwash Refill 175ml', barcode: '1000000000094', sellingPrice: 95, stockQuantity: 90, unit: 'pouch', category: 'Personal Care', reorderLevel: 20, taxRate: 13 },
  { _id: 'm95', productName: 'Colgate MaxFresh Toothpaste 150g', barcode: '1000000000095', sellingPrice: 165, stockQuantity: 110, unit: 'box', category: 'Personal Care', reorderLevel: 15, taxRate: 13 },
  { _id: 'm96', productName: 'Clinic Plus Shampoo 175ml', barcode: '1000000000096', sellingPrice: 130, stockQuantity: 95, unit: 'bottle', category: 'Personal Care', reorderLevel: 15, taxRate: 13 },
  { _id: 'm97', productName: 'Dove Cream Beauty Bathing Bar', barcode: '1000000000097', sellingPrice: 85, stockQuantity: 120, unit: 'soap', category: 'Personal Care', reorderLevel: 20, taxRate: 13 },
  { _id: 'm98', productName: 'Pears Pure and Gentle Soap 75g', barcode: '1000000000098', sellingPrice: 65, stockQuantity: 140, unit: 'soap', category: 'Personal Care', reorderLevel: 20, taxRate: 13 },
  { _id: 'm99', productName: 'Parachute Coconut Oil 200ml', barcode: '1000000000099', sellingPrice: 110, stockQuantity: 80, unit: 'bottle', category: 'Personal Care', reorderLevel: 15, taxRate: 13 },
  { _id: 'm100', productName: 'Sensodyne Rapid Relief 80g', barcode: '1000000000100', sellingPrice: 195, stockQuantity: 70, unit: 'box', category: 'Personal Care', reorderLevel: 12, taxRate: 13 }
];

export const resetMockProducts = () => {
    const initialProducts = [
  { _id: 'm1', productName: 'Aashirvaad Atta 5kg', barcode: '1000000000001', sellingPrice: 475, stockQuantity: 50, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm2', productName: 'Pokhareli Jino Rice 10kg', barcode: '1000000000002', sellingPrice: 1850, stockQuantity: 30, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm3', productName: 'Jeera Masino Rice 20kg', barcode: '1000000000003', sellingPrice: 2450, stockQuantity: 25, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm4', productName: 'Dhara Mustard Oil 1L', barcode: '1000000000004', sellingPrice: 285, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm5', productName: 'Tata Salt 1kg', barcode: '1000000000005', sellingPrice: 35, stockQuantity: 200, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm6', productName: 'Sugar 1kg', barcode: '1000000000006', sellingPrice: 110, stockQuantity: 150, unit: 'kg', category: 'Staples', reorderLevel: 20, taxRate: 13 },
  { _id: 'm7', productName: 'Fortune Soya Chunk 200g', barcode: '1000000000007', sellingPrice: 55, stockQuantity: 120, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm8', productName: 'Sona Mansuli Rice 25kg', barcode: '1000000000008', sellingPrice: 1950, stockQuantity: 40, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm9', productName: 'Musuro Dal (Red Lentils) 1kg', barcode: '1000000000009', sellingPrice: 160, stockQuantity: 85, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm10', productName: 'Mugi Dal (Moong) 1kg', barcode: '1000000000010', sellingPrice: 190, stockQuantity: 70, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm11', productName: 'Chana Dal (Gram) 1kg', barcode: '1000000000011', sellingPrice: 140, stockQuantity: 95, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm12', productName: 'Kabuli Chana (Chickpeas) 1kg', barcode: '1000000000012', sellingPrice: 210, stockQuantity: 60, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm13', productName: 'Maida (Refined Flour) 1kg', barcode: '1000000000013', sellingPrice: 85, stockQuantity: 110, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm14', productName: 'Suji (Semolina) 500g', barcode: '1000000000014', sellingPrice: 45, stockQuantity: 130, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm15', productName: 'Amrit Sunflower Oil 1L', barcode: '1000000000015', sellingPrice: 235, stockQuantity: 90, unit: 'bottle', category: 'Staples', reorderLevel: 12, taxRate: 13 },
  { _id: 'm16', productName: 'Fortune Soyabean Oil 1L', barcode: '1000000000016', sellingPrice: 215, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 12, taxRate: 13 },
  { _id: 'm17', productName: 'Basmati Rice Premium 5kg', barcode: '1000000000017', sellingPrice: 1100, stockQuantity: 35, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm18', productName: 'Bhutanese Red Rice 1kg', barcode: '1000000000018', sellingPrice: 320, stockQuantity: 25, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm19', productName: 'Dry Peas (Kerao) 1kg', barcode: '1000000000019', sellingPrice: 130, stockQuantity: 140, unit: 'kg', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm20', productName: 'Black Lentil (Maas Dal) 1kg', barcode: '1000000000020', sellingPrice: 180, stockQuantity: 75, unit: 'kg', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm21', productName: 'Kwati Mix Beans 1kg', barcode: '1000000000021', sellingPrice: 175, stockQuantity: 80, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 0 },
  { _id: 'm22', productName: 'Besan (Gram Flour) 1kg', barcode: '1000000000022', sellingPrice: 150, stockQuantity: 90, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm23', productName: 'Saffola Gold Oil 1L', barcode: '1000000000023', sellingPrice: 295, stockQuantity: 65, unit: 'bottle', category: 'Staples', reorderLevel: 8, taxRate: 13 },
  { _id: 'm24', productName: 'Aarati Mustard Oil 1L', barcode: '1000000000024', sellingPrice: 260, stockQuantity: 80, unit: 'bottle', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm25', productName: 'Hulas Chiura (Beaten Rice) 1kg', barcode: '1000000000025', sellingPrice: 115, stockQuantity: 110, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm26', productName: 'Century Turmeric Powder 100g', barcode: '1000000000026', sellingPrice: 50, stockQuantity: 200, unit: 'packet', category: 'Staples', reorderLevel: 25, taxRate: 0 },
  { _id: 'm27', productName: 'Century Coriander Powder 100g', barcode: '1000000000027', sellingPrice: 55, stockQuantity: 180, unit: 'packet', category: 'Staples', reorderLevel: 25, taxRate: 0 },
  { _id: 'm28', productName: 'Century Cumin Powder 100g', barcode: '1000000000028', sellingPrice: 95, stockQuantity: 150, unit: 'packet', category: 'Staples', reorderLevel: 20, taxRate: 0 },
  { _id: 'm29', productName: 'Century Garam Masala 100g', barcode: '1000000000029', sellingPrice: 120, stockQuantity: 90, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 13 },
  { _id: 'm30', productName: 'Century Meat Masala 100g', barcode: '1000000000030', sellingPrice: 90, stockQuantity: 120, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 13 },
  { _id: 'm31', productName: 'Century Chicken Masala 100g', barcode: '1000000000031', sellingPrice: 85, stockQuantity: 110, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 13 },
  { _id: 'm32', productName: 'Century Chilli Powder 100g', barcode: '1000000000032', sellingPrice: 65, stockQuantity: 140, unit: 'packet', category: 'Staples', reorderLevel: 20, taxRate: 0 },
  { _id: 'm33', productName: 'Catch Black Salt 100g', barcode: '1000000000033', sellingPrice: 40, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm34', productName: 'Everest Kitchen King Masala 100g', barcode: '1000000000034', sellingPrice: 110, stockQuantity: 80, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm35', productName: 'Everest Chhole Masala 100g', barcode: '1000000000035', sellingPrice: 105, stockQuantity: 75, unit: 'packet', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm36', productName: 'Catch Hing (Asafoetida) 25g', barcode: '1000000000036', sellingPrice: 75, stockQuantity: 130, unit: 'container', category: 'Staples', reorderLevel: 20, taxRate: 13 },
  { _id: 'm37', productName: 'Whole Cumin Seeds (Jeera) 200g', barcode: '1000000000037', sellingPrice: 290, stockQuantity: 95, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm38', productName: 'Whole Coriander Seeds 200g', barcode: '1000000000038', sellingPrice: 110, stockQuantity: 105, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm39', productName: 'Century Mustard Seeds 200g', barcode: '1000000000039', sellingPrice: 80, stockQuantity: 120, unit: 'packet', category: 'Staples', reorderLevel: 15, taxRate: 0 },
  { _id: 'm40', productName: 'Century Kasuri Methi 50g', barcode: '1000000000040', sellingPrice: 60, stockQuantity: 90, unit: 'box', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm41', productName: 'DDC Ghee 1L', barcode: '1000000000041', sellingPrice: 1200, stockQuantity: 40, unit: 'tin', category: 'Dairy & Bakery', reorderLevel: 8, taxRate: 0 },
  { _id: 'm42', productName: 'Amul Butter 500g', barcode: '1000000000042', sellingPrice: 550, stockQuantity: 60, unit: 'brick', category: 'Dairy & Bakery', reorderLevel: 10, taxRate: 13 },
  { _id: 'm43', productName: 'Nebico Malt N Malt Biscuits', barcode: '1000000000043', sellingPrice: 25, stockQuantity: 100, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 15, taxRate: 13 },
  { _id: 'm44', productName: 'Standard Bread', barcode: '1000000000044', sellingPrice: 65, stockQuantity: 20, unit: 'loaf', category: 'Dairy & Bakery', reorderLevel: 5, taxRate: 0 },
  { _id: 'm45', productName: 'DDC Paneer 200g', barcode: '1000000000045', sellingPrice: 195, stockQuantity: 30, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 6, taxRate: 0 },
  { _id: 'm46', productName: 'Amul Cheese Slices 200g', barcode: '1000000000046', sellingPrice: 260, stockQuantity: 45, unit: 'box', category: 'Dairy & Bakery', reorderLevel: 8, taxRate: 13 },
  { _id: 'm47', productName: 'DDC Yak Cheese 250g', barcode: '1000000000047', sellingPrice: 450, stockQuantity: 25, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 5, taxRate: 0 },
  { _id: 'm48', productName: 'Britannia Marie Gold 250g', barcode: '1000000000048', sellingPrice: 50, stockQuantity: 140, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 20, taxRate: 13 },
  { _id: 'm49', productName: 'Nebico Coconut Biscuits 75g', barcode: '1000000000049', sellingPrice: 20, stockQuantity: 160, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 25, taxRate: 13 },
  { _id: 'm50', productName: 'Bourbon Biscuits 120g', barcode: '1000000000050', sellingPrice: 45, stockQuantity: 125, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 20, taxRate: 13 },
  { _id: 'm51', productName: 'Good Day Cashew Cookies', barcode: '1000000000051', sellingPrice: 35, stockQuantity: 150, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 20, taxRate: 13 },
  { _id: 'm52', productName: 'Amul Mithai Mate 400g', barcode: '1000000000052', sellingPrice: 220, stockQuantity: 50, unit: 'tin', category: 'Dairy & Bakery', reorderLevel: 10, taxRate: 13 },
  { _id: 'm53', productName: 'Brown Bread Premium', barcode: '1000000000053', sellingPrice: 80, stockQuantity: 15, unit: 'loaf', category: 'Dairy & Bakery', reorderLevel: 5, taxRate: 0 },
  { _id: 'm54', productName: 'Britannia Bread Toast (Rusk)', barcode: '1000000000054', sellingPrice: 70, stockQuantity: 80, unit: 'packet', category: 'Dairy & Bakery', reorderLevel: 15, taxRate: 13 },
  { _id: 'm55', productName: 'DDC Sweet Curd (Dahi) 500ml', barcode: '1000000000055', sellingPrice: 95, stockQuantity: 25, unit: 'cup', category: 'Dairy & Bakery', reorderLevel: 8, taxRate: 0 },
  { _id: 'm56', productName: 'Tokla Tea 500g', barcode: '1000000000056', sellingPrice: 450, stockQuantity: 80, unit: 'packet', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm57', productName: 'Real Juice Apple 1L', barcode: '1000000000057', sellingPrice: 230, stockQuantity: 120, unit: 'tetra', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm58', productName: 'Red Bull 250ml', barcode: '1000000000058', sellingPrice: 180, stockQuantity: 50, unit: 'can', category: 'Beverages', reorderLevel: 10, taxRate: 13 },
  { _id: 'm59', productName: 'Coca Cola 2.25L', barcode: '1000000000059', sellingPrice: 270, stockQuantity: 90, unit: 'bottle', category: 'Beverages', reorderLevel: 20, taxRate: 13 },
  { _id: 'm60', productName: 'Mineral Water 1L', barcode: '1000000000060', sellingPrice: 20, stockQuantity: 300, unit: 'bottle', category: 'Beverages', reorderLevel: 50, taxRate: 13 },
  { _id: 'm61', productName: 'Fanta Orange 2.25L', barcode: '1000000000061', sellingPrice: 270, stockQuantity: 80, unit: 'bottle', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm62', productName: 'Sprite Lychee 2.25L', barcode: '1000000000062', sellingPrice: 270, stockQuantity: 75, unit: 'bottle', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm63', productName: 'Nescafe Classic Coffee 50g', barcode: '1000000000063', sellingPrice: 195, stockQuantity: 60, unit: 'jar', category: 'Beverages', reorderLevel: 12, taxRate: 13 },
  { _id: 'm64', productName: 'Horlicks Classic Malt 500g', barcode: '1000000000064', sellingPrice: 425, stockQuantity: 40, unit: 'bottle', category: 'Beverages', reorderLevel: 8, taxRate: 13 },
  { _id: 'm65', productName: 'Bournvita Chocolate Drink', barcode: '1000000000065', sellingPrice: 395, stockQuantity: 35, unit: 'jar', category: 'Beverages', reorderLevel: 8, taxRate: 13 },
  { _id: 'm66', productName: 'Frooti Mango Drink 250ml', barcode: '1000000000066', sellingPrice: 40, stockQuantity: 150, unit: 'tetra', category: 'Beverages', reorderLevel: 25, taxRate: 13 },
  { _id: 'm67', productName: 'Real Juice Mixed Fruit 1L', barcode: '1000000000067', sellingPrice: 230, stockQuantity: 95, unit: 'tetra', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm68', productName: 'Appy Fizz 250ml', barcode: '1000000000068', sellingPrice: 45, stockQuantity: 110, unit: 'bottle', category: 'Beverages', reorderLevel: 20, taxRate: 13 },
  { _id: 'm69', productName: 'Lipton Green Tea 25 Bags', barcode: '1000000000069', sellingPrice: 195, stockQuantity: 55, unit: 'box', category: 'Beverages', reorderLevel: 10, taxRate: 13 },
  { _id: 'm70', productName: 'Red Label Tea Leaf 250g', barcode: '1000000000070', sellingPrice: 210, stockQuantity: 85, unit: 'packet', category: 'Beverages', reorderLevel: 15, taxRate: 13 },
  { _id: 'm71', productName: 'Wai Wai Chicken Noodles (Case)', barcode: '1000000000071', sellingPrice: 240, stockQuantity: 100, unit: 'case', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm72', productName: 'Current Hot & Spicy Noodles', barcode: '1000000000072', sellingPrice: 50, stockQuantity: 150, unit: 'packet', category: 'Packaged Foods', reorderLevel: 20, taxRate: 13 },
  { _id: 'm73', productName: 'Maggi Noodles 70g', barcode: '1000000000073', sellingPrice: 20, stockQuantity: 200, unit: 'packet', category: 'Packaged Foods', reorderLevel: 30, taxRate: 13 },
  { _id: 'm74', productName: 'Lay’s Potato Chips Classic 50g', barcode: '1000000000074', sellingPrice: 50, stockQuantity: 120, unit: 'packet', category: 'Packaged Foods', reorderLevel: 25, taxRate: 13 },
  { _id: 'm75', productName: 'Kurkure Masala Munch 90g', barcode: '1000000000075', sellingPrice: 50, stockQuantity: 130, unit: 'packet', category: 'Packaged Foods', reorderLevel: 25, taxRate: 13 },
  { _id: 'm76', productName: 'Haldiram Bhujia Sev 150g', barcode: '1000000000076', sellingPrice: 95, stockQuantity: 110, unit: 'packet', category: 'Packaged Foods', reorderLevel: 20, taxRate: 13 },
  { _id: 'm77', productName: 'Haldiram Kaju Katli 250g', barcode: '1000000000077', sellingPrice: 480, stockQuantity: 40, unit: 'box', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm78', productName: 'Knorr Tomato Soup 50g', barcode: '1000000000078', sellingPrice: 55, stockQuantity: 95, unit: 'packet', category: 'Packaged Foods', reorderLevel: 15, taxRate: 13 },
  { _id: 'm79', productName: 'Heinz Tomato Ketchup 500g', barcode: '1000000000079', sellingPrice: 220, stockQuantity: 65, unit: 'bottle', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm80', productName: 'FunFoods Mayonnaise 250g', barcode: '1000000000080', sellingPrice: 145, stockQuantity: 70, unit: 'jar', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm81', productName: 'Chocos Corn flakes 300g', barcode: '1000000000081', sellingPrice: 210, stockQuantity: 50, unit: 'box', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm82', productName: 'Kelloggs Oats 1kg', barcode: '1000000000082', sellingPrice: 340, stockQuantity: 45, unit: 'packet', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm83', productName: 'Premium Mixed Fruit Jam 500g', barcode: '1000000000083', sellingPrice: 240, stockQuantity: 60, unit: 'jar', category: 'Packaged Foods', reorderLevel: 10, taxRate: 13 },
  { _id: 'm84', productName: 'Hershey Chocolate Syrup 650g', barcode: '1000000000084', sellingPrice: 395, stockQuantity: 30, unit: 'bottle', category: 'Packaged Foods', reorderLevel: 5, taxRate: 13 },
  { _id: 'm85', productName: 'Wai Wai Quick Veg Pizza 75g', barcode: '1000000000085', sellingPrice: 20, stockQuantity: 180, unit: 'packet', category: 'Packaged Foods', reorderLevel: 25, taxRate: 13 },
  { _id: 'm86', productName: 'Surf Excel 1kg', barcode: '1000000000086', sellingPrice: 240, stockQuantity: 70, unit: 'packet', category: 'Household Cleansers', reorderLevel: 15, taxRate: 13 },
  { _id: 'm87', productName: 'Vim Dishwash Bar 135g', barcode: '1000000000087', sellingPrice: 25, stockQuantity: 250, unit: 'block', category: 'Household Cleansers', reorderLevel: 40, taxRate: 13 },
  { _id: 'm88', productName: 'Harpic Active Fresh 500ml', barcode: '1000000000088', sellingPrice: 130, stockQuantity: 80, unit: 'bottle', category: 'Household Cleansers', reorderLevel: 15, taxRate: 13 },
  { _id: 'm89', productName: 'Colin Glass Cleaner 500ml', barcode: '1000000000089', sellingPrice: 145, stockQuantity: 50, unit: 'spray', category: 'Household Cleansers', reorderLevel: 10, taxRate: 13 },
  { _id: 'm90', productName: 'Lizol Floor Cleaner 500ml', barcode: '1000000000090', sellingPrice: 165, stockQuantity: 75, unit: 'bottle', category: 'Household Cleansers', reorderLevel: 15, taxRate: 13 },
  { _id: 'm91', productName: 'Comfort Fabric Conditioner', barcode: '1000000000091', sellingPrice: 75, stockQuantity: 110, unit: 'pouch', category: 'Household Cleansers', reorderLevel: 20, taxRate: 13 },
  { _id: 'm92', productName: 'Rin Detergent Powder 1kg', barcode: '1000000000092', sellingPrice: 130, stockQuantity: 100, unit: 'packet', category: 'Household Cleansers', reorderLevel: 20, taxRate: 13 },
  { _id: 'm93', productName: 'Dettol Disinfectant Liquid 500ml', barcode: '1000000000093', sellingPrice: 365, stockQuantity: 40, unit: 'bottle', category: 'Household Cleansers', reorderLevel: 10, taxRate: 13 },
  { _id: 'm94', productName: 'Dettol Handwash Refill 175ml', barcode: '1000000000094', sellingPrice: 95, stockQuantity: 90, unit: 'pouch', category: 'Personal Care', reorderLevel: 20, taxRate: 13 },
  { _id: 'm95', productName: 'Colgate MaxFresh Toothpaste 150g', barcode: '1000000000095', sellingPrice: 165, stockQuantity: 110, unit: 'box', category: 'Personal Care', reorderLevel: 15, taxRate: 13 },
  { _id: 'm96', productName: 'Clinic Plus Shampoo 175ml', barcode: '1000000000096', sellingPrice: 130, stockQuantity: 95, unit: 'bottle', category: 'Personal Care', reorderLevel: 15, taxRate: 13 },
  { _id: 'm97', productName: 'Dove Cream Beauty Bathing Bar', barcode: '1000000000097', sellingPrice: 85, stockQuantity: 120, unit: 'soap', category: 'Personal Care', reorderLevel: 20, taxRate: 13 },
  { _id: 'm98', productName: 'Pears Pure and Gentle Soap 75g', barcode: '1000000000098', sellingPrice: 65, stockQuantity: 140, unit: 'soap', category: 'Personal Care', reorderLevel: 20, taxRate: 13 },
  { _id: 'm99', productName: 'Parachute Coconut Oil 200ml', barcode: '1000000000099', sellingPrice: 110, stockQuantity: 80, unit: 'bottle', category: 'Personal Care', reorderLevel: 15, taxRate: 13 },
  { _id: 'm100', productName: 'Sensodyne Rapid Relief 80g', barcode: '1000000000100', sellingPrice: 195, stockQuantity: 70, unit: 'box', category: 'Personal Care', reorderLevel: 12, taxRate: 13 }
];
MOCK_PRODUCTS.splice(0, MOCK_PRODUCTS.length, ...initialProducts);
};

export const getProducts = async (req: Request, res: Response) => {
  const { search } = req.query;
  
  if (mongoose.connection.readyState !== 1) {
    if (search) {
        return res.json(MOCK_PRODUCTS.filter(p => 
            p.productName.toLowerCase().includes((search as string).toLowerCase()) || 
            p.barcode.includes(search as string)
        ));
    }
    return res.json(MOCK_PRODUCTS);
  }

  let query = {};
  if (search) {
    query = { 
      $or: [
        { productName: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ]
    };
  }
  const products = await Product.find(query).sort({ updatedAt: -1 });
  res.json(products);
};

export const getProductByBarcode = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    const product = MOCK_PRODUCTS.find(p => p.barcode === req.params.barcode);
    if (product) return res.json(product);
    return res.status(404).json({ message: 'Product not found in offline catalog fallback' });
  }
  const product = await Product.findOne({ barcode: req.params.barcode });
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    if (!req.body.productName || !req.body.barcode) {
        return res.status(400).json({ message: 'Missing required product information' });
    }
    
    // Check duplicates in mock
    const exists = MOCK_PRODUCTS.find(p => p.barcode === req.body.barcode);
    if (exists) {
        return res.status(400).json({ message: `Product with barcode ${req.body.barcode} already exists` });
    }

    const newProduct = { 
        ...req.body, 
        _id: `demo_${Date.now()}`, 
        sellingPrice: Number(req.body.sellingPrice || 0),
        stockQuantity: Number(req.body.stockQuantity || 0),
        reorderLevel: Number(req.body.reorderLevel || 10),
        taxRate: Number(req.body.taxRate || 13),
        updatedAt: new Date()
    };
    MOCK_PRODUCTS.unshift(newProduct as any);
    return res.status(201).json({ ...newProduct, message: 'Product added (Offline Cache)' });
  }
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    const index = MOCK_PRODUCTS.findIndex(p => p._id === req.params.id);
    if (index !== -1) {
        const updatedFields = {
            ...req.body,
            sellingPrice: req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : MOCK_PRODUCTS[index].sellingPrice,
            stockQuantity: req.body.stockQuantity !== undefined ? Number(req.body.stockQuantity) : MOCK_PRODUCTS[index].stockQuantity,
            reorderLevel: req.body.reorderLevel !== undefined ? Number(req.body.reorderLevel) : MOCK_PRODUCTS[index].reorderLevel,
            taxRate: req.body.taxRate !== undefined ? Number(req.body.taxRate) : MOCK_PRODUCTS[index].taxRate,
            updatedAt: new Date()
        };
        MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...updatedFields };
        return res.json({ ...MOCK_PRODUCTS[index], message: 'Product updated (Offline Cache)' });
    }
    return res.status(404).json({ message: 'Product not found in offline catalog fallback' });
  }
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      const index = MOCK_PRODUCTS.findIndex(p => p._id === req.params.id);
      if (index !== -1) {
          MOCK_PRODUCTS.splice(index, 1);
          return res.json({ message: 'Product removed (Offline Cache)' });
      }
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ message: 'Invalid Product Identification format structure.' });
      }
    }
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found in database records.' });
    }
    res.json({ message: 'Product removed' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
