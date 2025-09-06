import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hanzalakhan0912_db_user:3EqdshudagIzVLOz@cluster0.mnysqyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log(`\n=== USERS IN DATABASE (${users.length} total) ===`);
    if (users.length === 0) {
      console.log('No users found in database.');
      console.log('You need to sign up first, then run:');
      console.log('npm run make-admin your-email@example.com');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Clerk ID: ${user.clerkUserId}`);
        console.log(`   Active: ${user.isActive}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUsers();
