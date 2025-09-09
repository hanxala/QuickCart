import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  offerPrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: [
      // Electronics
      'Laptop', 'Smartphone', 'Tablet', 'Desktop', 'Monitor',
      'Headphone', 'Earphone', 'Speaker', 'Camera', 'Drone',
      'Gaming Console', 'Smart Watch', 'Television', 'Printer',
      
      // Fashion & Clothing
      'Men Clothing', 'Women Clothing', 'Kids Clothing', 'Shoes',
      'Bags & Luggage', 'Jewelry', 'Watches', 'Sunglasses',
      
      // Home & Kitchen
      'Kitchen Appliances', 'Home Decor', 'Furniture', 'Bedding',
      'Cookware', 'Storage & Organization', 'Lighting', 'Garden & Outdoor',
      
      // Health & Beauty
      'Skincare', 'Makeup', 'Hair Care', 'Personal Care',
      'Health Supplements', 'Fitness Equipment', 'Medical Devices',
      
      // Sports & Outdoors
      'Sports Equipment', 'Outdoor Gear', 'Cycling', 'Fitness',
      'Water Sports', 'Winter Sports', 'Team Sports',
      
      // Books & Media
      'Books', 'E-books', 'Movies & TV', 'Music', 'Games',
      'Educational Materials', 'Magazines',
      
      // Toys & Games
      'Action Figures', 'Board Games', 'Educational Toys',
      'Electronic Toys', 'Outdoor Toys', 'Puzzles',
      
      // Automotive
      'Car Accessories', 'Motorcycle Accessories', 'Car Electronics',
      'Tools & Equipment', 'Car Care', 'Replacement Parts',
      
      // Office & Business
      'Office Supplies', 'Office Electronics', 'Office Furniture',
      'Business Equipment', 'Software', 'Stationery',
      
      // Baby & Kids
      'Baby Care', 'Baby Feeding', 'Baby Toys', 'Baby Clothing',
      'Strollers & Car Seats', 'Baby Monitors', 'Diaper Bags',
      
      // Pet Supplies
      'Dog Supplies', 'Cat Supplies', 'Bird Supplies', 'Fish Supplies',
      'Pet Food', 'Pet Toys', 'Pet Healthcare',
      
      // General
      'Accessories', 'Other'
    ]
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: [{
    userId: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating before saving
ProductSchema.pre('save', function() {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
    this.totalReviews = this.ratings.length;
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
