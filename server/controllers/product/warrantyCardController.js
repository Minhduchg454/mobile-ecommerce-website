const WarrantyCard = require('../../models/product/WarrantyCard')
const asyncHandler = require('express-async-handler')

// Create a new warranty card
const createWarrantyCard = asyncHandler(async (req, res) => {
  const { warrantyCode, startDate, expirationDate, specificProductId } = req.body;

  if (!warrantyCode || !expirationDate || !specificProductId) {
    return res.status(400).json({ success: false, mes: 'Missing required fields.' });
  }

  const _startDate = startDate ? new Date(startDate) : new Date();
  const _expirationDate = new Date(expirationDate);

  if (_expirationDate < _startDate) {
    return res.status(400).json({
      success: false,
      mes: 'Expiration date must be greater than or equal to start date.'
    });
  }

    // Check if the specific product exists
    const existed = await WarrantyCard.findOne({ specificProductId })
    if (existed) {
    return res.status(400).json({
        success: false,
        mes: 'This specific product already has a warranty card.'
    })
    }
  const response = await WarrantyCard.create({
    warrantyCode,
    startDate: _startDate,
    expirationDate: _expirationDate,
    specificProductId
  });

  res.json({
    success: !!response,
    createdWarranty: response || 'Failed to create warranty card.'
  });
});

// Get all warranty cards
const getWarrantyCards = asyncHandler(async (req, res) => {
  const response = await WarrantyCard.find()
    .populate('specificProductId')
    .select('-createdAt -updatedAt -__v');

  res.json({
    success: !!response,
    warranties: response || 'Failed to retrieve warranty cards.'
  });
});

// Get a warranty card by ID
const getWarrantyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await WarrantyCard.findById(id).populate('specificProductId');

  res.json({
    success: !!response,
    warranty: response || 'Warranty card not found.'
  });
});

// Get a warranty card by code
const getWarrantyByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const response = await WarrantyCard.findOne({ warrantyCode: code })
    .populate('specificProductId');

  res.json({
    success: !!response,
    warranty: response || 'Warranty card not found by code.'
  });
});

// Update a warranty card
const updateWarrantyCard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.body.expirationDate) {
    const newStartDate = req.body.startDate ? new Date(req.body.startDate) : undefined;
    const newExpirationDate = new Date(req.body.expirationDate);
    const currentCard = await WarrantyCard.findById(id);

    const effectiveStartDate = newStartDate || currentCard.startDate;

    if (newExpirationDate < effectiveStartDate) {
      return res.status(400).json({
        success: false,
        mes: 'Expiration date must be greater than or equal to start date.'
      });
    }
  }

  const response = await WarrantyCard.findByIdAndUpdate(id, req.body, { new: true });

  res.json({
    success: !!response,
    updatedWarranty: response || 'Failed to update warranty card.'
  });
});

// Delete a warranty card
const deleteWarrantyCard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const response = await WarrantyCard.findByIdAndDelete(id);

  res.json({
    success: !!response,
    deletedWarranty: response || 'Failed to delete warranty card.'
  });
});

module.exports = {
  createWarrantyCard,
  getWarrantyCards,
  getWarrantyById,
  getWarrantyByCode,
  updateWarrantyCard,
  deleteWarrantyCard
};