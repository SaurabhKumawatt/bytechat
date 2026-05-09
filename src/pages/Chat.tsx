import { useEffect, useState, useRef } from 'react';
import { LogOut, Send, Users, Search, Loader2, Bell, BellOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import { decryptWithPrivateKey, decryptMessage, decryptPrivateKey } from '../utils/encryption';
import { OnlineIndicator } from '../components/OnlineIndicator';
import { ChatBubble } from '../components/ChatBubble';
import { NotificationManager } from '../utils/notifications';
import axios from 'axios';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'seen';
  deliveredAt?: Date;
  seenAt?: Date;
}

interface Contact {
  _id: string;
  name: string;
  phone: string;
  online: boolean;
  lastSeen?: Date;
}

export const Chat = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const typingClearTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadContacts();
    requestNotificationPermission();

    const handleNotificationClick = (event: Event) => {
      const customEvent = event as CustomEvent;
      const contactId = customEvent.detail?.contactId;

      if (contactId) {
        const contact = contacts.find(c => c._id === contactId);
        if (contact) {
          setSelectedContact(contact);
          loadMessageHistory(contactId);
        }
      }
    };

    window.addEventListener('notification-click', handleNotificationClick);

    return () => {
      window.removeEventListener('notification-click', handleNotificationClick);
    };
  }, [contacts]);

  const requestNotificationPermission = async () => {
    const granted = await NotificationManager.requestPermission();
    setNotificationsEnabled(granted);
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await NotificationManager.requestPermission();
      setNotificationsEnabled(granted);
    } else {
      setNotificationsEnabled(false);
    }
  };

  const loadContacts = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/users/all`);

      const filteredContacts = response.data.users.filter(
        (contact: Contact) => contact._id !== user?.id
      );

      setContacts(filteredContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const loadMessageHistory = async (contactId: string) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${apiUrl}/api/messages/${user.id}/${contactId}`
      );

      const decryptedMessages = response.data.messages.map((msg: any) => {
        try {
          // Skip file messages (they don't need decryption)
          if (msg.messageType && msg.messageType !== 'text') {
            return {
              id: msg._id,
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              messageType: msg.messageType,
              fileUrl: msg.fileUrl,
              fileName: msg.fileName,
              fileSize: msg.fileSize,
              mimeType: msg.mimeType,
              thumbnailUrl: msg.thumbnailUrl,
              timestamp: new Date(msg.timestamp),
              status: msg.status || 'sent',
              deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
              seenAt: msg.seenAt ? new Date(msg.seenAt) : undefined
            };
          }

          const rsaSecret = import.meta.env.VITE_RSA_SECRET || 'bytechat-rsa-encryption-secret-key-2024';
          const privateKey = decryptPrivateKey(user.privateKey!, rsaSecret);

          const isSender = msg.senderId === user.id;
          const encryptedKey = isSender ? msg.encryptedAESKeyForSender : msg.encryptedAESKey;

          // If sender doesn't have encryptedAESKeyForSender, try the regular key as fallback
          const finalEncryptedKey = encryptedKey || msg.encryptedAESKey;

          if (!finalEncryptedKey) {
            console.warn('Missing encrypted key for message:', msg._id);
            return null;
          }

          const aesKey = decryptWithPrivateKey(finalEncryptedKey, privateKey);
          const plainText = decryptMessage(
            { iv: msg.iv, cipherText: msg.encryptedMessage },
            aesKey
          );

          return {
            id: msg._id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            message: plainText,
            timestamp: new Date(msg.timestamp),
            status: msg.status || 'sent',
            deliveredAt: msg.deliveredAt ? new Date(msg.deliveredAt) : undefined,
            seenAt: msg.seenAt ? new Date(msg.seenAt) : undefined
          };
        } catch (error) {
          console.error('Failed to decrypt message:', msg._id, error);
          return null;
        }
      }).filter(Boolean);

      setMessages(decryptedMessages);
    } catch (error) {
      console.error('Failed to load message history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    socketService.connect(token, user.id);

    const handleReceiveMessage = (data: any) => {
      try {
        // Handle file messages (no decryption needed)
        if (data.messageType && data.messageType !== 'text') {
          const newMsg: Message = {
            id: data.messageId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            messageType: data.messageType,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            mimeType: data.mimeType,
            thumbnailUrl: data.thumbnailUrl,
            timestamp: new Date(data.timestamp),
            status: 'delivered',
            deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
            seenAt: data.seenAt ? new Date(data.seenAt) : undefined
          };

          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMsg.id);
            if (exists) return prev;
            return [...prev, newMsg];
          });

          if (notificationsEnabled && selectedContact?._id !== data.senderId) {
            const sender = contacts.find(c => c._id === data.senderId);
            NotificationManager.showMessageNotification(
              sender?.name || 'Unknown',
              `Sent a ${data.messageType}`,
              data.senderId
            );
          }

          socketService.markMessageDelivered(data.messageId);
          return;
        }

        // Handle text messages (with decryption)
        const rsaSecret = import.meta.env.VITE_RSA_SECRET || 'bytechat-rsa-encryption-secret-key-2024';
        const encryptedPrivateKey = user.privateKey;

        if (!encryptedPrivateKey) {
          console.error('User private key not found');
          return;
        }

        const privateKey = decryptPrivateKey(encryptedPrivateKey, rsaSecret);
        const aesKey = decryptWithPrivateKey(data.encryptedAESKey, privateKey);
        const plainText = decryptMessage({ iv: data.iv, cipherText: data.encryptedMessage }, aesKey);

        const newMsg: Message = {
          id: data.messageId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: plainText,
          timestamp: new Date(data.timestamp),
          status: 'delivered',
          deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
          seenAt: data.seenAt ? new Date(data.seenAt) : undefined
        };

        setMessages((prev) => {
          const exists = prev.some(m => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });

        const sender = contacts.find(c => c._id === data.senderId);
        const senderName = sender?.name || 'Unknown';

        if (notificationsEnabled && (NotificationManager.isDocumentHidden() || selectedContact?._id !== data.senderId)) {
          NotificationManager.showMessageNotification(
            senderName,
            plainText,
            data.senderId
          );
        }

        socketService.markMessageDelivered(data.messageId);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
      }
    };

    const handleMessageSent = (data: any) => {
      setMessages((prev) => {
        return prev.map(m => {
          if (m.id.startsWith('temp-') && m.senderId === data.senderId && m.receiverId === data.receiverId) {
            return {
              ...m,
              id: data.messageId,
              status: data.status,
              timestamp: new Date(data.timestamp)
            };
          }
          return m;
        });
      });
    };

    const handleMessageStatusUpdate = (data: any) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return {
              ...msg,
              status: data.status,
              deliveredAt: data.deliveredAt || msg.deliveredAt,
              seenAt: data.seenAt || msg.seenAt
            };
          }
          return msg;
        })
      );
    };

    const handleOnlineUsersUpdate = (users: string[]) => {
      setOnlineUsers(users);
      setContacts((prev) =>
        prev.map((contact) => ({
          ...contact,
          online: users.includes(contact._id)
        }))
      );
    };

    const handleUserTyping = (data: any) => {
      const { userId } = data;

      setTypingUsers((prev) => ({ ...prev, [userId]: true }));

      if (typingClearTimeouts.current[userId]) {
        clearTimeout(typingClearTimeouts.current[userId]);
      }

      typingClearTimeouts.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    };

    const handleUserStopTyping = (data: any) => {
      const { userId } = data;

      if (typingClearTimeouts.current[userId]) {
        clearTimeout(typingClearTimeouts.current[userId]);
        delete typingClearTimeouts.current[userId];
      }

      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };

    socketService.onReceiveMessage(handleReceiveMessage);
    socketService.onMessageSent(handleMessageSent);
    socketService.onMessageStatusUpdate(handleMessageStatusUpdate);
    socketService.onOnlineUsersUpdate(handleOnlineUsersUpdate);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);

    return () => {
      socketService.removeAllListeners();
    };
  }, [user, selectedContact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!selectedContact) return;

    if (value.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socketService.emitTyping(selectedContact._id);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        socketService.emitStopTyping(selectedContact._id);
      }, 2500);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        isTypingRef.current = false;
        socketService.emitStopTyping(selectedContact._id);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedContact || !user?.id) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    const tempMessage: Message = {
      id: tempId,
      senderId: user.id,
      receiverId: selectedContact._id,
      message: messageText,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketService.emitStopTyping(selectedContact._id);
    }

    try {
      socketService.sendMessage(user.id, selectedContact._id, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter(m => m.id !== tempId));
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    loadMessageHistory(contact._id);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.senderId === user?.id && msg.receiverId === selectedContact?._id) ||
      (msg.senderId === selectedContact?._id && msg.receiverId === user?.id)
  );

  useEffect(() => {
    if (!selectedContact || !user?.id) return;

    const unseenMessages = filteredMessages.filter(
      (msg) => msg.senderId === selectedContact._id && msg.status !== 'seen'
    );

    unseenMessages.forEach((msg) => {
      socketService.markMessageSeen(msg.id);
    });
  }, [selectedContact, messages, user?.id, filteredMessages]);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#38BDF8] text-white p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ByteChat</h1>
            <p className="text-sm text-gray-200">Welcome, {user?.name || 'User'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleNotifications}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
              title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
              <span className="text-sm hidden sm:inline">
                {notificationsEnabled ? 'On' : 'Off'}
              </span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
          <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-[#1E293B] rounded-lg shadow-lg p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700">
              <Users className="w-5 h-5 text-sky-400" />
              <h2 className="font-semibold text-gray-100">Contacts</h2>
              <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                {onlineUsers.length} online
              </span>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 bg-[#0F172A] text-gray-100 rounded-lg border border-gray-700 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  {searchQuery ? 'No contacts found' : 'No contacts yet'}
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact._id}
                    onClick={() => handleContactSelect(contact)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedContact?._id === contact._id
                        ? 'bg-sky-500/20 border border-sky-500'
                        : 'bg-[#0F172A] hover:bg-[#0F172A]/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-100 truncate">{contact.name}</h3>
                        {typingUsers[contact._id] ? (
                          <p className="text-xs text-sky-400 italic animate-pulse">typing...</p>
                        ) : (
                          <OnlineIndicator
                            isOnline={contact.online}
                            lastSeen={contact.lastSeen}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-[#1E293B] rounded-lg shadow-lg flex flex-col">
            {selectedContact ? (
              <>
                <div className="p-4 border-b border-gray-700 bg-[#0F172A]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedContact.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{selectedContact.name}</h3>
                      {typingUsers[selectedContact._id] ? (
                        <p className="text-sm text-sky-400 animate-pulse">typing...</p>
                      ) : (
                        <OnlineIndicator
                          isOnline={selectedContact.online}
                          lastSeen={selectedContact.lastSeen}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#0F172A]/30">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      No messages yet. Start a conversation!
                    </div>
                  ) : (
                    <>
                      {filteredMessages.map((msg) => (
                        <ChatBubble
                          key={msg.id}
                          message={msg.message}
                          isSender={msg.senderId === user?.id}
                          timestamp={msg.timestamp}
                          status={msg.status}
                          deliveredAt={msg.deliveredAt}
                          seenAt={msg.seenAt}
                        />
                      ))}
                      {selectedContact && typingUsers[selectedContact._id] && (
                        <div className="flex justify-start mb-3">
                          <div className="bg-[#1E293B] px-4 py-2 rounded-2xl shadow-sm">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-[#0F172A]/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-[#1E293B] text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Select a contact to start chatting</p>
                  <p className="text-sm mt-2">Your messages are end-to-end encrypted</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
