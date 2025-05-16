// newly added
const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ExifParser = require('exif-parser');
const fs = require('fs');
const { User, Image, Rating } = require('../models');

// Setup Multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper function to extract GPS coordinates from EXIF data
const extractGPSData = (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    
    if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
      return {
        latitude: result.tags.GPSLatitude,
        longitude: result.tags.GPSLongitude
      };
    }
    return null;
  } catch (err) {
    console.error('Error parsing EXIF data:', err);
    return null;
  }
};

// Upload image with location validation
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { name, email, location, description } = req.body;
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    // Find or create user
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ name, email });
    }

    // Extract EXIF data
    const exifData = extractGPSData(req.file.path);
    
    // Create image record
    const image = await Image.create({
      filePath: req.file.path,
      location,
      latitude: exifData?.latitude,
      longitude: exifData?.longitude,
      timestamp: new Date(),
      userId: user.id,
      status: 'pending',
      description,
      exifData
    });

    res.status(201).json({ 
      message: 'Image uploaded successfully and pending approval',
      image 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get image with metadata and ratings
/* 
router.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findOne({
      where: { 
        id: req.params.id,
        status: 'approved'
      },
      include: [
        { 
          model: User,
          attributes: ['name', 'email']
        },
        {
          model: Rating,
          include: [{
            model: User,
            attributes: ['name']
          }]
        }
      ]
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found or not approved' });
    }

    res.json(image);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});
*/

// Rate an image
router.post('/image/:id/rate', async (req, res) => {
  try {
    const { score, userId } = req.body;
    
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const image = await Image.findOne({
      where: { 
        id: req.params.id,
        status: 'approved'
      }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found or not approved' });
    }

    // Create or update rating
    const [rating, created] = await Rating.findOrCreate({
      where: { userId, imageId: image.id },
      defaults: { score }
    });

    if (!created) {
      rating.score = score;
      await rating.save();
    }

    // Update average rating
    const ratings = await Rating.findAll({
      where: { imageId: image.id }
    });

    const avgRating = ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length;
    image.rating = avgRating;
    await image.save();

    res.json({ message: 'Rating saved', rating: avgRating });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

// Get all approved images
/*
router.get('/images', async (req, res) => {
  try {
    const images = await Image.findAll({
      where: { status: 'approved' },
      include: [
        { 
          model: User,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});
*/
// test
router.get('/image/:id', async (req, res) => {
  try {
    const image = await Image.findOne({
      where: { 
        id: req.params.id,
        status: 'approved'
      },
      include: [
        { 
          model: User,
          attributes: ['name', 'email']
        }
      ]
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found or not approved' });
    }

    res.json(image);
  } catch (err) {
    console.error('Error fetching image:', err);  // Log full error
    res.status(500).json({ error: 'Failed to fetch image hh' });
  }
});


// PUT /images/archive-old
router.put('/images/archive-old', async (req, res) => {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const archived = await Image.update(
      { status: 'archived' },
      { where: { timestamp: { [Op.lt]: cutoffDate }, status: 'approved' } }
    );
    res.json({ message: 'Old images archived', archived });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Archiving failed' });
  }
});


// newly added 

// PATCH /image/:id/approve - Approve an image (admin only)
/*
router.patch('/image/:id/approve', async (req, res) => {
  try {
    // Assuming you have req.user set after authentication middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await User.findByPk(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    // Find the image
    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Approve image
    image.status = 'approved';
    await image.save();

    res.json({ message: 'Image approved', image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve image' });
  }
});
*/

// new patch
// PATCH /image/:id/approve - Approve an image (admin only)
router.patch('/image/:id/approve', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const image = await Image.findByPk(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    image.status = 'approved';
    await image.save();

    res.json({ message: 'Image approved', image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve image' });
  }
});


module.exports = router;
