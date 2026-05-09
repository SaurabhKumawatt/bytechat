import multer from 'multer';
import sharp from 'sharp';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024
  },
  fileFilter
});

const detectMessageType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = req.file;
    let buffer = file.buffer;
    let thumbnailUrl = null;

    const messageType = detectMessageType(file.mimetype);

    if (messageType === 'image') {
      try {
        buffer = await sharp(file.buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        const thumbnailBuffer = await sharp(file.buffer)
          .resize(200, 200, { fit: 'cover' })
          .jpeg({ quality: 70 })
          .toBuffer();

        const thumbnailResult = await uploadToCloudinary(thumbnailBuffer, {
          transformation: [
            { width: 200, height: 200, crop: 'fill' }
          ]
        });

        thumbnailUrl = thumbnailResult.secure_url;
      } catch (error) {
        console.error('Image processing error:', error);
      }
    }

    const uploadResult = await uploadToCloudinary(buffer, {
      resource_type: messageType === 'document' ? 'raw' : 'auto'
    });

    res.status(200).json({
      fileUrl: uploadResult.secure_url,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      messageType,
      thumbnailUrl,
      publicId: uploadResult.public_id
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message
    });
  }
};

export const uploadVoiceNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const file = req.file;

    const uploadResult = await uploadToCloudinary(file.buffer, {
      resource_type: 'video',
      format: 'mp3'
    });

    res.status(200).json({
      fileUrl: uploadResult.secure_url,
      fileName: `voice-note-${Date.now()}.mp3`,
      fileSize: file.size,
      mimeType: 'audio/mpeg',
      messageType: 'audio',
      duration: uploadResult.duration,
      publicId: uploadResult.public_id
    });

  } catch (error) {
    console.error('Voice note upload error:', error);
    res.status(500).json({
      error: 'Failed to upload voice note',
      message: error.message
    });
  }
};
