import express from 'express';
import committeeDecisionController from '../controllers/committeeDecisionController.js';
import { validate, committeeDecisionSchema, committeeDecisionUpdateSchema } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/committee-decisions
 * @desc    Get all committee decisions with optional filters
 * @access  Public
 */
router.get('/', committeeDecisionController.getAll);

/**
 * @route   GET /api/committee-decisions/pending-direction
 * @desc    Get decisions pending direction review
 * @access  Public
 */
router.get('/pending-direction', committeeDecisionController.getPendingDirectionReview);

/**
 * @route   GET /api/committee-decisions/severity/:severityCode
 * @desc    Get decisions by severity
 * @access  Public
 */
router.get('/severity/:severityCode', committeeDecisionController.getBySeverity);

/**
 * @route   GET /api/committee-decisions/risk-item/:riskItemId
 * @desc    Get committee decision by risk item ID
 * @access  Public
 */
router.get('/risk-item/:riskItemId', committeeDecisionController.getByRiskItem);

/**
 * @route   GET /api/committee-decisions/:id
 * @desc    Get a single committee decision by ID
 * @access  Public
 */
router.get('/:id', committeeDecisionController.getById);

/**
 * @route   POST /api/committee-decisions
 * @desc    Create a new committee decision
 * @access  Public
 */
router.post('/', validate(committeeDecisionSchema), committeeDecisionController.create);

/**
 * @route   PUT /api/committee-decisions/:id
 * @desc    Update a committee decision
 * @access  Public
 */
router.put('/:id', validate(committeeDecisionUpdateSchema), committeeDecisionController.update);

export default router;
