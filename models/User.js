// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['manager', 'member'],
      required: true,
      default: 'member', // Default to team member if not specified
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate OTP
UserSchema.methods.generateOTP = async function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(otp, salt); // Hash the OTP before saving it
  this.otpExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes expiry
  return otp; // Return the plain OTP for sending to the user
};

// Method to verify OTP
UserSchema.methods.verifyOTP = async function (otp) {
  if (!this.otpExpiry || this.otpExpiry < new Date()) {
    return false; // OTP expired
  }
  return await bcrypt.compare(otp, this.otp); // Compare hashed OTP
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
