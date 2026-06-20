const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const existing = await User.findOne({ email: 'admin@smarthire.com' });
    
    if (existing) {
      console.log('⚠️  Admin already exists, deleting and recreating...');
      await User.deleteOne({ email: 'admin@smarthire.com' });
    }

    // ✅ DON'T hash manually — pre('save') hook does it automatically
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@smarthire.com',
      password: 'admin123',   // plain text — hook will hash it
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin created:', admin._id);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   isActive:', admin.isActive);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();