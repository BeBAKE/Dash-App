import mongoose, { mongo } from 'mongoose';


export const connectDB = (uri:string) => {
  return mongoose.connect(uri)
}
export const disConnectDB = () => {
  return mongoose.disconnect()
}