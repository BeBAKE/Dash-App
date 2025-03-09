import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from "../model/user";


export interface IRequest extends Request {
  user ?: any
}

export const auth = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success:false, message: 'Please authenticate' });
  }
};

export const checkAuth = async (req: IRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return 
    }

    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
