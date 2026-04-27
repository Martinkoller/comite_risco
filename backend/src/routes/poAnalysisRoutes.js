import express from 'express';
import poAnalysisController from '../controllers/poAnalysisController.js';
import { validate, poAnalysisSchema, poAnalysisUpdateSchema } from '../middleware/validator.js';

const router = express.Router();

/**
 * @route   GET /api/po-analyses
 * @desc    Get all PO analyses with optional filters
 * @access  Public
 */
router.get('/', poAnalysisController.getAll);

/**
 * @route   GET /api/po-analyses/risk-item/:riskItemId
 * @desc    Get PO analyses by risk item
 * @access  Public
 */
router.get('/risk-item/:riskItemId', poAnalysisController.getByRiskItem);

/**
 * @route   GET /api/po-analyses/product/:productId
 * @desc    Get PO analyses by product
 * @access  Public
 */
router.get('/product/:productId', poAnalysisController.getByProduct);

/**
 * @route   GET /api/po-analyses/:id
 * @desc    Get a single PO analysis by ID
 * @access  Public
 */
router.get('/:id', poAnalysisController.getById);

/**
 * @route   POST /api/po-analyses
 * @desc    Create a new PO analysis
 * @access  Public
 */
router.post('/', validate(poAnalysisSchema), poAnalysisController.create);

/**
 * @route   PUT /api/po-analyses/:id
 * @desc    Update a PO analysis
 * @access  Public
 */
router.put('/:id', validate(poAnalysisUpdateSchema), poAnalysisController.update);

/**
 * @route   DELETE /api/po-analyses/:id
 * @desc    Delete a PO analysis
 * @access  Public
 */
router.delete('/:id', poAnalysisController.delete);

export default router;
