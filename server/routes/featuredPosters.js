import express from 'express';
import FeaturedPoster from '../models/FeaturedPoster.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/featured-posters
// @desc    Get all active featured posters (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posters = await FeaturedPoster.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');
    
    res.json(posters);
  } catch (error) {
    console.error('Error fetching featured posters:', error);
    res.status(500).json({ message: 'Failed to fetch featured posters' });
  }
});

// @route   GET /api/featured-posters/admin/all
// @desc    Get all featured posters including inactive (admin)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const posters = await FeaturedPoster.find()
      .sort({ order: 1 })
      .select('-__v');
    
    res.json(posters);
  } catch (error) {
    console.error('Error fetching all featured posters:', error);
    res.status(500).json({ message: 'Failed to fetch featured posters' });
  }
});

// @route   POST /api/featured-posters
// @desc    Create a new featured poster
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, category, image, colorGradient, order, isActive } = req.body;

    // Validation
    if (!title || !category || !image) {
      return res.status(400).json({ 
        message: 'Title, category, and image are required' 
      });
    }

    // Get the highest order number if no order specified
    let posterOrder = order;
    if (posterOrder === undefined || posterOrder === null) {
      const lastPoster = await FeaturedPoster.findOne().sort({ order: -1 });
      posterOrder = lastPoster ? lastPoster.order + 1 : 0;
    }

    const poster = await FeaturedPoster.create({
      title,
      category,
      image,
      colorGradient: colorGradient || 'from-purple-600 to-pink-600',
      order: posterOrder,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(poster);
  } catch (error) {
    console.error('Error creating featured poster:', error);
    res.status(500).json({ message: 'Failed to create featured poster' });
  }
});

// @route   PUT /api/featured-posters/:id
// @desc    Update a featured poster
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, category, image, colorGradient, order, isActive } = req.body;

    const poster = await FeaturedPoster.findById(req.params.id);

    if (!poster) {
      return res.status(404).json({ message: 'Featured poster not found' });
    }

    // Update fields
    if (title !== undefined) poster.title = title;
    if (category !== undefined) poster.category = category;
    if (image !== undefined) poster.image = image;
    if (colorGradient !== undefined) poster.colorGradient = colorGradient;
    if (order !== undefined) poster.order = order;
    if (isActive !== undefined) poster.isActive = isActive;

    await poster.save();

    res.json(poster);
  } catch (error) {
    console.error('Error updating featured poster:', error);
    res.status(500).json({ message: 'Failed to update featured poster' });
  }
});

// @route   PUT /api/featured-posters/reorder
// @desc    Reorder featured posters
// @access  Private/Admin
router.put('/reorder/bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const { posters } = req.body; // Array of { id, order }

    if (!Array.isArray(posters)) {
      return res.status(400).json({ message: 'Posters array is required' });
    }

    // Update all orders in bulk
    const updatePromises = posters.map(({ id, order }) =>
      FeaturedPoster.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedPosters = await FeaturedPoster.find()
      .sort({ order: 1 })
      .select('-__v');

    res.json(updatedPosters);
  } catch (error) {
    console.error('Error reordering featured posters:', error);
    res.status(500).json({ message: 'Failed to reorder featured posters' });
  }
});

// @route   DELETE /api/featured-posters/:id
// @desc    Delete a featured poster
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const poster = await FeaturedPoster.findById(req.params.id);

    if (!poster) {
      return res.status(404).json({ message: 'Featured poster not found' });
    }

    await poster.deleteOne();

    res.json({ message: 'Featured poster deleted successfully' });
  } catch (error) {
    console.error('Error deleting featured poster:', error);
    res.status(500).json({ message: 'Failed to delete featured poster' });
  }
});

export default router;
