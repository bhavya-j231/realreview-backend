const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { User, Image } = require('../models');

// Setup Multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g. 162989.jpg
  }
});

const upload = multer({ storage });

// POST /upload-image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    const { name, email, location } = req.body;

    // Create or find user
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ name, email });
    }

    // Save image metadata
    const image = await Image.create({
      filePath: req.file.path,
      location,
      timestamp: new Date(),
      userId: user.id,
      status: 'pending'
    });

    res.status(201).json({ message: 'Image uploaded', image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
