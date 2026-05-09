import express from 'express';
import User from '../models/User.js';
import { getOnlineUsers } from '../socket/presence.js';

const router = express.Router();

router.get('/online', async (req, res) => {
  try {
    const onlineUserIds = getOnlineUsers();

    const users = await User.find({
      _id: { $in: onlineUserIds }
    }).select('_id name phone online lastSeen');

    return res.status(200).json({
      users
    });
  } catch (error) {
    console.error('Get online users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const users = await User.find({
      verified: true
    }).select('_id name phone online lastSeen publicKey');

    return res.status(200).json({
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('_id name phone online lastSeen publicKey');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Query must be at least 3 characters' });
    }

    const users = await User.find({
      verified: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    })
      .select('_id name phone online lastSeen')
      .limit(20);

    return res.status(200).json({
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
