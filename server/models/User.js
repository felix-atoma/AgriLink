import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },

  contact: {
    type: String,
    required: true // ✅ Required for all users (farmer and buyer)
  },

  farmName: {
    type: String,
    required: function () {
      return this.role === 'farmer';
    }
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: function () {
        return this.role === 'farmer';
      }
    },
    coordinates: {
      type: [Number],
      required: function () {
        return this.role === 'farmer';
      }
    }
  }

}, { timestamps: true });

// Geospatial index
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
