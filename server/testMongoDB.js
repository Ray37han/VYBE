import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Connection...\n');
    console.log('Connection String:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful!\n');
    
    // Test database access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n⚠️  Invalid credentials! Check your MONGODB_URI in .env');
      console.error('    - Username or password might be incorrect');
      console.error('    - Database user might not have proper permissions');
    }
    
    process.exit(1);
  }
};

testConnection();
