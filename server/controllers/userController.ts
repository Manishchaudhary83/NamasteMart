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
      message: 'Account created successfully (Temporary Account)'
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
  const normalizedEmail = email?.trim().toLowerCase();

  // ONLY allow the designated admin and cashier accounts to login
  if (normalizedEmail !== 'admin@namastemart.com' && normalizedEmail !== 'cashier@namastemart.com') {
    return res.status(403).json({ message: 'Login is restricted to the authorized Administrator and Cashier accounts.' });
  }

  // Enforce correct password for the default roles
  if (normalizedEmail === 'admin@namastemart.com' && password !== 'adminPass123') {
    return res.status(401).json({ message: 'Invalid Admin Password' });
  }
  if (normalizedEmail === 'cashier@namastemart.com' && password !== 'cashierPass123') {
    return res.status(401).json({ message: 'Invalid Cashier Password' });
  }
  
  // DEMO MODE BYPASS: If DB is not connected, allow logins (which already matched passwords above)
  if (mongoose.connection.readyState !== 1) {
    const isAdmin = !normalizedEmail?.includes('cashier');
    return res.json({
      _id: isAdmin ? 'demo_admin_id' : 'demo_cashier_id',
      fullName: isAdmin ? 'System Administrator' : 'Mart Cashier',
      email: email || (isAdmin ? 'admin@namastemart.com' : 'cashier@namastemart.com'),
      role: isAdmin ? 'Admin' : 'Cashier',
      token: jwt.sign({ id: isAdmin ? 'demo_admin_id' : 'demo_cashier_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }),
      demo: true
    });
  }

  try {
    const user: any = await User.findOne({ email: normalizedEmail });
    if (user) {
      // Validate password properly
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      user.lastLogin = new Date();
      await user.save();
      return res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString())
      });
    } else {
      // If user does not exist in DB, still authenticate by auto-creating public account (with checking passwords)
      if (normalizedEmail === 'admin@namastemart.com' && password !== 'adminPass123') {
        return res.status(401).json({ message: 'Invalid Admin Password' });
      }
      if (normalizedEmail === 'cashier@namastemart.com' && password !== 'cashierPass123') {
        return res.status(401).json({ message: 'Invalid Cashier Password' });
      }

      const isAdmin = !normalizedEmail?.includes('cashier');
      const newUser = await User.create({
        fullName: isAdmin ? 'System Administrator' : 'Mart Cashier',
        email: normalizedEmail || (isAdmin ? 'admin@namastemart.com' : 'cashier@namastemart.com'),
        password: password || (isAdmin ? 'adminPass123' : 'cashierPass123'),
        role: isAdmin ? 'Admin' : 'Cashier'
      });
      return res.json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id.toString())
      });
    }
  } catch (error: any) {
    const isAdmin = !normalizedEmail?.includes('cashier');
    return res.json({
      _id: isAdmin ? 'demo_admin_id' : 'demo_cashier_id',
      fullName: isAdmin ? 'System Administrator' : 'Mart Cashier',
      email: normalizedEmail || (isAdmin ? 'admin@namastemart.com' : 'cashier@namastemart.com'),
      role: isAdmin ? 'Admin' : 'Cashier',
      token: jwt.sign({ id: isAdmin ? 'demo_admin_id' : 'demo_cashier_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }),
      demo: true
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([
      { _id: 'demo_admin_id', fullName: 'System Administrator', email: 'admin@namastemart.com', role: 'Admin' },
      { _id: 'demo_cashier_id', fullName: 'Mart Cashier', email: 'cashier@namastemart.com', role: 'Cashier' }
    ]);
  }
  const users = await User.find({}).select('-password');
  res.json(users);
};
