# ByteChat Browser Notifications Guide

## Overview

ByteChat now supports browser notifications to alert users when they receive new messages, even when the browser tab is inactive or minimized.

## Features Implemented

### 1. Browser Notifications ✅
- Desktop notifications when receiving messages
- Shows sender name and message preview
- Notification sound plays when message arrives
- Auto-dismiss after 5 seconds
- Click notification to open chat with that contact

### 2. Smart Notification Logic ✅
Notifications only appear when:
- User has granted notification permission
- Browser tab is hidden/minimized OR
- User is chatting with a different contact

This prevents unnecessary notifications when you're actively chatting with someone.

### 3. Notification Toggle ✅
- Bell icon in the header to enable/disable notifications
- Visual indicator (Bell vs BellOff icon)
- Shows "On" or "Off" status

### 4. Auto Permission Request ✅
- Automatically requests permission when user logs in
- No intrusive pop-ups if permission already granted
- Can be manually toggled anytime

## How It Works

### Notification Flow

```
User B sends message to User A
         ↓
User A's browser receives message via Socket.io
         ↓
Check: Is User A's tab hidden OR chatting with someone else?
         ↓ YES
Check: Are notifications enabled?
         ↓ YES
Decrypt message
         ↓
Show browser notification
  - Title: "New message from [Sender Name]"
  - Body: "[Message text]"
  - Icon: ByteChat logo
  - Sound: Notification beep
         ↓
User clicks notification
         ↓
Browser tab focuses
Contact chat opens automatically
```

### Permission Request Flow

```
User logs into ByteChat
         ↓
App requests notification permission
         ↓
Browser shows permission dialog
         ↓
User clicks "Allow" or "Block"
         ↓
Permission status saved
         ↓
Bell icon updates to show current status
```

## Using Notifications

### Enable Notifications

1. Open ByteChat and login
2. Browser will show permission dialog
3. Click "Allow" to enable notifications
4. Bell icon in header turns solid

### Disable Notifications

1. Click the Bell icon in the header
2. Icon changes to BellOff
3. No more notifications until re-enabled

### Re-enable If Blocked

If you previously blocked notifications:

1. Click the lock icon in browser address bar
2. Find "Notifications" setting
3. Change from "Block" to "Allow"
4. Refresh ByteChat
5. Click Bell icon to enable

## Browser Support

### Supported Browsers
- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Safari 14+
- ✅ Edge 79+
- ✅ Opera 37+

### Not Supported
- ❌ Internet Explorer
- ❌ Very old browsers
- ❌ Some mobile browsers (depending on OS settings)

## Notification Behavior

### When Notifications Appear

**Scenario 1**: Tab is minimized or hidden
```
You're on a different tab → Message arrives → Notification shows ✅
```

**Scenario 2**: Chatting with different person
```
You're chatting with Alice → Bob sends message → Notification shows ✅
```

**Scenario 3**: Actively chatting with sender
```
You're chatting with Alice → Alice sends message → No notification ❌
(Message appears directly in chat)
```

### Notification Content

```
┌─────────────────────────────────┐
│ 🔔 New message from Alice       │
│                                  │
│ Hey! Are you free for lunch     │
│ tomorrow?                        │
│                                  │
│ ByteChat • Just now             │
└─────────────────────────────────┘
```

### Notification Actions

**Click notification**:
- Focuses browser window
- Opens chat with sender
- Notification dismisses

**Ignore notification**:
- Auto-dismisses after 5 seconds
- Message still visible in chat

## Technical Implementation

### Files Created/Modified

1. **`/src/utils/notifications.ts`** - NEW
   - NotificationManager class
   - Permission handling
   - Notification creation
   - Sound playback

2. **`/src/pages/Chat.tsx`** - MODIFIED
   - Import NotificationManager
   - Add notification state
   - Add permission request
   - Add toggle button
   - Show notifications on message receive

### Key Code Snippets

#### Request Permission
```typescript
const requestNotificationPermission = async () => {
  const granted = await NotificationManager.requestPermission();
  setNotificationsEnabled(granted);
};
```

#### Show Notification on Message
```typescript
if (notificationsEnabled && (NotificationManager.isDocumentHidden() || selectedContact?._id !== data.senderId)) {
  NotificationManager.showMessageNotification(
    senderName,
    plainText,
    data.senderId
  );
}
```

#### Toggle Notifications
```typescript
const toggleNotifications = async () => {
  if (!notificationsEnabled) {
    const granted = await NotificationManager.requestPermission();
    setNotificationsEnabled(granted);
  } else {
    setNotificationsEnabled(false);
  }
};
```

## Privacy & Security

### What Information Is Shown
- ✅ Sender's name (from your contacts)
- ✅ Message preview (first 100 characters)
- ❌ NOT shown to other people on your computer

### Where Notifications Appear
- On your device only
- In your operating system's notification center
- Following your OS notification settings

### Notification Permissions
- Granted per-browser, per-site
- You can revoke at any time
- No server-side tracking

## Troubleshooting

### Issue: Permission dialog doesn't appear

**Cause**: Permission already denied or granted previously

**Solution**:
1. Click lock icon in address bar
2. Check notification permission
3. Reset to "Ask" and reload page

### Issue: Notifications not showing

**Check**:
1. Is the Bell icon solid (enabled)?
2. Did you allow browser permissions?
3. Are OS notifications enabled?
4. Is "Do Not Disturb" mode active?

**Solution**:
```
1. Check bell icon - should be solid, not crossed out
2. Browser settings → Site settings → Notifications → Allow
3. OS settings → Notifications → Browser → On
4. Disable Do Not Disturb mode
```

### Issue: Sound not playing

**Cause**: Browser autoplay policy

**Solution**: Notifications use inline audio data that usually works. If not:
- Click anywhere on the page first (user interaction)
- Check browser volume/mute settings

### Issue: Notification shows "Unknown" sender

**Cause**: Contacts list not loaded yet

**Solution**: Wait a moment for contacts to load, then test again

### Issue: Click notification doesn't open chat

**Cause**: Contact not found or page focus issue

**Solution**: Should work automatically. If not, manually click the contact.

## Testing Notifications

### Test Setup

**User A (Your main browser)**:
1. Login to ByteChat
2. Allow notifications
3. Minimize browser OR open different tab

**User B (Incognito window)**:
1. Login with different account
2. Send message to User A

**Expected Result**:
- User A sees notification
- Notification shows User B's name and message
- Sound plays
- Clicking notification opens User B's chat

### Test Scenarios

**Test 1: Hidden Tab**
```
1. User A minimizes ByteChat tab
2. User B sends message
3. ✅ Notification appears
4. User A clicks notification
5. ✅ ByteChat tab opens and shows message
```

**Test 2: Different Contact**
```
1. User A is chatting with User C
2. User B sends message to User A
3. ✅ Notification appears for User B's message
4. User A's chat with User C stays open
```

**Test 3: Active Chat**
```
1. User A is chatting with User B
2. User B sends message
3. ❌ No notification (message shows directly)
4. ✅ Expected behavior
```

**Test 4: Toggle Off**
```
1. User A clicks Bell icon to disable
2. User B sends message
3. ❌ No notification
4. ✅ Message still received in chat
```

## Best Practices

### For Users

1. **Enable notifications** to never miss messages
2. **Keep tab open** for best real-time experience
3. **Use toggle** to silence during focus time
4. **Check permissions** if notifications stop working

### For Developers

1. **Respect user choice** - don't force notifications
2. **Check document visibility** - don't notify active chats
3. **Handle permission denial** - gracefully degrade
4. **Test across browsers** - behavior may vary
5. **Provide toggle** - let users control notifications

## Future Enhancements

Potential improvements:

1. **Custom notification sounds**
   - Let users choose sound
   - Different sounds per contact
   - Volume control

2. **Notification grouping**
   - Combine multiple messages from same sender
   - Show unread count

3. **Rich notifications**
   - Quick reply from notification
   - Mark as read action
   - Snooze option

4. **Desktop app integration**
   - Native notifications
   - System tray integration
   - Background sync

5. **Mobile push notifications**
   - Using service workers
   - Background message sync
   - iOS/Android native

6. **Do Not Disturb schedule**
   - Quiet hours
   - Custom schedules
   - Meeting mode

## API Reference

### NotificationManager Class

```typescript
class NotificationManager {
  // Request notification permission
  static requestPermission(): Promise<boolean>

  // Show a notification
  static showNotification(title: string, options?: NotificationOptions): Promise<void>

  // Show message notification (convenience method)
  static showMessageNotification(senderName: string, message: string, contactId: string): void

  // Check if document is hidden
  static isDocumentHidden(): boolean

  // Check if notifications are supported
  static isSupported(): boolean

  // Get current permission status
  static getPermissionStatus(): NotificationPermission
}
```

### Usage Example

```typescript
import { NotificationManager } from '../utils/notifications';

// Request permission
const granted = await NotificationManager.requestPermission();

// Show notification
if (granted) {
  NotificationManager.showMessageNotification(
    'John Doe',
    'Hey, how are you?',
    'user-id-123'
  );
}

// Check status
const status = NotificationManager.getPermissionStatus();
console.log('Notification permission:', status);
```

## Success Criteria

All notification features working:

- [x] Permission request on login
- [x] Browser notifications on message receive
- [x] Smart notification logic (only when needed)
- [x] Notification sound plays
- [x] Click notification opens chat
- [x] Toggle button works
- [x] Visual indicator (Bell/BellOff)
- [x] No notifications during active chat
- [x] Message preview in notification
- [x] Sender name displayed correctly
- [x] Auto-dismiss after 5 seconds
- [x] Build successful

## Summary

Browser notifications are now fully functional in ByteChat! Users will receive desktop notifications when messages arrive, making sure they never miss an important message even when the app is in the background.

The smart notification system ensures you only get notified when necessary, and the easy toggle lets you control when you want to be interrupted.

Enjoy your enhanced ByteChat experience! 🔔✨
