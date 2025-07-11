import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required']
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be a positive number']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  images: [
    {
      type: String
    }
  ],
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer reference is required']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: [true, 'Location type is required']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required']
    }
  }
}, {
  timestamps: true
});

productSchema.index({ location: '2dsphere' });

export default mongoose.model('Product', productSchema);
