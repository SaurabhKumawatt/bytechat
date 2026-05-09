import User from '../models/User.js';
import presenceTracker, {
  handleUserConnected,
  handleUserDisconnected,
  getOnlineUsers,
  getSocketIdForUser,
  isUserOnline,
  getPresenceStats
} from '../socket/presence.js';

describe('Presence Tracking', () => {
  const mockIo = {
    emit: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Connection', () => {
    test('should mark user as online on connect', async () => {
      const userId = 'user123';
      const socketId = 'socket456';

      await handleUserConnected(userId, socketId, mockIo);

      expect(isUserOnline(userId)).toBe(true);
      expect(getSocketIdForUser(userId)).toBe(socketId);
      expect(mockIo.emit).toHaveBeenCalledWith(
        'update_online_users',
        expect.arrayContaining([userId])
      );
    });

    test('should track multiple online users', async () => {
      const users = [
        { userId: 'user1', socketId: 'socket1' },
        { userId: 'user2', socketId: 'socket2' },
        { userId: 'user3', socketId: 'socket3' }
      ];

      for (const { userId, socketId } of users) {
        await handleUserConnected(userId, socketId, mockIo);
      }

      const onlineUsers = getOnlineUsers();
      expect(onlineUsers.length).toBe(3);
      expect(onlineUsers).toContain('user1');
      expect(onlineUsers).toContain('user2');
      expect(onlineUsers).toContain('user3');
    });

    test('should get correct socket ID for user', async () => {
      const userId = 'user789';
      const socketId = 'socket999';

      await handleUserConnected(userId, socketId, mockIo);

      expect(getSocketIdForUser(userId)).toBe(socketId);
    });
  });

  describe('User Disconnection', () => {
    test('should mark user as offline on disconnect', async () => {
      const userId = 'user456';
      const socketId = 'socket789';

      await handleUserConnected(userId, socketId, mockIo);
      expect(isUserOnline(userId)).toBe(true);

      await handleUserDisconnected(socketId, mockIo);

      expect(isUserOnline(userId)).toBe(false);
      expect(getSocketIdForUser(userId)).toBeUndefined();
    });

    test('should update online users list on disconnect', async () => {
      const user1 = { userId: 'user1', socketId: 'socket1' };
      const user2 = { userId: 'user2', socketId: 'socket2' };

      await handleUserConnected(user1.userId, user1.socketId, mockIo);
      await handleUserConnected(user2.userId, user2.socketId, mockIo);

      expect(getOnlineUsers().length).toBe(2);

      await handleUserDisconnected(user1.socketId, mockIo);

      const onlineUsers = getOnlineUsers();
      expect(onlineUsers.length).toBe(1);
      expect(onlineUsers).not.toContain('user1');
      expect(onlineUsers).toContain('user2');
    });

    test('should handle disconnection of non-existent socket', async () => {
      const nonExistentSocketId = 'fake-socket-123';

      await expect(
        handleUserDisconnected(nonExistentSocketId, mockIo)
      ).resolves.not.toThrow();
    });
  });

  describe('Presence Stats', () => {
    test('should return correct presence statistics', async () => {
      await handleUserConnected('user1', 'socket1', mockIo);
      await handleUserConnected('user2', 'socket2', mockIo);

      const stats = getPresenceStats();

      expect(stats.totalOnline).toBe(2);
      expect(stats.onlineUsers).toContain('user1');
      expect(stats.onlineUsers).toContain('user2');
    });

    test('should return zero when no users online', () => {
      const stats = getPresenceStats();

      expect(stats.totalOnline).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.onlineUsers)).toBe(true);
    });
  });

  describe('User Lookup', () => {
    test('should check if user is online', async () => {
      const userId = 'user999';
      const socketId = 'socket111';

      expect(isUserOnline(userId)).toBe(false);

      await handleUserConnected(userId, socketId, mockIo);

      expect(isUserOnline(userId)).toBe(true);

      await handleUserDisconnected(socketId, mockIo);

      expect(isUserOnline(userId)).toBe(false);
    });

    test('should return undefined for non-existent user socket', () => {
      const socketId = getSocketIdForUser('non-existent-user');
      expect(socketId).toBeUndefined();
    });
  });

  describe('Concurrent Connections', () => {
    test('should handle same user connecting from multiple devices', async () => {
      const userId = 'user123';
      const socket1 = 'socket-device1';
      const socket2 = 'socket-device2';

      await handleUserConnected(userId, socket1, mockIo);
      await handleUserConnected(userId, socket2, mockIo);

      expect(isUserOnline(userId)).toBe(true);
      expect(getSocketIdForUser(userId)).toBe(socket2);
    });

    test('should handle rapid connect/disconnect cycles', async () => {
      const userId = 'user777';
      const socketId = 'socket888';

      for (let i = 0; i < 5; i++) {
        await handleUserConnected(userId, socketId, mockIo);
        expect(isUserOnline(userId)).toBe(true);

        await handleUserDisconnected(socketId, mockIo);
        expect(isUserOnline(userId)).toBe(false);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty user ID', async () => {
      const emptyUserId = '';
      const socketId = 'socket123';

      await handleUserConnected(emptyUserId, socketId, mockIo);

      expect(isUserOnline(emptyUserId)).toBe(true);
    });

    test('should handle null socket ID lookup', () => {
      const socketId = getSocketIdForUser(null);
      expect(socketId).toBeUndefined();
    });

    test('should maintain state across multiple operations', async () => {
      const operations = [
        { userId: 'user1', socketId: 'socket1', action: 'connect' },
        { userId: 'user2', socketId: 'socket2', action: 'connect' },
        { userId: 'user1', socketId: 'socket1', action: 'disconnect' },
        { userId: 'user3', socketId: 'socket3', action: 'connect' },
        { userId: 'user2', socketId: 'socket2', action: 'disconnect' }
      ];

      for (const op of operations) {
        if (op.action === 'connect') {
          await handleUserConnected(op.userId, op.socketId, mockIo);
        } else {
          await handleUserDisconnected(op.socketId, mockIo);
        }
      }

      const onlineUsers = getOnlineUsers();
      expect(onlineUsers.length).toBe(1);
      expect(onlineUsers).toContain('user3');
    });
  });
});
