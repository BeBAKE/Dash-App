import mongoose, { Document, Schema } from 'mongoose';
// import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';

// export interface Recommendation {
//   _id: mongoose.Types.ObjectId;
//   username: string;
//   mutualFriends: number;
// }

export interface IUser extends Document {
  email: string,
  name: string,
  password: string,
  // friends: mongoose.Types.ObjectId[],
  // interests?: string[],
}

const userSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    min: [6,`Must be at least 6`],
  },
  name: { 
    type: String, 
    required: true, 
    unique: true,
    min: [3,`Must be at least 6`]
  },
  password: { type: String, required: true },
  // friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // interests: [String]
});

userSchema.pre<IUser>('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

export default mongoose.model<IUser>('User', userSchema);