import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: Date,
      updatedAt: Date
    }));

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'rayhan@vybe.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      process.exit(0);
    }

    // Create admin with hashed password
    const hashedPassword = await bcrypt.hash('ray163', 12);
    
    const admin = await User.create({
      name: 'Rayhan',
      email: 'rayhan@vybe.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: rayhan@vybe.com');
    console.log('🔑 Password: ray163');
    console.log('🎯 Login at: http://localhost:3000/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
