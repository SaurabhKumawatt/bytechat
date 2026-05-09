import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { generateAESKey, encryptMessage } from '../utils/crypto/aes.js';
import { encryptWithPublicKey } from '../utils/crypto/rsa.js';
import { handleUserConnected, handleUserDisconnected, getSocketIdForUser } from './presence.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on('user_connected', async (userId) => {
      await handleUserConnected(userId, socket.id, io);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, message } = data;

        if (!senderId || !receiverId || !message) {
          socket.emit('message_error', { error: 'Invalid message data' });
          return;
        }

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !receiver.publicKey) {
          socket.emit('message_error', { error: 'Receiver not found or missing encryption keys' });
          return;
        }

        if (!sender || !sender.publicKey) {
          socket.emit('message_error', { error: 'Sender not found or missing encryption keys' });
          return;
        }

        const aesKey = generateAESKey();
        const { iv, cipherText } = encryptMessage(message, aesKey);
        const encryptedAESKey = encryptWithPublicKey(aesKey, receiver.publicKey);
        const encryptedAESKeyForSender = encryptWithPublicKey(aesKey, sender.publicKey);

        const newMessage = await Message.create({
          senderId,
          receiverId,
          encryptedMessage: cipherText,
          encryptedAESKey,
          encryptedAESKeyForSender,
          iv,
          status: 'sent'
        });

        const messageData = {
          messageId: newMessage._id,
          senderId,
          receiverId,
          encryptedMessage: cipherText,
          encryptedAESKey,
          encryptedAESKeyForSender,
          iv,
          timestamp: newMessage.timestamp,
          status: 'sent'
        };

        const receiverSocketId = getSocketIdForUser(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', messageData);

          await Message.findByIdAndUpdate(newMessage._id, { status: 'delivered' });
          messageData.status = 'delivered';
        }

        socket.emit('message_sent', messageData);

        console.log(`Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('send_file_message', async (data) => {
      try {
        const { senderId, receiverId, fileUrl, fileName, fileSize, mimeType, messageType, thumbnailUrl } = data;

        if (!senderId || !receiverId || !fileUrl) {
          socket.emit('message_error', { error: 'Invalid file message data' });
          return;
        }

        const newMessage = await Message.create({
          senderId,
          receiverId,
          messageType,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          thumbnailUrl,
          status: 'sent'
        });

        const messageData = {
          messageId: newMessage._id,
          senderId,
          receiverId,
          messageType,
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          thumbnailUrl,
          timestamp: newMessage.timestamp,
          status: 'sent'
        };

        const receiverSocketId = getSocketIdForUser(receiverId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_file_message', messageData);

          await Message.findByIdAndUpdate(newMessage._id, { status: 'delivered' });
          messageData.status = 'delivered';
        }

        socket.emit('file_message_sent', messageData);

        console.log(`File message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('Send file message error:', error);
        socket.emit('message_error', { error: 'Failed to send file message' });
      }
    });

    socket.on('message_delivered', async (data) => {
      try {
        const { messageId } = data;
        const deliveredAt = new Date();

        await Message.findByIdAndUpdate(messageId, {
          status: 'delivered',
          delivered: true,
          deliveredAt
        });

        const message = await Message.findById(messageId);
        const senderSocketId = getSocketIdForUser(message.senderId.toString());

        if (senderSocketId) {
          io.to(senderSocketId).emit('message_status_update', {
            messageId,
            status: 'delivered',
            deliveredAt
          });
        }
      } catch (error) {
        console.error('Message delivered error:', error);
      }
    });

    socket.on('message_seen', async (data) => {
      try {
        const { messageId } = data;
        const seenAt = new Date();

        await Message.findByIdAndUpdate(messageId, {
          status: 'seen',
          read: true,
          seenAt
        });

        const message = await Message.findById(messageId);
        const senderSocketId = getSocketIdForUser(message.senderId.toString());

        if (senderSocketId) {
          io.to(senderSocketId).emit('message_status_update', {
            messageId,
            status: 'seen',
            seenAt
          });
        }
      } catch (error) {
        console.error('Message seen error:', error);
      }
    });

    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = getSocketIdForUser(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId
        });
      }
    });

    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = getSocketIdForUser(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', {
          userId: socket.userId
        });
      }
    });

    socket.on('disconnect', async () => {
      await handleUserDisconnected(socket.id, io);
    });
  });

  return io;
};
