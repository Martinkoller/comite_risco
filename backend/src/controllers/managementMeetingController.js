import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all management meetings
export const getAllManagementMeetings = async (req, res) => {
  try {
    const meetings = await prisma.managementMeeting.findMany({
      include: {
        riskItems: {
          include: {
            riskItem: true,
          },
        },
      },
      orderBy: { meetingDate: 'desc' },
    })

    res.json({ success: true, data: meetings })
  } catch (error) {
    console.error('Error fetching management meetings:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch management meetings' })
  }
}

// Get all management meetings for a risk item
export const getManagementMeetingsByRiskItem = async (req, res) => {
  try {
    const { riskItemId } = req.params

    const meetingRiskItems = await prisma.managementMeetingRiskItem.findMany({
      where: { riskItemId: parseInt(riskItemId) },
      include: {
        managementMeeting: true,
      },
      orderBy: {
        managementMeeting: {
          meetingDate: 'desc',
        },
      },
    })

    const meetings = meetingRiskItems.map(mr => mr.managementMeeting)

    res.json({ success: true, data: meetings })
  } catch (error) {
    console.error('Error fetching management meetings:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch management meetings' })
  }
}

// Get single management meeting
export const getManagementMeetingById = async (req, res) => {
  try {
    const { id } = req.params

    const meeting = await prisma.managementMeeting.findUnique({
      where: { id: parseInt(id) },
      include: {
        riskItems: {
          include: {
            riskItem: true,
          },
        },
      },
    })

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Management meeting not found' })
    }

    res.json({ success: true, data: meeting })
  } catch (error) {
    console.error('Error fetching management meeting:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch management meeting' })
  }
}

// Get risk items available for management meetings (Aguardando Direção)
export const getRiskItemsForManagementMeeting = async (req, res) => {
  try {
    const riskItems = await prisma.riskItem.findMany({
      where: {
        monitoringStatus: 'Aguardando Direção',
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { dateIdentified: 'desc' },
    })

    res.json({ success: true, data: riskItems })
  } catch (error) {
    console.error('Error fetching risk items:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch risk items' })
  }
}

// Create new management meeting
export const createManagementMeeting = async (req, res) => {
  try {
    const {
      meetingDate,
      agenda,
      managementFeedback,
      actionRequired,
      actionDescription,
      nextFollowUp,
      status,
      notes,
      riskItemIds,
    } = req.body

    const presentedBy = 'Mártin'

    const meeting = await prisma.managementMeeting.create({
      data: {
        meetingDate: new Date(meetingDate),
        agenda,
        managementFeedback,
        actionRequired: actionRequired || false,
        actionDescription,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        status: status || 'Pendente',
        notes,
        riskItems: {
          create: riskItemIds.map((riskItemId) => ({
            riskItemId: parseInt(riskItemId),
          })),
        },
      },
      include: {
        riskItems: {
          include: {
            riskItem: true,
          },
        },
      },
    })

    // Create timeline events for each risk item
    for (const riskItemId of riskItemIds) {
      await prisma.timelineEvent.create({
        data: {
          riskItemId: parseInt(riskItemId),
          eventType: 'Reunião de Gestão',
          description: `Apresentado por ${presentedBy} - Status: ${status}`,
        },
      })
    }

    res.status(201).json({ success: true, data: meeting })
  } catch (error) {
    console.error('Error creating management meeting:', error)
    res.status(500).json({ success: false, error: 'Failed to create management meeting' })
  }
}

// Update management meeting
export const updateManagementMeeting = async (req, res) => {
  try {
    const { id } = req.params
    const {
      meetingDate,
      agenda,
      managementFeedback,
      actionRequired,
      actionDescription,
      nextFollowUp,
      status,
      notes,
      riskItemIds,
    } = req.body

    const presentedBy = 'Mártin'

    // Get existing meeting to check for status change
    const existingMeeting = await prisma.managementMeeting.findUnique({
      where: { id: parseInt(id) },
      include: {
        riskItems: true,
      },
    })

    if (!existingMeeting) {
      return res.status(404).json({ success: false, error: 'Management meeting not found' })
    }

    // Update meeting
    const meeting = await prisma.managementMeeting.update({
      where: { id: parseInt(id) },
      data: {
        ...(meetingDate !== undefined && { meetingDate: new Date(meetingDate) }),
        ...(agenda !== undefined && { agenda }),
        ...(managementFeedback !== undefined && { managementFeedback }),
        ...(actionRequired !== undefined && { actionRequired }),
        ...(actionDescription !== undefined && { actionDescription }),
        ...(nextFollowUp !== undefined && { nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    })

    // Update risk items if provided
    if (riskItemIds) {
      // Delete existing relations
      await prisma.managementMeetingRiskItem.deleteMany({
        where: { managementMeetingId: parseInt(id) },
      })

      // Create new relations
      await prisma.managementMeetingRiskItem.createMany({
        data: riskItemIds.map((riskItemId) => ({
          managementMeetingId: parseInt(id),
          riskItemId: parseInt(riskItemId),
        })),
      })
    }

    // Create timeline event if status changed to Realizada
    if (status === 'Realizada' && existingMeeting.status !== 'Realizada') {
      const currentRiskItems = await prisma.managementMeetingRiskItem.findMany({
        where: { managementMeetingId: parseInt(id) },
      })

      for (const relation of currentRiskItems) {
        await prisma.timelineEvent.create({
          data: {
            riskItemId: relation.riskItemId,
            eventType: 'Reunião de Gestão Realizada',
            description: `Reunião realizada com feedback da gestão`,
          },
        })
      }
    }

    res.json({ success: true, data: meeting })
  } catch (error) {
    console.error('Error updating management meeting:', error)
    res.status(500).json({ success: false, error: 'Failed to update management meeting' })
  }
}

// Delete management meeting
export const deleteManagementMeeting = async (req, res) => {
  try {
    const { id } = req.params

    const meeting = await prisma.managementMeeting.findUnique({
      where: { id: parseInt(id) },
      include: {
        riskItems: true,
      },
    })

    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Management meeting not found' })
    }

    await prisma.managementMeeting.delete({
      where: { id: parseInt(id) },
    })

    // Create timeline events for each risk item
    for (const relation of meeting.riskItems) {
      await prisma.timelineEvent.create({
        data: {
          riskItemId: relation.riskItemId,
          eventType: 'Reunião de Gestão Removida',
          description: `Reunião de gestão foi removida`,
        },
      })
    }

    res.json({ success: true, message: 'Management meeting deleted successfully' })
  } catch (error) {
    console.error('Error deleting management meeting:', error)
    res.status(500).json({ success: false, error: 'Failed to delete management meeting' })
  }
}
