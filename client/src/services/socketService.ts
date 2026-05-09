import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  connect(token: string, userId: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.baseURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('user_connected', userId);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  sendMessage(senderId: string, receiverId: string, message: string) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    this.socket.emit('send_message', {
      senderId,
      receiverId,
      message
    });
  }

  onReceiveMessage(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('receive_message', callback);
  }

  onMessageSent(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('message_sent', callback);
  }

  onMessageError(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('message_error', callback);
  }

  onMessageStatusUpdate(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('message_status_update', callback);
  }

  onOnlineUsersUpdate(callback: (users: string[]) => void) {
    if (!this.socket) return;
    this.socket.on('update_online_users', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('user_stop_typing', callback);
  }

  emitTyping(receiverId: string) {
    if (!this.socket) return;
    this.socket.emit('typing', { receiverId });
  }

  emitStopTyping(receiverId: string) {
    if (!this.socket) return;
    this.socket.emit('stop_typing', { receiverId });
  }

  markMessageDelivered(messageId: string) {
    if (!this.socket) return;
    this.socket.emit('message_delivered', { messageId });
  }

  markMessageSeen(messageId: string) {
    if (!this.socket) return;
    this.socket.emit('message_seen', { messageId });
  }

  removeAllListeners() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }
}

export default new SocketService();
