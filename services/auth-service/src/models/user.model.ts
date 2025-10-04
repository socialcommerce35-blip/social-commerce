import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
    user_id: string; 
    mobile: string;
    role: 'user' | 'admin';
    isVerified: boolean;       // has user verified OTP/login
    lastLogin?: number;        // epoch of last login
    createdAt: number;         // epoch milliseconds
    updatedAt: number;         // epoch milliseconds
}

const userSchema = new Schema<IUser>(
    {
        user_id: { type: String, default: () => uuidv4(), unique: true },
        mobile: { type: String, required: true, unique: true },
        role: { 
            type: String, 
            enum: ['user', 'admin'], 
            default: 'user'               
        },
        isVerified: { type: Boolean, default: false },
        lastLogin: { type: Number }, // optional
        createdAt: { type: Number, default: () => Date.now() },
        updatedAt: { type: Number, default: () => Date.now() },
    },
    { timestamps: false,
        versionKey: false,
    } // disable default Date timestamps
);

// Pre-save hook: set createdAt and updatedAt
userSchema.pre('save', function (next) {
    const now = Date.now();
    this.updatedAt = now;
    if (!this.createdAt) this.createdAt = now;
    next();
});

// Pre-update hook: set updatedAt for update queries
userSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

userSchema.pre('updateOne', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

userSchema.pre('updateMany', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

export const UserModel = model<IUser>('User', userSchema);
