import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  buttonText: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  searchTerm: {
    type: String,
    trim: true
  },
  featuredProducts: [{
    type: String, // Product IDs as strings
    validate: {
      validator: function(v) {
        return this.featuredProducts.length <= 3;
      },
      message: 'Maximum 3 featured products allowed'
    }
  }],
  backgroundImage: {
    type: String,
    trim: true
  },
  backgroundColor: {
    type: String,
    enum: ['gradient-blue', 'gradient-dark', 'gradient-orange', 'gradient-green', 'gradient-purple'],
    default: 'gradient-dark'
  },
  textColor: {
    type: String,
    enum: ['auto', 'light', 'dark'],
    default: 'auto'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes
bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

export default Banner;
