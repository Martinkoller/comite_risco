import express from 'express'
import {
  getActionsByRiskItem,
  getActionById,
  createAction,
  updateAction,
  deleteAction,
} from '../controllers/actionController.js'

const router = express.Router()

// Get all actions for a risk item
router.get('/risk-items/:riskItemId/actions', getActionsByRiskItem)

// Get single action
router.get('/actions/:id', getActionById)

// Create new action
router.post('/actions', createAction)

// Update action
router.put('/actions/:id', updateAction)

// Delete action
router.delete('/actions/:id', deleteAction)

export default router
