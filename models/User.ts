import mongoose, { Schema, Document, Types } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  image: string; // Profile picture from Google
  role: string; // Example roles: 'user', 'admin'
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, default: 'user' }, // Default role is 'user'
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);