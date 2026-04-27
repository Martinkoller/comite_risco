import express from 'express'
import {
  getAllManagementMeetings,
  getManagementMeetingsByRiskItem,
  getManagementMeetingById,
  getRiskItemsForManagementMeeting,
  createManagementMeeting,
  updateManagementMeeting,
  deleteManagementMeeting,
} from '../controllers/managementMeetingController.js'

const router = express.Router()

// Get risk items available for management meetings (must be before /management-meetings/:id)
router.get('/management-meetings/available-risk-items', getRiskItemsForManagementMeeting)

// Get all management meetings
router.get('/management-meetings', getAllManagementMeetings)

// Get all management meetings for a risk item
router.get('/risk-items/:riskItemId/management-meetings', getManagementMeetingsByRiskItem)

// Get single management meeting
router.get('/management-meetings/:id', getManagementMeetingById)

// Create new management meeting
router.post('/management-meetings', createManagementMeeting)

// Update management meeting
router.put('/management-meetings/:id', updateManagementMeeting)

// Delete management meeting
router.delete('/management-meetings/:id', deleteManagementMeeting)

export default router
