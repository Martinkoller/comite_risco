import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get all actions for a risk item
export const getActionsByRiskItem = async (req, res) => {
  try {
    const { riskItemId } = req.params

    const actions = await prisma.action.findMany({
      where: { riskItemId: parseInt(riskItemId) },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: actions })
  } catch (error) {
    console.error('Error fetching actions:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch actions' })
  }
}

// Get single action
export const getActionById = async (req, res) => {
  try {
    const { id } = req.params

    const action = await prisma.action.findUnique({
      where: { id: parseInt(id) },
    })

    if (!action) {
      return res.status(404).json({ success: false, error: 'Action not found' })
    }

    res.json({ success: true, data: action })
  } catch (error) {
    console.error('Error fetching action:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch action' })
  }
}

// Create new action
export const createAction = async (req, res) => {
  try {
    const { riskItemId, actionType, title, description, responsible, status, priority, dueDate } = req.body

    const action = await prisma.action.create({
      data: {
        riskItemId: parseInt(riskItemId),
        actionType,
        title,
        description,
        responsible,
        status: status || 'Pendente',
        priority: priority || 'Média',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        riskItemId: parseInt(riskItemId),
        eventType: `Ação Criada: ${actionType}`,
        description: `Nova ação "${title}" criada por ${responsible}`,
      },
    })

    res.status(201).json({ success: true, data: action })
  } catch (error) {
    console.error('Error creating action:', error)
    res.status(500).json({ success: false, error: 'Failed to create action' })
  }
}

// Update action
export const updateAction = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, responsible, status, priority, dueDate, completedAt } = req.body

    const action = await prisma.action.update({
      where: { id: parseInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(responsible !== undefined && { responsible }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      },
    })

    // Create timeline event if status changed to completed
    if (status === 'Concluído' && !completedAt) {
      await prisma.action.update({
        where: { id: parseInt(id) },
        data: { completedAt: new Date() },
      })

      await prisma.timelineEvent.create({
        data: {
          riskItemId: action.riskItemId,
          eventType: 'Ação Concluída',
          description: `Ação "${action.title}" foi concluída`,
        },
      })
    }

    res.json({ success: true, data: action })
  } catch (error) {
    console.error('Error updating action:', error)
    res.status(500).json({ success: false, error: 'Failed to update action' })
  }
}

// Delete action
export const deleteAction = async (req, res) => {
  try {
    const { id } = req.params

    const action = await prisma.action.findUnique({
      where: { id: parseInt(id) },
    })

    if (!action) {
      return res.status(404).json({ success: false, error: 'Action not found' })
    }

    await prisma.action.delete({
      where: { id: parseInt(id) },
    })

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        riskItemId: action.riskItemId,
        eventType: 'Ação Removida',
        description: `Ação "${action.title}" foi removida`,
      },
    })

    res.json({ success: true, message: 'Action deleted successfully' })
  } catch (error) {
    console.error('Error deleting action:', error)
    res.status(500).json({ success: false, error: 'Failed to delete action' })
  }
}
