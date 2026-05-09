import Message from '../models/Message.js';
import User from '../models/User.js';
import { generateAESKey, encryptMessage } from '../utils/crypto/aes.js';
import { encryptWithPublicKey } from '../utils/crypto/rsa.js';

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        error: 'Sender ID, receiver ID, and message are required'
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.publicKey) {
      return res.status(404).json({
        error: 'Receiver not found or does not have encryption keys'
      });
    }

    const aesKey = generateAESKey();

    const { iv, cipherText } = encryptMessage(message, aesKey);

    const encryptedAESKey = encryptWithPublicKey(aesKey, receiver.publicKey);

    const newMessage = new Message({
      senderId,
      receiverId,
      encryptedMessage: cipherText,
      encryptedAESKey,
      iv
    });

    await newMessage.save();

    return res.status(201).json({
      message: 'Message sent successfully',
      messageId: newMessage._id,
      timestamp: newMessage.timestamp
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      error: 'Server error while sending message'
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId, contactId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    return res.status(200).json({
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      error: 'Server error while fetching messages'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, {
      read: true,
      delivered: true
    });

    return res.status(200).json({
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      error: 'Server error'
    });
  }
};
