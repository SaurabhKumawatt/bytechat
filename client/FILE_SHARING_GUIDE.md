# ByteChat File Sharing System - Complete Implementation Guide

## Overview

ByteChat now supports rich media sharing including images, videos, audio files, documents, and voice notes. Files are uploaded to Cloudinary for reliable storage and delivery.

## ⚠️ Important Setup Required

### 1. Cloudinary Account Setup

**You MUST create a free Cloudinary account before file sharing will work:**

1. Go to: https://cloudinary.com/users/register/free
2. Sign up for a free account
3. After logging in, go to Dashboard: https://cloudinary.com/console
4. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configure Environment Variables

**File:** `/server/.env`

Add these lines (replace with your actual Cloudinary credentials):

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=bytechat-demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Backend Implementation (✅ Complete)

### 1. Packages Installed

```bash
npm install multer cloudinary sharp
```

- **multer**: File upload handling
- **cloudinary**: Cloud storage SDK
- **sharp**: Image processing and compression

### 2. Message Schema Extended

**File:** `/server/models/Message.js`

**New Fields Added:**

```javascript
{
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document'],
    default: 'text'
  },
  fileUrl: String,          // Cloudinary URL
  fileName: String,         // Original filename
  fileSize: Number,         // Size in bytes
  mimeType: String,         // MIME type (e.g., 'image/jpeg')
  thumbnailUrl: String      // Thumbnail for images/videos
}
```

**Conditional Requirements:**
- Text messages: Require `encryptedMessage`, `iv`, `encryptedAESKey`
- File messages: Require `fileUrl`, `messageType`

### 3. API Endpoints Created

#### Upload File

**Endpoint:** `POST /api/files/upload`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body:**
```
file: (binary file data)
```

**Response:**
```json
{
  "fileUrl": "https://res.cloudinary.com/...",
  "fileName": "image.jpg",
  "fileSize": 245678,
  "mimeType": "image/jpeg",
  "messageType": "image",
  "thumbnailUrl": "https://res.cloudinary.com/...thumbnail",
  "publicId": "bytechat/abc123"
}
```

#### Upload Voice Note

**Endpoint:** `POST /api/files/upload-voice`

**Body:**
```
audio: (binary audio data)
```

**Response:**
```json
{
  "fileUrl": "https://res.cloudinary.com/...",
  "fileName": "voice-note-1234567890.mp3",
  "fileSize": 45678,
  "mimeType": "audio/mpeg",
  "messageType": "audio",
  "duration": 12.5,
  "publicId": "bytechat/voice123"
}
```

### 4. File Validation

**Max File Size:** 25MB

**Allowed Types:**

**Images:**
- image/jpeg
- image/png
- image/gif
- image/webp

**Videos:**
- video/mp4
- video/webm
- video/quicktime

**Audio:**
- audio/mpeg
- audio/wav
- audio/webm
- audio/ogg

**Documents:**
- application/pdf
- application/msword (.doc)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
- application/vnd.ms-excel (.xls)
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx)
- text/plain (.txt)

### 5. Image Processing

**Compression:**
- Images resized to max 1920x1080 (maintains aspect ratio)
- Quality: 85% (good balance of size vs quality)
- Format: JPEG (smaller file sizes)

**Thumbnails:**
- Generated automatically for images
- Size: 200x200 (cover fit)
- Quality: 70%

### 6. Socket Events

**Send File Message:**

**Event:** `send_file_message`

**Data:**
```javascript
{
  senderId: 'user-id',
  receiverId: 'user-id',
  fileUrl: 'https://...',
  fileName: 'photo.jpg',
  fileSize: 123456,
  mimeType: 'image/jpeg',
  messageType: 'image',
  thumbnailUrl: 'https://...thumbnail'
}
```

**Receive File Message:**

**Event:** `receive_file_message`

**Event:** `file_message_sent` (confirmation to sender)

## Frontend Implementation (🛠️ To Be Implemented)

### Required Components

#### 1. File Upload Button

**Add to Chat Input Area:**

```tsx
import { Paperclip, Image, File, Mic } from 'lucide-react';

// Inside Chat component
const [showAttachMenu, setShowAttachMenu] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Show upload progress
  setUploading(true);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await axios.post(`${apiUrl}/api/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
        setUploadProgress(progress);
      }
    });

    // Send file message via socket
    if (selectedContact && user?.id) {
      socketService.sendFileMessage({
        senderId: user.id,
        receiverId: selectedContact._id,
        ...response.data
      });
    }
  } catch (error) {
    console.error('File upload failed:', error);
    alert('Failed to upload file');
  } finally {
    setUploading(false);
    setUploadProgress(0);
  }
};
```

**UI Button:**

```tsx
<div className="relative">
  {/* Attachment button */}
  <button
    type="button"
    onClick={() => setShowAttachMenu(!showAttachMenu)}
    className="p-2 text-gray-400 hover:text-sky-400 transition-colors"
  >
    <Paperclip className="w-5 h-5" />
  </button>

  {/* Attachment menu */}
  {showAttachMenu && (
    <div className="absolute bottom-12 left-0 bg-[#1E293B] rounded-lg shadow-lg p-2 space-y-1">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 hover:bg-sky-500/20 rounded-lg w-full text-left"
      >
        <Image className="w-4 h-4 text-sky-400" />
        <span className="text-sm">Photo or Video</span>
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 hover:bg-sky-500/20 rounded-lg w-full text-left"
      >
        <File className="w-4 h-4 text-green-400" />
        <span className="text-sm">Document</span>
      </button>
      <button
        onClick={startVoiceRecording}
        className="flex items-center gap-2 px-4 py-2 hover:bg-sky-500/20 rounded-lg w-full text-left"
      >
        <Mic className="w-4 h-4 text-red-400" />
        <span className="text-sm">Voice Note</span>
      </button>
    </div>
  )}

  {/* Hidden file input */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
    onChange={handleFileSelect}
    className="hidden"
  />
</div>
```

#### 2. Update ChatBubble Component

**File:** `/src/components/ChatBubble.tsx`

```tsx
export const ChatBubble = ({
  message,
  messageType = 'text',
  fileUrl,
  fileName,
  fileSize,
  thumbnailUrl,
  isSender,
  timestamp,
  status,
  deliveredAt,
  seenAt
}: ChatBubbleProps) => {

  const renderMessageContent = () => {
    switch (messageType) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={thumbnailUrl || fileUrl}
              alt="Shared image"
              className="rounded-lg max-w-[300px] cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
        );

      case 'video':
        return (
          <video
            src={fileUrl}
            controls
            className="rounded-lg max-w-[300px]"
          />
        );

      case 'audio':
        return (
          <div className="flex items-center gap-2 py-2">
            <audio
              src={fileUrl}
              controls
              className="max-w-[250px]"
            />
          </div>
        );

      case 'document':
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <File className="w-5 h-5" />
            <div className="flex-1">
              <p className="text-sm font-medium truncate max-w-[200px]">
                {fileName}
              </p>
              <p className="text-xs opacity-70">
                {formatFileSize(fileSize)}
              </p>
            </div>
            <Download className="w-4 h-4" />
          </a>
        );

      default:
        return <p className="text-sm leading-relaxed break-words">{message}</p>;
    }
  };

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={/* ... existing styles */}>
        {renderMessageContent()}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] opacity-70">
            {formatMessageTime(timestamp)}
          </span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
};
```

#### 3. Socket Service Methods

**File:** `/src/services/socketService.ts`

```typescript
sendFileMessage(data: {
  senderId: string;
  receiverId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  messageType: string;
  thumbnailUrl?: string;
}) {
  if (!this.socket) return;
  this.socket.emit('send_file_message', data);
}

onReceiveFileMessage(callback: (data: any) => void) {
  if (!this.socket) return;
  this.socket.on('receive_file_message', callback);
}

onFileMessageSent(callback: (data: any) => void) {
  if (!this.socket) return;
  this.socket.on('file_message_sent', callback);
}
```

#### 4. Message Handlers in Chat Component

```typescript
const handleReceiveFileMessage = (data: any) => {
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
    status: 'delivered'
  };

  setMessages((prev) => {
    const exists = prev.some(m => m.id === newMsg.id);
    if (exists) return prev;
    return [...prev, newMsg];
  });

  // Show notification
  if (notificationsEnabled && selectedContact?._id !== data.senderId) {
    const sender = contacts.find(c => c._id === data.senderId);
    NotificationManager.showMessageNotification(
      sender?.name || 'Unknown',
      `Sent a ${data.messageType}`,
      data.senderId
    );
  }

  socketService.markMessageDelivered(data.messageId);
};

const handleFileMessageSent = (data: any) => {
  setMessages((prev) => {
    return prev.map(m => {
      if (m.id.startsWith('temp-') && m.senderId === data.senderId) {
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

// Register handlers
useEffect(() => {
  // ... existing handlers
  socketService.onReceiveFileMessage(handleReceiveFileMessage);
  socketService.onFileMessageSent(handleFileMessageSent);

  return () => {
    socketService.removeAllListeners();
  };
}, [user, selectedContact]);
```

#### 5. Voice Note Recorder

**Component:** `/src/components/VoiceRecorder.tsx`

```tsx
import { useState, useRef } from 'react';
import { Mic, Square, Send } from 'lucide-react';

export const VoiceRecorder = ({ onSend }: { onSend: (audioBlob: Blob) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="p-2 text-red-400 hover:text-red-300 transition"
        >
          <Mic className="w-5 h-5" />
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="p-2 text-sky-400 hover:text-sky-300 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};
```

**Upload Voice Note:**

```tsx
const handleVoiceNoteSend = async (audioBlob: Blob) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-note.webm');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await axios.post(`${apiUrl}/api/files/upload-voice`, formData);

    if (selectedContact && user?.id) {
      socketService.sendFileMessage({
        senderId: user.id,
        receiverId: selectedContact._id,
        ...response.data
      });
    }
  } catch (error) {
    console.error('Voice note upload failed:', error);
  }
};
```

#### 6. Utility Functions

```typescript
// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Detect file type from MIME
export const getFileTypeIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType === 'application/pdf') return '📄';
  return '📎';
};
```

## Testing

### Test File Upload

**1. Start Backend:**
```bash
cd server
npm start
```

**2. Test Upload Endpoint:**

```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/image.jpg"
```

**Expected Response:**
```json
{
  "fileUrl": "https://res.cloudinary.com/...",
  "fileName": "image.jpg",
  "fileSize": 123456,
  "mimeType": "image/jpeg",
  "messageType": "image",
  "thumbnailUrl": "https://res.cloudinary.com/...thumbnail"
}
```

### Test Scenarios

#### Scenario 1: Send Image

1. User A clicks attachment button
2. Selects image file
3. Upload progress shows
4. Image appears in chat with thumbnail
5. User B receives image instantly
6. Click image to view full size

#### Scenario 2: Send Document

1. User A selects PDF file
2. Document card appears in chat
3. Shows filename and size
4. User B can download by clicking

#### Scenario 3: Voice Note

1. User A clicks microphone
2. Records 10 seconds
3. Clicks send
4. Audio player appears in chat
5. User B receives and can play

## Cloudinary Dashboard

### View Uploaded Files

1. Login: https://cloudinary.com/console
2. Go to: Media Library
3. Navigate to: `bytechat` folder
4. See all uploaded files with thumbnails

### Storage Limits (Free Tier)

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- More than enough for testing and small-scale deployment!

## Security Considerations

### Current Implementation

**✅ Secure:**
- File size limits (25MB)
- File type validation
- Cloudinary handles storage security
- HTTPS for all transfers

**⚠️ Not Encrypted:**
- Files stored unencrypted on Cloudinary
- Anyone with URL can access file
- Trade-off for convenience and previews

### Adding E2E Encryption (Advanced)

If you want true end-to-end encryption for files:

1. **Encrypt on client before upload:**
```typescript
const encryptFile = async (file: File, aesKey: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.lib.WordArray.create(arrayBuffer),
    aesKey
  );
  return encrypted.toString();
};
```

2. **Upload encrypted blob**
3. **Store AES key encrypted with RSA** (like text messages)
4. **Decrypt on recipient's device**

**Trade-offs:**
- ✅ True E2E encryption
- ❌ No server-side thumbnails
- ❌ Can't preview without downloading
- ❌ More complex implementation

## Troubleshooting

### Issue: Upload fails with "Invalid file type"

**Cause**: File type not in allowed list

**Solution**: Check `fileFilter` in `/server/controllers/fileController.js` and add MIME type

### Issue: "Cloudinary configuration error"

**Cause**: Missing or incorrect credentials

**Solution**:
1. Check `.env` file has correct values
2. Restart server after changing `.env`
3. Verify credentials on Cloudinary dashboard

### Issue: Images not compressing

**Cause**: Sharp module not working

**Solution**:
```bash
cd server
npm rebuild sharp
```

### Issue: Large files taking too long

**Cause**: 25MB limit too high

**Solution**: Reduce `fileSize` limit in `fileController.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024  // 10MB instead
}
```

### Issue: Voice notes not working

**Cause**: Microphone permission denied

**Solution**: Browser must be on HTTPS or localhost

## Performance Optimization

### Image Optimization

Current settings:
- Max dimensions: 1920x1080
- Quality: 85%
- Format: JPEG

**For faster uploads, reduce:**
```javascript
.resize(1280, 720)  // Smaller resolution
.jpeg({ quality: 75 })  // Lower quality
```

### Progressive Loading

Show thumbnail first, load full image on click:

```tsx
<img
  src={thumbnailUrl}
  onClick={() => setFullImageModal(fileUrl)}
  className="cursor-pointer"
/>
```

### Lazy Loading

Only load images when scrolled into view:

```tsx
<img
  src={fileUrl}
  loading="lazy"
  alt="Shared image"
/>
```

## Future Enhancements

1. **File Encryption** - E2E encrypt files before upload
2. **Multiple File Selection** - Send multiple files at once
3. **Drag & Drop** - Drag files into chat
4. **File Gallery** - View all shared media
5. **Video Compression** - Compress videos before upload
6. **Audio Waveforms** - Show waveform for audio files
7. **File Expiry** - Auto-delete files after X days
8. **Direct Camera Access** - Take photo/video directly in app

## Summary

Backend for file sharing is now complete! The system supports:

- ✅ Images with auto-compression & thumbnails
- ✅ Videos
- ✅ Audio files
- ✅ Documents (PDF, Word, Excel, etc.)
- ✅ Voice notes
- ✅ Real-time delivery via Socket.io
- ✅ Status tracking (sent/delivered/seen)
- ✅ Cloud storage with Cloudinary

**Next Steps:**

1. **Get Cloudinary credentials** (5 minutes)
2. **Add to `.env` file** (1 minute)
3. **Implement frontend UI** (follow guide above)
4. **Test with real files**

Once Cloudinary is configured and frontend is implemented, users can share any type of file seamlessly! 📎🖼️🎥🎵📄
