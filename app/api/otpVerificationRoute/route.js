// app/api/verify-otp/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectToDatabase from '@/lib/config/db';

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required.' },
        { status: 400 }
      );
    }

    // Find the user by email, ensuring they're not already verified
    const user = await User.findOne({
      email: email.toLowerCase(),
      verified: false
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid verification attempt. User not found or already verified.' },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    // Compare the provided OTP with the hashed OTP in the database
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    // Mark the user as verified and clear OTP fields
    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json(
      {
        message: 'Email verified successfully.',
        user: {
          email: user.email,
          verified: user.verified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
