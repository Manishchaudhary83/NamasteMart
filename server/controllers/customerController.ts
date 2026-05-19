import { Customer } from '../models/Customer.js';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

export const getCustomers = async (req: Request, res: Response) => {
  const { phone } = req.query;
  let query = {};
  if (phone) {
    query = { phoneNumber: { $regex: phone, $options: 'i' } };
  }
  const customers = await Customer.find(query);
  res.json(customers);
};

export const getCustomerByPhone = async (req: Request, res: Response) => {
  const customer = await Customer.findOne({ phoneNumber: req.params.phone });
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
