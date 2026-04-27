import express from 'express';
import lookupController from '../controllers/lookupController.js';

const router = express.Router();

/**
 * @route   GET /api/lookups/all
 * @desc    Get all lookups at once
 * @access  Public
 */
router.get('/all', lookupController.getAllLookups);

/**
 * @route   GET /api/lookups/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/products', lookupController.getProducts);

/**
 * @route   GET /api/lookups/severities
 * @desc    Get all severities
 * @access  Public
 */
router.get('/severities', lookupController.getSeverities);

/**
 * @route   GET /api/lookups/event-sources
 * @desc    Get all event sources
 * @access  Public
 */
router.get('/event-sources', lookupController.getEventSources);

/**
 * @route   GET /api/lookups/event-types
 * @desc    Get all event types
 * @access  Public
 */
router.get('/event-types', lookupController.getEventTypes);

/**
 * @route   GET /api/lookups/committee-statuses
 * @desc    Get all committee statuses
 * @access  Public
 */
router.get('/committee-statuses', lookupController.getCommitteeStatuses);

/**
 * @route   GET /api/lookups/action-statuses
 * @desc    Get all action statuses
 * @access  Public
 */
router.get('/action-statuses', lookupController.getActionStatuses);

/**
 * @route   GET /api/lookups/participants
 * @desc    Get all participants
 * @access  Public
 */
router.get('/participants', lookupController.getParticipants);

/**
 * @route   GET /api/lookups/product-owners
 * @desc    Get all product owners
 * @access  Public
 */
router.get('/product-owners', lookupController.getProductOwners);

/**
 * @route   GET /api/lookups/roles
 * @desc    Get all roles
 * @access  Public
 */
router.get('/roles', lookupController.getRoles);

// CRUD for Participants
router.post('/participants', lookupController.createParticipant)
router.put('/participants/:id', lookupController.updateParticipant)
router.delete('/participants/:id', lookupController.deleteParticipant)

// CRUD for Event Sources
router.post('/event-sources', lookupController.createEventSource)
router.put('/event-sources/:id', lookupController.updateEventSource)
router.delete('/event-sources/:id', lookupController.deleteEventSource)

// CRUD for Event Types
router.post('/event-types', lookupController.createEventType)
router.put('/event-types/:id', lookupController.updateEventType)
router.delete('/event-types/:id', lookupController.deleteEventType)

// CRUD for Committee Statuses
router.post('/committee-statuses', lookupController.createCommitteeStatus)
router.put('/committee-statuses/:id', lookupController.updateCommitteeStatus)
router.delete('/committee-statuses/:id', lookupController.deleteCommitteeStatus)

// CRUD for Action Statuses
router.post('/action-statuses', lookupController.createActionStatus)
router.put('/action-statuses/:id', lookupController.updateActionStatus)
router.delete('/action-statuses/:id', lookupController.deleteActionStatus)

// CRUD for Roles
router.post('/roles', lookupController.createRole)
router.put('/roles/:id', lookupController.updateRole)
router.delete('/roles/:id', lookupController.deleteRole)

// Areas
router.get('/areas', lookupController.getAreas)
router.post('/areas', lookupController.createArea)
router.put('/areas/:id', lookupController.updateArea)
router.delete('/areas/:id', lookupController.deleteArea)

// Settings
router.get('/settings', lookupController.getSettings)
router.put('/settings/:key', lookupController.updateSetting)

export default router;
