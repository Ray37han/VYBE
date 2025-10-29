import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node verifyAdmin.js <email>');
      console.log('Example: node verifyAdmin.js user@example.com');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('\n📋 User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name:       ${user.name}`);
    console.log(`Email:      ${user.email}`);
    console.log(`Role:       ${user.role}`);
    console.log(`Created:    ${user.createdAt}`);
    console.log(`Updated:    ${user.updatedAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (user.role === 'admin') {
      console.log('✅ This user HAS admin access');
    } else {
      console.log('⚠️  This user DOES NOT have admin access');
      console.log('To grant admin access, run:');
      console.log(`node makeAdmin.js ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyAdmin();
