import { Product } from '../models/Product.js';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

export const MOCK_PRODUCTS = [
  { _id: 'm1', productName: 'Aashirvaad Atta 5kg', barcode: '1000000000001', sellingPrice: 475, stockQuantity: 50, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm2', productName: 'Pokhareli Jino Rice 10kg', barcode: '1000000000002', sellingPrice: 1850, stockQuantity: 30, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
  { _id: 'm3', productName: 'Dhara Mustard Oil 1L', barcode: '1000000000003', sellingPrice: 285, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 10, taxRate: 13 },
  { _id: 'm4', productName: 'DDC Pure Ghee 1L', barcode: '1000000000006', sellingPrice: 1200, stockQuantity: 40, unit: 'tin', category: 'Dairy', reorderLevel: 5, taxRate: 0 },
  { _id: 'm5', productName: 'Tokla Gold Tea 500g', barcode: '1000000000010', sellingPrice: 450, stockQuantity: 80, unit: 'pcs', category: 'Tea', reorderLevel: 15, taxRate: 13 },
  { _id: 'm6', productName: 'Wai Wai Noodles (Case)', barcode: '1000000000015', sellingPrice: 240, stockQuantity: 100, unit: 'case', category: 'Snacks', reorderLevel: 10, taxRate: 13 },
  { _id: 'm7', productName: 'Coca Cola 2.25L', barcode: '1000000000013', sellingPrice: 270, stockQuantity: 90, unit: 'bottle', category: 'Beverages', reorderLevel: 20, taxRate: 13 }
];

export const resetMockProducts = () => {
    const initialProducts = [
      { _id: 'm1', productName: 'Aashirvaad Atta 5kg', barcode: '1000000000001', sellingPrice: 475, stockQuantity: 50, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
      { _id: 'm2', productName: 'Pokhareli Jino Rice 10kg', barcode: '1000000000002', sellingPrice: 1850, stockQuantity: 30, unit: 'bag', category: 'Staples', reorderLevel: 5, taxRate: 0 },
      { _id: 'm3', productName: 'Dhara Mustard Oil 1L', barcode: '1000000000003', sellingPrice: 285, stockQuantity: 100, unit: 'bottle', category: 'Staples', reorderLevel: 10, taxRate: 13 },
      { _id: 'm4', productName: 'DDC Pure Ghee 1L', barcode: '1000000000006', sellingPrice: 1200, stockQuantity: 40, unit: 'tin', category: 'Dairy', reorderLevel: 5, taxRate: 0 },
      { _id: 'm5', productName: 'Tokla Gold Tea 500g', barcode: '1000000000010', sellingPrice: 450, stockQuantity: 80, unit: 'pcs', category: 'Tea', reorderLevel: 15, taxRate: 13 },
      { _id: 'm6', productName: 'Wai Wai Noodles (Case)', barcode: '1000000000015', sellingPrice: 240, stockQuantity: 100, unit: 'case', category: 'Snacks', reorderLevel: 10, taxRate: 13 },
      { _id: 'm7', productName: 'Coca Cola 2.25L', barcode: '1000000000013', sellingPrice: 270, stockQuantity: 90, unit: 'bottle', category: 'Beverages', reorderLevel: 20, taxRate: 13 }
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
    return res.status(404).json({ message: 'Product not found in demo' });
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
    return res.status(201).json({ ...newProduct, message: 'Product added (Demo Mode)' });
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
        return res.json({ ...MOCK_PRODUCTS[index], message: 'Product updated (Demo Mode)' });
    }
    return res.status(404).json({ message: 'Product not found in demo' });
  }
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    const index = MOCK_PRODUCTS.findIndex(p => p._id === req.params.id);
    if (index !== -1) {
        MOCK_PRODUCTS.splice(index, 1);
    }
    return res.json({ message: 'Product removed (Demo Mode)' });
  }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product removed' });
};
