import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node makeAdmin.js <email>');
      console.log('Example: node makeAdmin.js user@example.com');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('Please register this user first at: http://localhost:3000/register');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️  ${email} is already an admin`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log('\n✅ Admin privileges granted successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name:       ${user.name}`);
    console.log(`Email:      ${user.email}`);
    console.log(`Role:       ${user.role} ⭐`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 Admin Dashboard: http://localhost:3000/admin/dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();
