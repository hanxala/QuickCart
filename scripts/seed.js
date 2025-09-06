import mongoose from 'mongoose';
// Import the products data directly
const productsDummyData = [
  {
    "_id": "67a1f4e43f34a77b6dde9144",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Apple AirPods Pro 2nd gen",
    "description": "Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C) provide excellent sound, active noise cancellation, and a comfortable fit. The USB-C case ensures quick charging, and they pair seamlessly with Apple devices for an effortless audio experience.",
    "price": 499.99,
    "offerPrice": 399.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/k4dafzhwhgcn5tnoylrw.webp",
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/j212frakb8hdrhvhajhg.webp",
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/imwuugqxsajuwqpkegb5.webp",
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/k1oqaslw5tb3ebw01vvj.webp"
    ],
    "category": "Earphone",
    "date": 1738667236865,
    "__v": 0
  },
  {
    "_id": "67a1f52e3f34a77b6dde914a",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Bose QuietComfort 45",
    "description": "The Bose QuietComfort 45 headphones are engineered for exceptional sound quality and unparalleled noise cancellation. With a 24-hour battery life and comfortable, lightweight design, these headphones deliver premium audio for any environment.",
    "price": 429.99,
    "offerPrice": 329.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/m16coelz8ivkk9f0nwrz.webp"
    ],
    "category": "Headphone",
    "date": 1738667310300,
    "__v": 0
  },
  {
    "_id": "67a1f5663f34a77b6dde914c",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Samsung Galaxy S23",
    "description": "The Samsung Galaxy S23 offers an all-encompassing mobile experience with its advanced AMOLED display, offering vibrant visuals and smooth interactions. Equipped with top-of-the-line fitness tracking features and cutting-edge technology.",
    "price": 899.99,
    "offerPrice": 799.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/xjd4eprpwqs7odbera1w.webp"
    ],
    "category": "Smartphone",
    "date": 1738667366224,
    "__v": 0
  },
  {
    "_id": "67a1f5993f34a77b6dde914e",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Garmin Venu 2",
    "description": "The Garmin Venu 2 smartwatch blends advanced fitness tracking with sophisticated design, offering a wealth of features such as heart rate monitoring, GPS, and sleep tracking.",
    "price": 399.99,
    "offerPrice": 349.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/hdfi4u3fmprazpnrnaga.webp"
    ],
    "category": "Accessories",
    "date": 1738667417511,
    "__v": 0
  },
  {
    "_id": "67a1f5ef3f34a77b6dde9150",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "PlayStation 5",
    "description": "The PlayStation 5 takes gaming to the next level with ultra-HD graphics, a powerful 825GB SSD, and ray tracing technology for realistic visuals.",
    "price": 599.99,
    "offerPrice": 499.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/dd3l13vfoartrgbvkkh5.webp"
    ],
    "category": "Accessories",
    "date": 1738667503075,
    "__v": 0
  },
  {
    "_id": "67a1f70c3f34a77b6dde9156",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Canon EOS R5",
    "description": "The Canon EOS R5 is a game-changing mirrorless camera with a 45MP full-frame sensor, offering ultra-high resolution and the ability to shoot 8K video.",
    "price": 4199.99,
    "offerPrice": 3899.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/r5h370zuujvrw461c6wy.webp"
    ],
    "category": "Camera",
    "date": 1738667788883,
    "__v": 0
  },
  {
    "_id": "67a1f7c93f34a77b6dde915a",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "MacBook Pro 16",
    "description": "The MacBook Pro 16, powered by Apple's M2 Pro chip, offers outstanding performance with 16GB RAM and a 512GB SSD. Perfect for professionals in creative industries.",
    "price": 2799.99,
    "offerPrice": 2499.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/rzri7kytphxalrm9rubd.webp"
    ],
    "category": "Laptop",
    "date": 1738667977644,
    "__v": 0
  },
  {
    "_id": "67a1f8363f34a77b6dde915c",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Sony WF-1000XM5",
    "description": "Sony WF-1000XM5 true wireless earbuds deliver immersive sound with Hi-Res Audio and advanced noise cancellation technology.",
    "price": 349.99,
    "offerPrice": 299.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/e3zjaupyumdkladmytke.webp"
    ],
    "category": "Earphone",
    "date": 1738668086331,
    "__v": 0
  },
  {
    "_id": "67a1f85e3f34a77b6dde915e",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "Samsung Projector 4k",
    "description": "The Samsung 4K Projector offers an immersive cinematic experience with ultra-high-definition visuals and realistic color accuracy.",
    "price": 1699.99,
    "offerPrice": 1499.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/qqdcly8a8vkyciy9g0bw.webp"
    ],
    "category": "Accessories",
    "date": 1738668126660,
    "__v": 0
  },
  {
    "_id": "67a1fa4b3f34a77b6dde9166",
    "userId": "user_2sZFHS1UIIysJyDVzCpQhUhTIhw",
    "name": "ASUS ROG Zephyrus G16",
    "description": "The ASUS ROG Zephyrus G16 gaming laptop is powered by the Intel Core i9 processor and features an RTX 4070 GPU, delivering top-tier gaming and performance.",
    "price": 2199.99,
    "offerPrice": 1999.99,
    "image": [
      "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/wig1urqgnkeyp4t2rtso.webp"
    ],
    "category": "Laptop",
    "date": 1738668619198,
    "__v": 0
  }
];

// Database models
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

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Convert USD prices to Indian Rupees and add stock
    const productsWithStock = productsDummyData.map(product => {
      // Convert USD to INR (approximate rate: 1 USD = 83 INR)
      const inrPrice = Math.round(product.price * 83);
      const inrOfferPrice = Math.round(product.offerPrice * 83);
      
      return {
        ...product,
        userId: 'system', // Default system user for seeded products
        price: inrPrice,
        offerPrice: inrOfferPrice,
        stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
        isActive: true
      };
    });

    // Insert new products
    await Product.insertMany(productsWithStock);
    console.log(`Successfully seeded ${productsWithStock.length} products`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
