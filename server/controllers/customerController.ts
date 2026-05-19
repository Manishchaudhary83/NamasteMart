import { Customer } from '../models/Customer.js';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

let MOCK_CUSTOMERS = [
  { _id: 'c1', fullName: 'Sandeep K. Adhikari', phoneNumber: '9841234567', loyaltyPoints: 1245.5, membershipTier: 'Gold' },
  { _id: 'c2', fullName: 'Priyanka Sharma', phoneNumber: '9851012345', loyaltyPoints: 450, membershipTier: 'Silver' },
  { _id: 'c3', fullName: 'Binod Chaudhary', phoneNumber: '9801000000', loyaltyPoints: 10000, membershipTier: 'Platinum' },
  { _id: 'c4', fullName: 'Pasang Lhamu', phoneNumber: '9861112233', loyaltyPoints: 0, membershipTier: 'Standard' }
];

export const getCustomers = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(MOCK_CUSTOMERS);
  }
  const { phone } = req.query;
  let query = {};
  if (phone) {
    query = { phoneNumber: { $regex: phone, $options: 'i' } };
  }
  const customers = await Customer.find(query);
  res.json(customers);
};

export const getCustomerByPhone = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    const customer = MOCK_CUSTOMERS.find(c => c.phoneNumber === req.params.phone);
    if (customer) return res.json(customer);
    return res.status(404).json({ message: 'Customer not found in demo' });
  }
  const customer = await Customer.findOne({ phoneNumber: req.params.phone });
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    const newCustomer = { 
      ...req.body, 
      _id: `demo_cust_${Date.now()}`, 
      loyaltyPoints: 0,
      membershipTier: 'Regular',
      totalSpent: 0,
      purchaseHistory: [],
      message: 'Customer added (Demo Mode)' 
    };
    MOCK_CUSTOMERS.unshift(newCustomer as any);
    return res.status(201).json(newCustomer);
  }
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
