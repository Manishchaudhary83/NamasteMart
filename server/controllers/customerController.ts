import { Customer } from '../models/Customer.js';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

export let MOCK_CUSTOMERS = [
  { _id: 'c1', fullName: 'Sandeep K. Adhikari', phoneNumber: '9841234567', loyaltyPoints: 1245.5, membershipTier: 'Gold' },
  { _id: 'c2', fullName: 'Priyanka Sharma', phoneNumber: '9851012345', loyaltyPoints: 450, membershipTier: 'Silver' },
  { _id: 'c3', fullName: 'Binod Chaudhary', phoneNumber: '9801000000', loyaltyPoints: 10000, membershipTier: 'Gold' },
  { _id: 'c4', fullName: 'Pasang Lhamu', phoneNumber: '9861112233', loyaltyPoints: 0, membershipTier: 'Regular' }
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
    return res.status(404).json({ message: 'Customer not found in offline list' });
  }
  const customer = await Customer.findOne({ phoneNumber: req.params.phone });
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  const tier = req.body.membershipTier || 'Regular';
  let loyaltyPoints = 50; // default for Regular
  if (tier === 'Silver') loyaltyPoints = 250;
  else if (tier === 'Gold') loyaltyPoints = 500;

  if (mongoose.connection.readyState !== 1) {
    const newCustomer = { 
      ...req.body, 
      _id: `demo_cust_${Date.now()}`, 
      loyaltyPoints,
      membershipTier: tier,
      totalSpent: 0,
      purchaseHistory: [],
      message: 'Customer added (Offline Cache)' 
    };
    MOCK_CUSTOMERS.unshift(newCustomer as any);
    return res.status(201).json(newCustomer);
  }
  try {
    const customerData = {
      ...req.body,
      membershipTier: tier,
      loyaltyPoints: req.body.loyaltyPoints !== undefined ? req.body.loyaltyPoints : loyaltyPoints
    };
    const customer = await Customer.create(customerData);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
