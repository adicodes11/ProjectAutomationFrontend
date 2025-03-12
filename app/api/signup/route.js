// app/api/signup/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectToDatabase from '@/lib/config/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();

    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists.' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document (default role is "member" if not provided)
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'member',
      verified: false,
    });

    // Use the model's generateOTP method to set otp and otpExpiry
    const otp = await newUser.generateOTP();

    await newUser.save();

    // Nodemailer setup to send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD, // Your Gmail password or App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Use the same EMAIL_USER here
      to: email,
      subject: 'Verify your email address',
      text: `Your OTP for email verification is: ${otp}. It will expire in 5 minutes.`,
    };

    // Send OTP email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { 
        message: 'User created successfully. Please verify your email.',
        // Only include OTP in development mode; remove this in production
        developmentOtp: otp 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
