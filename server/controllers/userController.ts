import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Response, Request } from 'express';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, role } = req.body;
  
  if (mongoose.connection.readyState !== 1) {
    return res.status(201).json({
      _id: `demo_${Date.now()}`,
      fullName,
      email,
      role,
      token: generateToken(`demo_${Date.now()}`),
      message: 'Account created successfully (Demo Mode)'
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ fullName, email, password, role });
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString())
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // DEMO MODE BYPASS: If DB is not connected, allow demo user logins
  if (mongoose.connection.readyState !== 1) {
    if (email === 'admin@namastemart.com' || email === 'cashier@demo.com') {
      return res.json({
        _id: email === 'admin@namastemart.com' ? 'demo_admin_id' : 'demo_cashier_id',
        fullName: email === 'admin@namastemart.com' ? 'System Administrator' : 'Demo Cashier',
        email: email,
        role: email === 'admin@namastemart.com' ? 'Admin' : 'Cashier',
        token: jwt.sign({ id: email === 'admin@namastemart.com' ? 'demo_admin_id' : 'demo_cashier_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }),
        demo: true
      });
    }
  }

  try {
    const user: any = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      user.lastLogin = new Date();
      await user.save();
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString())
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([
      { _id: 'demo_admin_id', fullName: 'System Administrator', email: 'admin@namastemart.com', role: 'Admin' },
      { _id: 'demo_cashier_id', fullName: 'Demo Cashier', email: 'cashier@demo.com', role: 'Cashier' }
    ]);
  }
  const users = await User.find({}).select('-password');
  res.json(users);
};
