import { Product } from '../models/Product.js';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

export const getProducts = async (req: Request, res: Response) => {
  const searchVal = req.query.search ? String(req.query.search).trim() : '';
  
  let query = {};
  if (searchVal) {
    query = { 
      $or: [
        { productName: { $regex: searchVal, $options: 'i' } },
        { barcode: { $regex: searchVal, $options: 'i' } }
      ]
    };
  }
  const products = await Product.find(query).sort({ updatedAt: -1 });
  res.json(products);
};

export const getProductByBarcode = async (req: Request, res: Response) => {
  const product = await Product.findOne({ barcode: req.params.barcode });
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product removed' });
};
