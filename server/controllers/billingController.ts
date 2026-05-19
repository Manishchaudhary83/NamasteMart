import { Response, Request } from 'express';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Transaction } from '../models/Transaction.js';
import { AppConfig } from '../models/AppConfig.js';
import { AuditLog } from '../models/AuditLog.js';
import mongoose from 'mongoose';
import Decimal from 'decimal.js';
import { sendBillingSMS } from '../services/smsService.js';

export const checkout = async (req: any, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerPhone, paymentMode, paymentReferenceId, notes } = req.body;

    if (!items || items.length === 0) {
      throw new Error('No items in cart');
    }

    let subtotal = new Decimal(0);
    let totalVAT = new Decimal(0);
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product ${item.productName} not found`);
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.productName}. Available: ${product.stockQuantity}`);
      }

      // Atomic stock update
      product.stockQuantity -= item.quantity;
      await product.save({ session });

      const itemSubtotal = new Decimal(product.sellingPrice).mul(item.quantity);
      const itemVAT = itemSubtotal.mul(product.taxRate).div(100);
      
      subtotal = subtotal.plus(itemSubtotal);
      totalVAT = totalVAT.plus(itemVAT);

      processedItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        taxAmount: itemVAT.toNumber(),
        subtotal: itemSubtotal.toNumber()
      });
    }

    let customer = null;
    let loyaltyDiscount = new Decimal(0);
    if (customerPhone) {
      customer = await Customer.findOne({ phoneNumber: customerPhone }).session(session);
      if (customer) {
        // Apply tiered discounts
        if (customer.membershipTier === 'Silver') {
          loyaltyDiscount = subtotal.mul(0.05); // 5%
        } else if (customer.membershipTier === 'Gold') {
          loyaltyDiscount = subtotal.mul(0.10); // 10%
        }
      }
    }

    const grandTotal = subtotal.plus(totalVAT).minus(loyaltyDiscount).toDecimalPlaces(2);
    const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transaction = new Transaction({
      invoiceId,
      cashierId: req.user._id,
      customerId: customer?._id,
      customerPhone,
      items: processedItems,
      subtotal: subtotal.toNumber(),
      totalVAT: totalVAT.toNumber(),
      loyaltyDiscount: loyaltyDiscount.toNumber(),
      grandTotal: grandTotal.toNumber(),
      paymentMode,
      paymentReferenceId,
      paymentStatus: 'Completed',
      notes
    });

    await transaction.save({ session });

    if (customer) {
      const config = await AppConfig.findOne().session(session);
      const pointsEarned = grandTotal.mul(config?.loyaltyConfig?.pointsPerNPR || 0.01).floor();
      
      customer.loyaltyPoints += pointsEarned.toNumber();
      customer.totalSpent = new Decimal(customer.totalSpent).plus(grandTotal).toNumber();
      customer.purchaseHistory.push(transaction._id as any);

      // Auto-tier update
      if (customer.totalSpent > 100000 && customer.membershipTier !== 'Gold') {
        customer.membershipTier = 'Gold';
      } else if (customer.totalSpent > 25000 && customer.membershipTier === 'Regular') {
        customer.membershipTier = 'Silver';
      }

      await customer.save({ session });

      // Send SMS
      const smsMessage = `Dear ${customer.fullName}, thank you for shopping at Namaste Mart. Bill Amt: NPR ${grandTotal}. Invoice: ${invoiceId}. Points Earned: ${pointsEarned}. Total Points: ${customer.loyaltyPoints}.`;
      await sendBillingSMS(customer.phoneNumber, smsMessage);
    }

    await session.commitTransaction();
    session.endSession();

    // Broadcast stock update via socket (handled in route or socket utility)
    res.status(201).json({
      success: true,
      transaction,
      message: 'Checkout successful'
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
