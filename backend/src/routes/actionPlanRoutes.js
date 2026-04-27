import express from 'express';
import actionPlanController from '../controllers/actionPlanController.js';
import { validate, actionPlanSchema, actionPlanUpdateSchema } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/action-plans
 * @desc    Get all action plans with optional filters
 * @access  Public
 */
router.get('/', actionPlanController.getAll);

/**
 * @route   GET /api/action-plans/overdue
 * @desc    Get overdue action plans
 * @access  Public
 */
router.get('/overdue', actionPlanController.getOverdue);

/**
 * @route   GET /api/action-plans/status/:statusName
 * @desc    Get action plans by status
 * @access  Public
 */
router.get('/status/:statusName', actionPlanController.getByStatus);

/**
 * @route   GET /api/action-plans/risk-item/:riskItemId
 * @desc    Get action plans by risk item
 * @access  Public
 */
router.get('/risk-item/:riskItemId', actionPlanController.getByRiskItem);

/**
 * @route   GET /api/action-plans/:id
 * @desc    Get a single action plan by ID
 * @access  Public
 */
router.get('/:id', actionPlanController.getById);

/**
 * @route   POST /api/action-plans
 * @desc    Create a new action plan
 * @access  Public
 */
router.post('/', validate(actionPlanSchema), actionPlanController.create);

/**
 * @route   PUT /api/action-plans/:id
 * @desc    Update an action plan
 * @access  Public
 */
router.put('/:id', validate(actionPlanUpdateSchema), actionPlanController.update);

/**
 * @route   PUT /api/action-plans/:id/direction-approved
 * @desc    Mark action plan as approved by direction
 * @access  Public
 */
router.put('/:id/direction-approved', actionPlanController.markDirectionApproved);

/**
 * @route   DELETE /api/action-plans/:id
 * @desc    Delete an action plan
 * @access  Public
 */
router.delete('/:id', actionPlanController.delete);

export default router;
