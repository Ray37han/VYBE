import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const verifyAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store');
    console.log('✅ MongoDB connected');

    // Find all users with admin role
    const admins = await User.find({ role: 'admin' });
    
    console.log('\n📊 Admin Users Status:\n');
    console.log('═'.repeat(80));
    
    if (admins.length === 0) {
      console.log('⚠️  No admin users found in database!');
      console.log('\nTo create an admin user, run:');
      console.log('  node createAdmin.js\n');
    } else {
      console.log(`Found ${admins.length} admin user(s):\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin._id}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log(`   Status: ${admin.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log('   ' + '─'.repeat(76));
      });
    }
    
    // Check for users who might need admin access
    const regularUsers = await User.find({ role: { $ne: 'admin' } });
    
    if (regularUsers.length > 0) {
      console.log(`\n📝 Found ${regularUsers.length} regular user(s):`);
      regularUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name}) - Role: ${user.role || 'user'}`);
      });
      console.log('\nTo promote a user to admin, use MongoDB shell or Compass:');
      console.log('  db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } })');
    }
    
    console.log('\n' + '═'.repeat(80));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyAdmins();
