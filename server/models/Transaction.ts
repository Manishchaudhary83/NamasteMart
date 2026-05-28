import mongoose, { Schema } from 'mongoose';

const TransactionSchema = new Schema({
  invoiceId: { type: String, required: true, unique: true, index: true },
  cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String },
  customerPhone: { type: String },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  totalVAT: { type: Number, required: true },
  loyaltyDiscount: { type: Number, default: 0 },
  manualDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMode: { type: String, enum: ['Cash', 'eSewa_QR', 'Card'], required: true },
  paymentReferenceId: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
  isPrinted: { type: Boolean, default: false },
  printCount: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

export const Transaction = mongoose.model('Transaction', TransactionSchema);
