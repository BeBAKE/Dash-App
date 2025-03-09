import { Request } from 'express';
import { Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export interface ColumnType {
  name: string;
  type: 'Text' | 'Date';
  isGoogleSheetColumn: boolean;
}

export interface TableDocument extends Document {
  name: string;
  user: string | UserDocument;
  googleSheetId: string;
  googleSheetName: string;
  columns: ColumnType[];
  createdAt: Date;
}

export interface UserCredentials {
  email: string
  name: string
  password: string
}