const express = require('express');
const router = express.Router();
const { User, Image } = require('../models');
const { Sequelize } = require('sequelize');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all pending images
router.get('/pending-images', isAdmin, async (req, res) => {
  try {
    const images = await Image.findAll({
      where: { status: 'pending' },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending images' });
  }
});

// Approve/reject an image
router.put('/image/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    image.status = status;
    await image.save();
    res.json(image);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update image status' });
  }
});

// Archive old images
router.post('/archive-images', isAdmin, async (req, res) => {
  try {
    const result = await Image.update(
      { status: 'archived' },
      {
        where: {
          status: 'approved',
          archiveDate: { [Sequelize.Op.lte]: new Date() }
        }
      }
    );
    res.json({ message: `${result[0]} images archived` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive images' });
  }
});

module.exports = router; 