import express from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary with all metrics
 * @access  Public
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @route   GET /api/dashboard/critical-items
 * @desc    Get critical items (P1) for dashboard
 * @access  Public
 */
router.get('/critical-items', dashboardController.getCriticalItems);

/**
 * @route   GET /api/dashboard/upcoming-deadlines
 * @desc    Get items with upcoming deadlines
 * @access  Public
 */
router.get('/upcoming-deadlines', dashboardController.getUpcomingDeadlines);

/**
 * @route   GET /api/dashboard/recent-decisions
 * @desc    Get recent committee decisions
 * @access  Public
 */
router.get('/recent-decisions', dashboardController.getRecentDecisions);

/**
 * @route   GET /api/dashboard/pending-direction
 * @desc    Get items pending direction review
 * @access  Public
 */
router.get('/pending-direction', dashboardController.getPendingDirectionItems);

router.get('/delayed-actions', dashboardController.getDelayedActions);

router.get('/management-summary', dashboardController.getManagementSummary);

export default router;
