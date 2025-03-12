// app/api/login/route.js
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectToDatabase from '@/lib/config/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Find user by email (convert to lowercase for consistency)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 400 }
      );
    }

    // Compare provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 400 }
      );
    }

    // If credentials are correct, return a success message along with the user's role
    return NextResponse.json(
      { message: 'Login successful', role: user.role },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
