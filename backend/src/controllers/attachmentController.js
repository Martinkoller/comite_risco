import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class AttachmentController {
  /**
   * GET /api/attachments/risk-item/:riskItemId
   * Get all attachments for a risk item
   */
  async getByRiskItem(req, res) {
    try {
      const { riskItemId } = req.params
      const attachments = await prisma.attachment.findMany({
        where: { riskItemId: parseInt(riskItemId) },
        orderBy: { uploadedAt: 'desc' },
      })

      res.json({ success: true, data: attachments })
    } catch (error) {
      console.error('Error fetching attachments:', error)
      res.status(500).json({ success: false, error: 'Failed to fetch attachments' })
    }
  }

  /**
   * POST /api/attachments
   * Create a new attachment
   */
  async create(req, res) {
    try {
      const { riskItemId, fileName, fileType, fileData, fileSize } = req.body

      const attachment = await prisma.attachment.create({
        data: {
          riskItemId: parseInt(riskItemId),
          fileName,
          fileType,
          fileData,
          fileSize,
        },
      })

      res.status(201).json({ success: true, data: attachment })
    } catch (error) {
      console.error('Error creating attachment:', error)
      res.status(500).json({ success: false, error: 'Failed to create attachment' })
    }
  }

  /**
   * DELETE /api/attachments/:id
   * Delete an attachment
   */
  async delete(req, res) {
    try {
      const { id } = req.params

      await prisma.attachment.delete({
        where: { id: parseInt(id) },
      })

      res.json({ success: true, data: { message: 'Attachment deleted successfully' } })
    } catch (error) {
      console.error('Error deleting attachment:', error)
      res.status(500).json({ success: false, error: 'Failed to delete attachment' })
    }
  }
}

export default new AttachmentController()
