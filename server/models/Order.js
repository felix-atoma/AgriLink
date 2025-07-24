import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String, // snapshot
    image: String,
    quantity: Number,
    price: Number
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'mobile_money', 'paypal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes
orderSchema.index({ buyer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Auto populate buyer + product
orderSchema.pre(/^find/, function(next) {
  this.populate('buyer', 'name email')
      .populate('products.product', 'name price images');
  next();
});

// ✅ Add paginate plugin
orderSchema.plugin(mongoosePaginate);

export default mongoose.model('Order', orderSchema);
