import { Response, Request } from 'express';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Transaction } from '../models/Transaction.js';
import { AppConfig } from '../models/AppConfig.js';
import { AuditLog } from '../models/AuditLog.js';
import mongoose from 'mongoose';
import Decimal from 'decimal.js';
import { sendBillingSMS } from '../services/smsService.js';
import { MOCK_PRODUCTS } from './productController.js';
import { MOCK_CUSTOMERS } from './customerController.js';

export const MOCK_TRANSACTIONS = [
    { 
        _id: 't1', 
        invoiceId: 'INV-1001', 
        grandTotal: 1450, 
        subtotal: 1283.18,
        totalVAT: 166.82,
        paymentMode: 'Cash', 
        paymentStatus: 'Completed', 
        items: [
            { productName: 'Sample Item 1', quantity: 2, unitPrice: 500, subtotal: 1000 },
            { productName: 'Sample Item 2', quantity: 1, unitPrice: 283.18, subtotal: 283.18 }
        ],
        customerName: 'Cash Customer',
        createdAt: new Date(Date.now() - 86400000) 
    },
    { 
        _id: 't2', 
        invoiceId: 'INV-1002', 
        grandTotal: 250, 
        subtotal: 221.24,
        totalVAT: 28.76,
        paymentMode: 'eSewa', 
        paymentStatus: 'Completed', 
        items: [
            { productName: 'Small Snack', quantity: 5, unitPrice: 44.25, subtotal: 221.24 }
        ],
        customerName: 'Walk-in Customer',
        createdAt: new Date(Date.now() - 3600000) 
    }
];

export const checkout = async (req: any, res: Response) => {
  // DEMO MODE BYPASS
  if (mongoose.connection.readyState !== 1) {
      // Update Mock Stock
      req.body.items.forEach((item: any) => {
          const product = MOCK_PRODUCTS.find(p => p._id === item.productId);
          if (product) {
              product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          }
      });

      const sub = req.body.items.reduce((acc: number, item: any) => {
          const taxRate = item.taxRate ?? 13;
          const basePrice = (item.unitPrice || 100) / (1 + taxRate / 100);
          return acc + (item.quantity * basePrice);
      }, 0);
      const vat = req.body.items.reduce((acc: number, item: any) => {
          const taxRate = item.taxRate ?? 13;
          const basePrice = (item.unitPrice || 100) / (1 + taxRate / 100);
          return acc + (item.quantity * basePrice * (taxRate / 100));
      }, 0);
      const manualDisc = Number(req.body.manualDiscount || 0);
      const loyaltyDisc = req.body.loyaltyDiscount || 0;
      const total = Math.max(0, sub + vat - loyaltyDisc - manualDisc);

      const demoTransaction = {
          _id: `demo_tx_${Date.now()}`,
          invoiceId: `INV-${Date.now()}`,
          grandTotal: total,
          subtotal: sub,
          totalVAT: vat,
          loyaltyDiscount: loyaltyDisc,
          manualDiscount: manualDisc,
          paymentMode: req.body.paymentMode,
          paymentStatus: 'Completed',
          items: req.body.items.map((item: any) => {
              const taxRate = item.taxRate ?? 13;
              const basePrice = (item.unitPrice || 100) / (1 + taxRate / 100);
              const subtotalVal = basePrice * item.quantity;
              const taxVal = subtotalVal * (taxRate / 100);
              return {
                  ...item,
                  unitPrice: basePrice,
                  subtotal: subtotalVal,
                  taxAmount: taxVal
              };
          }),
          createdAt: new Date(),
          customerPhone: req.body.customerPhone,
          customerName: req.body.customerName || 'Walk-in'
      };

      // UPDATE OFFLINE CUSTOMER POINTS & SPENT & TIER
      const mockCust = MOCK_CUSTOMERS.find(c => c.phoneNumber === req.body.customerPhone);
      if (mockCust) {
          let multiplier = 1.0;
          if (mockCust.membershipTier === 'Silver') multiplier = 1.5;
          else if (mockCust.membershipTier === 'Gold') multiplier = 2.0;

          // Standard baseline points: 1% of total (pointsPerNPR = 0.01)
          const earnedPoints = Math.floor(total * 0.01 * multiplier);
          mockCust.loyaltyPoints = (mockCust.loyaltyPoints || 0) + earnedPoints;
          
          let oldSpent = (mockCust as any).totalSpent || 0;
          const newSpent = oldSpent + total;
          (mockCust as any).totalSpent = newSpent;

          // Auto tier upgrade
          if (newSpent > 100000 && mockCust.membershipTier !== 'Gold') {
              mockCust.membershipTier = 'Gold';
          } else if (newSpent > 25000 && mockCust.membershipTier === 'Regular') {
              mockCust.membershipTier = 'Silver';
          }

          demoTransaction.customerName = mockCust.fullName;
      }

      MOCK_TRANSACTIONS.unshift(demoTransaction as any);
      return res.status(201).json({
          success: true,
          transaction: demoTransaction,
          message: 'Checkout successful (OFFLINE FLOW). Points dynamic update complete.'
      });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, customerPhone, paymentMode, paymentReferenceId, notes, manualDiscount = 0 } = req.body;

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

      const itemRate = product.taxRate ?? 13;
      const divisor = new Decimal(1).plus(new Decimal(itemRate).div(100));
      const basePrice = new Decimal(product.sellingPrice).div(divisor);

      const itemSubtotal = basePrice.mul(item.quantity);
      const itemVAT = itemSubtotal.mul(itemRate).div(100);
      
      subtotal = subtotal.plus(itemSubtotal);
      totalVAT = totalVAT.plus(itemVAT);

      processedItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        unitPrice: basePrice.toNumber(),
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

    const manualDiscDec = new Decimal(manualDiscount || 0);
    const grandTotal = Decimal.max(0, subtotal.plus(totalVAT).minus(loyaltyDiscount).minus(manualDiscDec)).toDecimalPlaces(2);
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
      manualDiscount: manualDiscDec.toNumber(),
      grandTotal: grandTotal.toNumber(),
      paymentMode,
      paymentReferenceId,
      paymentStatus: 'Completed',
      notes
    });

    await transaction.save({ session });

    if (customer) {
      const config = await AppConfig.findOne().session(session);
      const basePoints = grandTotal.mul(config?.loyaltyConfig?.pointsPerNPR || 0.01);
      
      let multiplier = 1.0;
      if (customer.membershipTier === 'Silver') {
        multiplier = 1.5;
      } else if (customer.membershipTier === 'Gold') {
        multiplier = 2.0;
      }
      
      const pointsEarned = basePoints.mul(multiplier).floor();
      
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
      transaction: { ...transaction.toObject(), customerName: customer?.fullName || 'Walk-in' },
      message: 'Checkout successful'
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
