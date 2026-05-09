import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  publicKey: {
    type: String,
    required: false
  },
  privateKey: {
    type: String,
    required: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  online: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.index({ phone: 1 });
userSchema.index({ verified: 1 });

const User = mongoose.model('User', userSchema);

export default User;
