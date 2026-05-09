import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiverId: {
    type: String,
    required: true,
    ref: 'User'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document'],
    default: 'text'
  },
  encryptedMessage: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  encryptedAESKey: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  encryptedAESKeyForSender: {
    type: String,
    required: false
  },
  iv: {
    type: String,
    required: function() {
      return this.messageType === 'text';
    }
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.messageType !== 'text';
    }
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  mimeType: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  seenAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
