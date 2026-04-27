import express from 'express';
import directionReviewController from '../controllers/directionReviewController.js';
import { validate, directionReviewSchema, directionReviewUpdateSchema } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/direction-reviews
 * @desc    Get all direction reviews with optional filters
 * @access  Public
 */
router.get('/', directionReviewController.getAll);

/**
 * @route   GET /api/direction-reviews/pending
 * @desc    Get pending direction reviews
 * @access  Public
 */
router.get('/pending', directionReviewController.getPending);

/**
 * @route   GET /api/direction-reviews/requiring-adjustment
 * @desc    Get reviews requiring adjustment
 * @access  Public
 */
router.get('/requiring-adjustment', directionReviewController.getRequiringAdjustment);

/**
 * @route   GET /api/direction-reviews/risk-item/:riskItemId
 * @desc    Get direction reviews by risk item
 * @access  Public
 */
router.get('/risk-item/:riskItemId', directionReviewController.getByRiskItem);

/**
 * @route   GET /api/direction-reviews/:id
 * @desc    Get a single direction review by ID
 * @access  Public
 */
router.get('/:id', directionReviewController.getById);

/**
 * @route   POST /api/direction-reviews
 * @desc    Create a new direction review
 * @access  Public
 */
router.post('/', validate(directionReviewSchema), directionReviewController.create);

/**
 * @route   PUT /api/direction-reviews/:id
 * @desc    Update a direction review
 * @access  Public
 */
router.put('/:id', validate(directionReviewUpdateSchema), directionReviewController.update);

export default router;
