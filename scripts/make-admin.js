import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hanzalakhan0912_db_user:3EqdshudagIzVLOz@cluster0.mnysqyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function makeUserAdmin(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`Successfully made ${user.name} (${user.email}) an admin!`);
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  console.log('Example: node scripts/make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
