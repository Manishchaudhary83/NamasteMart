import mongoose, { Schema } from 'mongoose';

const AppConfigSchema = new Schema({
  martName: { type: String, required: true, default: 'Namaste Mart' },
  martLogo: { type: String },
  taxRegistrationNumber: { type: String },
  address: { type: String },
  phone: { type: String },
  esewaMerchantCode: { type: String },
  esewaSecretKey: { type: String },
  vatPercentage: { type: Number, default: 13 },
  loyaltyConfig: {
    pointsPerNPR: { type: Number, default: 0.01 }, // 1 point for every 100 NPR
    redemptionRate: { type: Number, default: 1 } // 1 point = 1 NPR
  },
  receiptFooterText: { type: String, default: 'Thank you for shopping with us!' }
}, { timestamps: true });

export const AppConfig = mongoose.model('AppConfig', AppConfigSchema);
