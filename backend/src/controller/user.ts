import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
import bcrypt from "bcrypt"
import User, { IUser } from "../model/user";
import { UserCredentials } from '../types/index';
import { IRequest } from '../middleware/auth';

interface UserResponse {
  success: boolean,
  message: string,
  data?: Record<string,string|IUser>;
  user?: IUser;
}
interface ErrorResponse {
  success: boolean,
  message: string,
  detail?: any,
}

// res.status(201).json({ token, user });
const signup = async (req: Request<{}, {}, UserCredentials>, res: Response<UserResponse | ErrorResponse>) => {
  const { email, name, password } = req.body

  try {  
    //! zod validation
    const user = new User({ email, name, password });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
    const data = { token : token, user : user }

    res.status(200).json({success: true, message: "User signed up", data})
  } catch (error) {
    res.status(500).json({success: false, message: "Internal Server Error",detail: error})
  }
};

const login = async (req: Request<{}, {}, UserCredentials>, res: Response<UserResponse | ErrorResponse>) => {
  const { email, password } = req.body
  
  try {
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({success: false, message: 'Login failed'})
      return
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
    const data = { token : token, user : user }

    res.status(200).json({success: true, message: "User logged in",data})
  } catch (error) {
    res.status(500).json({success: false, message: "Internal Server Error",detail: error})
  }
}



export {
  signup,
  login,
}