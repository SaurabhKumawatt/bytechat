import express from 'express';
import { uploadFile, uploadVoiceNote, upload } from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);

router.post('/upload-voice', upload.single('audio'), uploadVoiceNote);

export default router;
