import express from 'express';
import riskItemController from '../controllers/riskItemController.js';
import { validate, riskItemSchema, riskItemUpdateSchema } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/risk-items
 * @desc    Get all risk items with optional filters
 * @access  Public
 */
router.get('/', riskItemController.getAll);

/**
 * @route   GET /api/risk-items/fast-track
 * @desc    Get fast track items
 * @access  Public
 */
router.get('/fast-track', riskItemController.getFastTrackItems);


/**
 * @route   GET /api/risk-items/:id
 * @desc    Get a single risk item by ID
 * @access  Public
 */
router.get('/:id', riskItemController.getById);

/**
 * @route   POST /api/risk-items
 * @desc    Create a new risk item
 * @access  Public
 */
router.post('/', validate(riskItemSchema), riskItemController.create);

/**
 * @route   PUT /api/risk-items/:id
 * @desc    Update a risk item
 * @access  Public
 */
router.put('/:id', validate(riskItemUpdateSchema), riskItemController.update);

/**
 * @route   DELETE /api/risk-items/:id
 * @desc    Delete a risk item (soft delete)
 * @access  Public
 */
router.delete('/:id', riskItemController.delete);

export default router;
