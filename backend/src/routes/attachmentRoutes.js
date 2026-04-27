import express from 'express'
import attachmentController from '../controllers/attachmentController.js'

const router = express.Router()

// Get all attachments for a risk item
router.get('/attachments/risk-item/:riskItemId', attachmentController.getByRiskItem)

// Create a new attachment
router.post('/attachments', attachmentController.create)

// Delete an attachment
router.delete('/attachments/:id', attachmentController.delete)

export default router
