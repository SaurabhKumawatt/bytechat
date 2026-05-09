import express from 'express';
import { sendMessage, getMessages, markAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/:userId/:contactId', getMessages);
router.patch('/:messageId/read', markAsRead);

export default router;
