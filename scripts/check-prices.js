import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hanzalakhan0912_db_user:3EqdshudagIzVLOz@cluster0.mnysqyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function checkPrices() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await mongoose.connection.db.collection('products').find({}).limit(5).toArray();
    
    console.log('\n=== PRODUCT PRICES IN DATABASE ===');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Original Price: ₹${product.price}`);
      console.log(`   Offer Price: ₹${product.offerPrice}`);
      console.log('   ---');
    });

    console.log('\n=== SAMPLE PRICE CONVERSIONS ===');
    console.log('Original USD Prices -> Indian Rupee Prices:');
    console.log('$499.99 -> ₹' + Math.round(499.99 * 83));
    console.log('$399.99 -> ₹' + Math.round(399.99 * 83));
    console.log('$2799.99 -> ₹' + Math.round(2799.99 * 83));
    console.log('$2499.99 -> ₹' + Math.round(2499.99 * 83));

  } catch (error) {
    console.error('Error checking prices:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkPrices();
