import { Schema, model, Document, Types } from 'mongoose';

export interface IOTP extends Document {
    mobile: string;
    otp: string;           // hashed OTP recommended
    used: boolean;
    expiresAt: number;     // epoch milliseconds
    createdAt: number;     // epoch milliseconds
    updatedAt: number;     // epoch milliseconds
}

const otpSchema = new Schema<IOTP>(
    {
        mobile: { type: String, required: true },
        otp: { type: String, required: true },
        used: { type: Boolean, default: false },
        expiresAt: { type: Number, required: true },
        createdAt: { type: Number, default: () => Date.now() },
        updatedAt: { type: Number, default: () => Date.now() },
    },
    {
        timestamps: false,   // custom epoch timestamps
        versionKey: false,   // disables __v
    }
);

// --- Hooks ---
// Update `updatedAt` on every save
otpSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    if (!this.createdAt) this.createdAt = Date.now();
    next();
});

// Update `updatedAt` on update queries
otpSchema.pre('updateOne', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

otpSchema.pre('updateMany', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

otpSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

export const OTPModel = model<IOTP>('OTP', otpSchema);
