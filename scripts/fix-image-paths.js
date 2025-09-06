const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI - Get from actual running app
const MONGODB_URI = process.env.MONGODB_URI;

// Product Schema (recreate here since we can't import models directly)
const ProductSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  offerPrice: { type: Number, required: true, min: 0 },
  image: [{ type: String, required: true }],
  category: { 
    type: String, 
    required: true, 
    enum: ['Laptop', 'Smartphone', 'Headphone', 'Earphone', 'Camera', 'Accessories'] 
  },
  stock: { type: Number, default: 10, min: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function connectDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('URI provided:', MONGODB_URI ? 'Yes' : 'No');
    
    if (!MONGODB_URI) {
      console.log('❌ No MONGODB_URI found in environment variables');
      console.log('💡 Make sure your .env file contains a valid MONGODB_URI');
      process.exit(1);
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function fixProductImages() {
  try {
    console.log('🔍 Finding products with invalid image paths...\n');
    
    // Find all products
    const products = await Product.find({});
    let fixedCount = 0;
    let totalInvalidPaths = 0;

    console.log(`Found ${products.length} total products to check...\n`);

    if (products.length === 0) {
      console.log('ℹ️  No products found in the database.');
      return;
    }

    for (const product of products) {
      let hasInvalidImages = false;
      let updatedImages = [];

      // Check each image in the product's image array
      if (Array.isArray(product.image)) {
        for (const img of product.image) {
          if (typeof img === 'string') {
            // Check for local file paths (Windows paths like C:, D:, or quoted paths)
            const isLocalPath = 
              img.includes(':\\\\') ||           // Windows drive paths like C:\\, D:\\
              img.includes(':\\') ||            // Windows drive paths like C:, D:
              img.includes('Phone Link') ||     // Specific problematic path
              img.startsWith('"') ||            // Quoted paths
              img.startsWith("'") ||            // Single quoted paths
              img.match(/^[A-Za-z]:[\\\/]/) ||  // Windows absolute paths
              (!img.startsWith('http') && !img.startsWith('data:') && !img.startsWith('/')); // Not web URL

            if (isLocalPath) {
              console.log(`❌ Invalid image path found in "${product.name}": ${img}`);
              hasInvalidImages = true;
              totalInvalidPaths++;
              // Replace with a placeholder image
              updatedImages.push('https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Image+Not+Found');
            } else {
              updatedImages.push(img);
            }
          }
        }
      } else if (typeof product.image === 'string') {
        // Handle single string image
        const img = product.image;
        const isLocalPath = 
          img.includes(':\\\\') ||
          img.includes(':\\') ||
          img.includes('Phone Link') ||
          img.startsWith('"') ||
          img.startsWith("'") ||
          img.match(/^[A-Za-z]:[\\\/]/) ||
          (!img.startsWith('http') && !img.startsWith('data:') && !img.startsWith('/'));

        if (isLocalPath) {
          console.log(`❌ Invalid image path found in "${product.name}": ${img}`);
          hasInvalidImages = true;
          totalInvalidPaths++;
          updatedImages = ['https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Image+Not+Found'];
        } else {
          updatedImages = [img];
        }
      }

      // Update product if it has invalid images
      if (hasInvalidImages) {
        await Product.findByIdAndUpdate(product._id, { 
          image: updatedImages 
        });
        console.log(`✅ Fixed images for "${product.name}"`);
        fixedCount++;
      } else {
        console.log(`✓ "${product.name}" - images are valid`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   • Total products checked: ${products.length}`);
    console.log(`   • Products with invalid images: ${fixedCount}`);
    console.log(`   • Total invalid image paths fixed: ${totalInvalidPaths}`);
    
    if (fixedCount > 0) {
      console.log(`\n✨ All invalid image paths have been replaced with placeholder images.`);
      console.log(`📝 Note: You should update these products with proper image URLs through the admin panel.`);
    } else {
      console.log(`\n✅ No invalid image paths found. All images are using valid URLs.`);
    }

  } catch (error) {
    console.error('❌ Error fixing product images:', error);
  }
}

async function main() {
  console.log('🚀 Starting image path fix process...\n');
  
  try {
    await connectDB();
    await fixProductImages();
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    console.log('🎉 Process completed!');
    process.exit(0);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  process.exit(1);
});

main();
