import User from '../models/User.js';

class PresenceTracker {
  constructor() {
    this.onlineUsers = new Map();
    this.pendingUpdates = new Map();
    this.updateInterval = 3000;
    this.startBatchProcessor();
  }

  startBatchProcessor() {
    setInterval(() => {
      this.flushPendingUpdates();
    }, this.updateInterval);
  }

  async flushPendingUpdates() {
    if (this.pendingUpdates.size === 0) return;

    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();

    const promises = updates.map(([userId, data]) => {
      return User.findByIdAndUpdate(userId, data, { new: false }).catch((err) => {
        console.error(`Failed to update user ${userId} presence:`, err);
      });
    });

    await Promise.allSettled(promises);
  }

  setUserOnline(userId, socketId) {
    this.onlineUsers.set(userId, socketId);

    this.pendingUpdates.set(userId, {
      online: true,
      lastSeen: new Date()
    });

    console.log(`User ${userId} marked as online. Total online: ${this.onlineUsers.size}`);
  }

  setUserOffline(userId) {
    this.onlineUsers.delete(userId);

    this.pendingUpdates.set(userId, {
      online: false,
      lastSeen: new Date()
    });

    console.log(`User ${userId} marked as offline. Total online: ${this.onlineUsers.size}`);
  }

  findUserBySocketId(socketId) {
    for (const [userId, sid] of this.onlineUsers.entries()) {
      if (sid === socketId) {
        return userId;
      }
    }
    return null;
  }

  getOnlineUsers() {
    return Array.from(this.onlineUsers.keys());
  }

  getSocketId(userId) {
    return this.onlineUsers.get(userId);
  }

  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  getTotalOnline() {
    return this.onlineUsers.size;
  }

  async forceFlush() {
    await this.flushPendingUpdates();
  }
}

const presenceTracker = new PresenceTracker();

export const handleUserConnected = async (userId, socketId, io) => {
  presenceTracker.setUserOnline(userId, socketId);
  io.emit('update_online_users', presenceTracker.getOnlineUsers());
};

export const handleUserDisconnected = async (socketId, io) => {
  const userId = presenceTracker.findUserBySocketId(socketId);

  if (userId) {
    presenceTracker.setUserOffline(userId);
    io.emit('update_online_users', presenceTracker.getOnlineUsers());
  }
};

export const getOnlineUsers = () => {
  return presenceTracker.getOnlineUsers();
};

export const getSocketIdForUser = (userId) => {
  return presenceTracker.getSocketId(userId);
};

export const isUserOnline = (userId) => {
  return presenceTracker.isUserOnline(userId);
};

export const getPresenceStats = () => {
  return {
    totalOnline: presenceTracker.getTotalOnline(),
    onlineUsers: presenceTracker.getOnlineUsers()
  };
};

export const forceFlushPresenceUpdates = async () => {
  await presenceTracker.forceFlush();
};

export default presenceTracker;
