import User, { IUser } from '../models/user.model';
import logger from '../utils/logger';
import { Error } from 'mongoose';

interface UpdateData {
  username?: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  email?: string;
  preferences?: IUser['preferences'];
}

export const getUserProfile = async (user_id: string): Promise<IUser | null> => {
  return User.findOne({ user_id });
};

export const updateOrCreateUser = async (
    user_id: string,
    mobile: string,
    data: UpdateData
  ): Promise<IUser> => {
    if (!data.username) {
      throw new Error('Username is required');
    }
  
    // Find existing user
    let user = await User.findOne({ user_id });
  
    if (!user) {
      // First-time creation
      const usernameTaken = await User.findOne({ username: data.username });
      if (usernameTaken) throw new Error('Username already exist. Try something new');
  
      user = await User.create({
        user_id,
        mobile,
        username: data.username,
        name: data.name || null,
        age: data.age || null,
        gender: data.gender || null,
        email: data.email || null,
        preferences: data.preferences || { price_range: { min: 0, max: 0 }, styles: [] },
      });
      return user;
    }
  
    // User exists → update only if different
    if (data.username && data.username !== user.username) {
      const usernameTaken = await User.findOne({ username: data.username, user_id: { $ne: user_id } });
      if (usernameTaken) throw new Error('Username already taken');
      user.username = data.username;
    }
  
    user.name = data.name ?? user.name;
    user.age = data.age ?? user.age;
    user.gender = data.gender ?? user.gender;
    user.email = data.email ?? user.email;
    user.preferences = data.preferences ?? user.preferences;
    user.updatedAt = Date.now();
  
    await user.save();
    return user;
  };