import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  barcode: { type: String, required: true, unique: true, index: true },
  productName: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  sellingPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  taxRate: { type: Number, required: true, default: 13 }, // VAT percentage (0 or 13)
  description: { type: String },
  unit: { type: String, required: true, default: 'pcs' },
  reorderLevel: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Text index for fast searching
ProductSchema.index({ productName: 'text', category: 'text', barcode: 'text' });

export const Product = mongoose.model('Product', ProductSchema);
