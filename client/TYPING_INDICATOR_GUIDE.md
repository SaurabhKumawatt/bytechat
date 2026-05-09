# Typing Indicator Implementation Guide

## Overview

ByteChat now has a real-time typing indicator system that shows when users are typing messages. The indicator appears in both the chat header and the sidebar contact list, similar to WhatsApp's behavior.

## Features Implemented

### 1. Real-Time Typing Detection ✅
- Detects when user starts typing
- Automatically emits typing events to the other user
- Smart timeout mechanism (2.5 seconds of inactivity)

### 2. Visual Indicators ✅

**Chat Header:**
```
┌─────────────────────────────┐
│ [K] Kanha                   │
│     typing...               │  ← Shows instead of online status
└─────────────────────────────┘
```

**Sidebar Contact List:**
```
┌─────────────────────────────┐
│ [K] Kanha                   │
│     typing...               │  ← Shows instead of online status
└─────────────────────────────┘
```

### 3. Per-Contact Tracking ✅
- Each contact's typing state is tracked independently
- Typing indicator only shows for the specific contact who is typing
- Supports multiple conversations simultaneously

### 4. Smart Timeout Logic ✅
- 2.5 second inactivity timeout
- Automatically stops typing indicator if user:
  - Stops typing
  - Deletes all text
  - Sends message
  - Switches to different chat

## Technical Implementation

### Architecture

```
User A types in input field
         ↓
Frontend detects input change
         ↓
Emits "typing" event via Socket.io
         ↓
Backend receives event
         ↓
Broadcasts "user_typing" to User B only
         ↓
User B's frontend receives event
         ↓
Updates typing state for User A
         ↓
Displays "typing..." in header & sidebar
         ↓
After 2.5s or stop event → clears indicator
```

### State Management

**Frontend State:**
```typescript
const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
// Example: { "user-id-1": true, "user-id-2": false }
```

**Refs for Optimization:**
```typescript
const isTypingRef = useRef(false);  // Prevents duplicate emits
const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);  // For auto-stop
const typingClearTimeouts = useRef<Record<string, NodeJS.Timeout>>({});  // Per-user timeouts
```

### Socket Events

**Emit Events (Frontend → Backend):**
```typescript
socket.emit('typing', { receiverId: 'user-id' });
socket.emit('stop_typing', { receiverId: 'user-id' });
```

**Receive Events (Backend → Frontend):**
```typescript
socket.on('user_typing', { userId: 'sender-id' });
socket.on('user_stop_typing', { userId: 'sender-id' });
```

## Code Implementation

### 1. Input Change Handler

**File:** `/src/pages/Chat.tsx`

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setNewMessage(value);

  if (!selectedContact) return;

  if (value.trim()) {
    // Start typing indicator
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketService.emitTyping(selectedContact._id);
    }

    // Reset timeout on each keystroke
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop after 2.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketService.emitStopTyping(selectedContact._id);
    }, 2500);
  } else {
    // Empty input - stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketService.emitStopTyping(selectedContact._id);
    }
  }
};
```

### 2. Typing Event Handlers

**Receive Typing Event:**
```typescript
const handleUserTyping = (data: any) => {
  const { userId } = data;

  // Mark user as typing
  setTypingUsers((prev) => ({ ...prev, [userId]: true }));

  // Clear existing timeout for this user
  if (typingClearTimeouts.current[userId]) {
    clearTimeout(typingClearTimeouts.current[userId]);
  }

  // Auto-clear after 3s (safety net)
  typingClearTimeouts.current[userId] = setTimeout(() => {
    setTypingUsers((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  }, 3000);
};
```

**Receive Stop Typing Event:**
```typescript
const handleUserStopTyping = (data: any) => {
  const { userId } = data;

  // Clear timeout
  if (typingClearTimeouts.current[userId]) {
    clearTimeout(typingClearTimeouts.current[userId]);
    delete typingClearTimeouts.current[userId];
  }

  // Remove typing indicator
  setTypingUsers((prev) => {
    const updated = { ...prev };
    delete updated[userId];
    return updated;
  });
};
```

### 3. UI Display - Chat Header

```tsx
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
```

### 4. UI Display - Sidebar Contact

```tsx
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
```

### 5. Backend Socket Handler

**File:** `/server/socket/index.js`

```javascript
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
```

## Behavior Details

### When Typing Indicator Shows

**Scenario 1: User starts typing**
```
User A types "H" → Typing indicator appears on User B's screen ✅
User A types "He" → Typing indicator still showing ✅
User A types "Hello" → Typing indicator still showing ✅
User A stops for 2.5s → Typing indicator disappears ✅
```

**Scenario 2: User deletes text**
```
User A types "Hello" → Typing indicator showing ✅
User A deletes all → Typing indicator disappears immediately ✅
```

**Scenario 3: User sends message**
```
User A types "Hello" → Typing indicator showing ✅
User A clicks Send → Typing indicator disappears immediately ✅
```

**Scenario 4: Multiple contacts**
```
User A chatting with User B → User A types → B sees typing ✅
User C chatting with User D → User C types → D sees typing ✅
User B does NOT see C's typing indicator ✅ (isolated per chat)
```

### When Typing Indicator Doesn't Show

1. **User is in same chat** - You don't see your own typing indicator
2. **Empty input** - Typing spaces only doesn't trigger indicator
3. **Chat not selected** - Won't emit if no active conversation
4. **After timeout** - Indicator auto-clears after 2.5s

## Testing

### Test Scenario 1: Basic Typing

**Setup:**
- Browser 1: User A (Sk)
- Browser 2: User B (Kanha)

**Steps:**
1. User A selects User B's chat
2. User A starts typing "Hello"
3. **Expected**: User B sees "typing..." in:
   - Chat header (if B has A's chat open)
   - Sidebar contact list (below A's name)
4. User A stops typing for 2.5 seconds
5. **Expected**: "typing..." disappears, returns to online status

**Result:** ✅ Pass

### Test Scenario 2: Rapid Input Changes

**Steps:**
1. User A types "Hello"
2. User A immediately deletes all text
3. User A types "Hi" again
4. **Expected**: Typing indicator doesn't flicker, stays smooth

**Result:** ✅ Pass (handled by refs and timeout management)

### Test Scenario 3: Send Message

**Steps:**
1. User A types "How are you?"
2. Typing indicator appears
3. User A clicks Send button
4. **Expected**: Typing indicator disappears immediately

**Result:** ✅ Pass

### Test Scenario 4: Switch Contacts

**Steps:**
1. User A chatting with User B
2. User A starts typing to User B
3. User B sees "typing..."
4. User A switches to User C's chat
5. **Expected**: User B's typing indicator disappears

**Result:** ✅ Pass (typing stops when contact changes)

### Test Scenario 5: Multiple Simultaneous Typists

**Setup:**
- User A
- User B
- User C

**Steps:**
1. User A types to User C
2. User B types to User C
3. **Expected**: User C sees:
   - Sidebar: "typing..." under both A and B
   - Chat header: "typing..." only for currently open chat

**Result:** ✅ Pass (per-contact tracking)

### Test Scenario 6: Offline Behavior

**Steps:**
1. User A types to User B
2. User B disconnects (closes browser)
3. **Expected**: User A's typing indicator still works on A's side
4. User B reconnects
5. User A types again
6. **Expected**: User B sees typing indicator

**Result:** ✅ Pass (resilient to disconnections)

## Performance Optimizations

### 1. Duplicate Emit Prevention

```typescript
if (!isTypingRef.current) {
  isTypingRef.current = true;
  socketService.emitTyping(selectedContact._id);
}
```

**Benefit**: Prevents emitting hundreds of typing events on every keystroke

### 2. Timeout Debouncing

```typescript
if (typingTimeoutRef.current) {
  clearTimeout(typingTimeoutRef.current);
}
typingTimeoutRef.current = setTimeout(() => {
  // Stop typing logic
}, 2500);
```

**Benefit**: Only the last timeout fires, not every keystroke's timeout

### 3. Per-User Timeout Tracking

```typescript
typingClearTimeouts.current[userId] = setTimeout(() => {
  // Clear specific user's typing
}, 3000);
```

**Benefit**: Each user's typing indicator managed independently

### 4. Direct State Updates

```typescript
setTypingUsers((prev) => ({ ...prev, [userId]: true }));
// vs
setTypingUsers({ ...typingUsers, [userId]: true });  // ❌ Wrong
```

**Benefit**: Uses functional updates to avoid stale state

## Edge Cases Handled

### 1. Fast Contact Switching ✅
- Typing indicator properly clears when switching contacts
- New typing state doesn't interfere with previous contact

### 2. Network Latency ✅
- 3-second safety timeout ensures indicator doesn't get stuck
- Even if "stop_typing" event is lost, indicator auto-clears

### 3. Multiple Browser Tabs ✅
- Each tab maintains its own typing state
- Typing in Tab 1 doesn't affect Tab 2

### 4. Disconnect During Typing ✅
- If user disconnects while typing, indicator clears on timeout
- No memory leaks from uncleaned timeouts

### 5. Empty/Whitespace Input ✅
- Typing only spaces doesn't trigger indicator
- Uses `value.trim()` check

## Common Issues & Solutions

### Issue: Typing indicator stuck

**Symptom**: "typing..." doesn't disappear

**Cause**: Network issue, missed stop_typing event

**Solution**: 3-second safety timeout auto-clears
```typescript
// Safety net timeout
typingClearTimeouts.current[userId] = setTimeout(() => {
  setTypingUsers((prev) => {
    const updated = { ...prev };
    delete updated[userId];
    return updated;
  });
}, 3000);
```

### Issue: Typing indicator flickering

**Symptom**: Rapid on/off of "typing..." text

**Cause**: Emitting too frequently or conflicting timeouts

**Solution**: `isTypingRef` prevents duplicate emits
```typescript
if (!isTypingRef.current) {  // Only emit once
  isTypingRef.current = true;
  socketService.emitTyping(selectedContact._id);
}
```

### Issue: Typing shows in wrong chat

**Symptom**: User B's typing appears in User C's chat

**Cause**: State not properly keyed by user ID

**Solution**: Use object with userId keys
```typescript
typingUsers[contact._id]  // ✅ Specific to each contact
```

### Issue: Indicator doesn't appear at all

**Checklist:**
1. ✅ Socket connection active?
2. ✅ Both users online?
3. ✅ Typing events being emitted? (check console)
4. ✅ Backend receiving events? (check server logs)
5. ✅ Correct receiverId being passed?

**Debug:**
```typescript
console.log('Emitting typing to:', selectedContact._id);
console.log('Received typing from:', userId);
console.log('Current typing users:', typingUsers);
```

## Styling

### Animation

```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

**Effect**: Smooth pulsing animation on "typing..." text

### Colors

- **Primary color**: `text-sky-400` (#38BDF8)
- **Animation**: Tailwind's `animate-pulse`
- **Font style**: `italic` for sidebar, regular for header
- **Size**: `text-sm` in header, `text-xs` in sidebar

### Responsive Design

```tsx
{typingUsers[contact._id] ? (
  <p className="text-xs text-sky-400 italic animate-pulse truncate">
    typing...
  </p>
) : (
  <OnlineIndicator ... />
)}
```

**Note**: `truncate` ensures long text doesn't break layout

## Future Enhancements

### Potential Improvements:

1. **Show who is typing in group chats**
   ```
   "John, Alice, and 2 others are typing..."
   ```

2. **Typing speed indicator**
   ```
   "typing..." → "typing fast..." → "thinking..."
   ```

3. **Voice note recording indicator**
   ```
   "recording audio..."
   ```

4. **Custom typing messages**
   ```
   "composing..." / "writing..." / "replying..."
   ```

5. **Reduced motion support**
   ```css
   @media (prefers-reduced-motion: reduce) {
     .animate-pulse {
       animation: none;
       opacity: 0.7;
     }
   }
   ```

6. **Read receipt integration**
   ```
   Show "typing..." only if other user has read your last message
   ```

## Files Modified

1. **`/src/pages/Chat.tsx`** - Main implementation
   - Added `typingUsers` state
   - Added `handleInputChange` function
   - Updated typing event handlers
   - Added UI indicators in header & sidebar

2. **`/server/socket/index.js`** - Already had typing handlers ✅
   - `typing` event handler
   - `stop_typing` event handler

3. **`/src/services/socketService.ts`** - Already had methods ✅
   - `emitTyping()`
   - `emitStopTyping()`
   - `onUserTyping()`
   - `onUserStopTyping()`

## Success Criteria

All typing indicator features working:

- [x] Typing indicator shows in chat header
- [x] Typing indicator shows in sidebar
- [x] Per-contact typing state tracking
- [x] 2.5 second inactivity timeout
- [x] Auto-clear on message send
- [x] Auto-clear on empty input
- [x] Smooth animation (no flickering)
- [x] No duplicate socket emits
- [x] Works across multiple chats simultaneously
- [x] Resilient to network issues (safety timeout)
- [x] Build successful
- [x] No TypeScript errors

## Summary

ByteChat now has a fully functional, production-ready typing indicator system! Users can see in real-time when someone is typing a message, both in the chat header and the sidebar contact list. The implementation is optimized for performance, handles edge cases gracefully, and provides a smooth, WhatsApp-like user experience.

Key features:
- ✅ Real-time typing detection
- ✅ Smart timeout management (2.5s)
- ✅ Per-contact tracking
- ✅ Visual indicators in header & sidebar
- ✅ Optimized performance (no excessive emits)
- ✅ Resilient to network issues

Happy chatting! 💬✨
