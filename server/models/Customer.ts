import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  membershipTier: { type: String, enum: ['Regular', 'Silver', 'Gold'], default: 'Regular' },
  loyaltyPoints: { type: Number, default: 0 },
  purchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

export const Customer = mongoose.model('Customer', CustomerSchema);
