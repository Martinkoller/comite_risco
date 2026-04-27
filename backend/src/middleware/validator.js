import Joi from 'joi';

/**
 * Validation middleware using Joi
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({
        success: false,
        errors,
      });
    }
    
    next();
  };
};

/**
 * Validation schemas for each entity
 */

// Risk Item validation schema
export const riskItemSchema = Joi.object({
  dateIdentified: Joi.date().required(),
  monitoringResponsible: Joi.string().required(),
  eventSourceId: Joi.number().integer().required(),
  eventTypeId: Joi.number().integer().required(),
  title: Joi.string().required().min(3).max(500),
  summary: Joi.string().required().min(10),
  publishedAt: Joi.date().allow(null),
  officialDeadline: Joi.date().allow(null),
  preliminarySeverityId: Joi.number().integer().allow(null),
  requiresPoAnalysis: Joi.boolean().default(true),
  monitoringStatus: Joi.string().default('Identificado'),
  initialNotes: Joi.string().allow(null, ''),
  isFastTrack: Joi.boolean().default(false),
  fastTrackReason: Joi.string().allow(null, ''),
  productIds: Joi.array().items(Joi.number().integer()).min(1).required(),
});

// PO Analysis validation schema
export const poAnalysisSchema = Joi.object({
  riskItemId: Joi.number().integer().required(),
  analysisDate: Joi.date().required(),
  poResponsible: Joi.string().required(),
  productId: Joi.number().integer().required(),
  impactsProduct: Joi.string().valid('Sim', 'Não', 'Em avaliação').required(),
  impactType: Joi.string().valid('Funcional', 'Técnico', 'Operacional', 'Comunicação', 'Misto').required(),
  impactLevel: Joi.string().valid('Real', 'Provável', 'Possível').required(),
  needsImplementation: Joi.string().valid('Sim', 'Não', 'Talvez').required(),
  nonComplianceRisk: Joi.boolean().default(false),
  operationalRisk: Joi.boolean().default(false),
  customerImpact: Joi.boolean().default(false),
  dependencies: Joi.string().allow(null, ''),
  doubtsAmbiguities: Joi.string().allow(null, ''),
  needsLegalReview: Joi.string().valid('Sim', 'Não', 'Talvez').required(),
  suggestedSeverityId: Joi.number().integer().allow(null),
  recommendation: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
});

// Committee Decision validation schema
export const committeeDecisionSchema = Joi.object({
  riskItemId: Joi.number().integer().required(),
  meetingDate: Joi.date().required(),
  finalSeverityId: Joi.number().integer().required(),
  impactedProducts: Joi.string().required(),
  involvedPos: Joi.string().required(),
  supportImpact: Joi.string().valid('Não', 'Baixo', 'Médio', 'Alto').required(),
  csImpact: Joi.string().valid('Não', 'Baixo', 'Médio', 'Alto').required(),
  marketingImpact: Joi.string().valid('Não', 'Baixo', 'Médio', 'Alto').required(),
  legalTriggered: Joi.boolean().default(false),
  decisionText: Joi.string().required().min(10),
  hasAction: Joi.boolean().default(false),
  hasActionPlan: Joi.boolean().default(false),
  goesToDirection: Joi.boolean().default(false),
  mainResponsible: Joi.string().required(),
  initialDeadline: Joi.date().allow(null),
  committeeStatusId: Joi.number().integer().required(),
  submittedToDirectionAt: Joi.date().allow(null),
  directionApproved: Joi.string().valid('Sim', 'Não', 'Pendente').default('Pendente'),
  notes: Joi.string().allow(null, ''),
});

// Action Plan validation schema
export const actionPlanSchema = Joi.object({
  riskItemId: Joi.number().integer().required(),
  theme: Joi.string().required().min(3).max(200),
  areaId: Joi.number().integer().required(),
  responsibleName: Joi.string().required(),
  actionDescription: Joi.string().required().min(10),
  dependencies: Joi.string().allow(null, ''),
  openedAt: Joi.date().required(),
  deadline: Joi.date().required().greater(Joi.ref('openedAt')),
  actionStatusId: Joi.number().integer().required(),
  directionApprovedAt: Joi.date().allow(null),
  notes: Joi.string().allow(null, ''),
});

// Direction Review validation schema
export const directionReviewSchema = Joi.object({
  riskItemId: Joi.number().integer().required(),
  submittedAt: Joi.date().required(),
  reviewedAt: Joi.date().allow(null),
  approvalStatus: Joi.string().valid('Aprovado', 'Pendente', 'Ajustar e retornar').required(),
  requiresAdjustment: Joi.boolean().default(false),
  directionNotes: Joi.string().allow(null, ''),
  directorName: Joi.string().default('Marcelo Stivanello'),
});

// Update schemas (partial updates allowed)
export const riskItemUpdateSchema = Joi.object({
  dateIdentified: Joi.date(),
  monitoringResponsible: Joi.string(),
  eventSourceId: Joi.number().integer(),
  eventTypeId: Joi.number().integer(),
  title: Joi.string().min(3).max(500),
  summary: Joi.string().min(10),
  publishedAt: Joi.date().allow(null),
  officialDeadline: Joi.date().allow(null),
  preliminarySeverityId: Joi.number().integer().allow(null),
  requiresPoAnalysis: Joi.boolean(),
  monitoringStatus: Joi.string(),
  initialNotes: Joi.string().allow(null, ''),
  isFastTrack: Joi.boolean(),
  fastTrackReason: Joi.string().allow(null, ''),
  productIds: Joi.array().items(Joi.number().integer()),
}).min(1);

export const poAnalysisUpdateSchema = Joi.object({
  analysisDate: Joi.date(),
  poResponsible: Joi.string(),
  productId: Joi.number().integer(),
  impactsProduct: Joi.string().valid('Sim', 'Não', 'Em avaliação'),
  impactType: Joi.string().valid('Funcional', 'Técnico', 'Operacional', 'Comunicação', 'Misto'),
  impactLevel: Joi.string().valid('Real', 'Provável', 'Possível'),
  needsImplementation: Joi.string().valid('Sim', 'Não', 'Talvez'),
  nonComplianceRisk: Joi.boolean(),
  operationalRisk: Joi.boolean(),
  customerImpact: Joi.boolean(),
  dependencies: Joi.string().allow(null, ''),
  doubtsAmbiguities: Joi.string().allow(null, ''),
  needsLegalReview: Joi.string().valid('Sim', 'Não', 'Talvez'),
  suggestedSeverityId: Joi.number().integer().allow(null),
  recommendation: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
}).min(1);

export const committeeDecisionUpdateSchema = Joi.object({
  meetingDate: Joi.date(),
  finalSeverityId: Joi.number().integer(),
  impactedProducts: Joi.string(),
  involvedPos: Joi.string(),
  supportImpact: Joi.string().valid('Não', 'Baixo', 'Médio', 'Alto'),
  csImpact: Joi.string().valid('Não', 'Baixo', 'Médio', 'Alto'),
  marketingImpact: Joi.string().valid('Não', 'Baixo', 'Médio', 'Alto'),
  legalTriggered: Joi.boolean(),
  decisionText: Joi.string().min(10),
  hasAction: Joi.boolean(),
  hasActionPlan: Joi.boolean(),
  goesToDirection: Joi.boolean(),
  mainResponsible: Joi.string(),
  initialDeadline: Joi.date().allow(null),
  committeeStatusId: Joi.number().integer(),
  submittedToDirectionAt: Joi.date().allow(null),
  directionApproved: Joi.string().valid('Sim', 'Não', 'Pendente'),
  notes: Joi.string().allow(null, ''),
}).min(1);

export const actionPlanUpdateSchema = Joi.object({
  theme: Joi.string().min(3).max(200),
  areaId: Joi.number().integer(),
  responsibleName: Joi.string(),
  actionDescription: Joi.string().min(10),
  dependencies: Joi.string().allow(null, ''),
  openedAt: Joi.date(),
  deadline: Joi.date(),
  actionStatusId: Joi.number().integer(),
  directionApprovedAt: Joi.date().allow(null),
  notes: Joi.string().allow(null, ''),
}).min(1);

export const directionReviewUpdateSchema = Joi.object({
  reviewedAt: Joi.date().allow(null),
  approvalStatus: Joi.string().valid('Aprovado', 'Pendente', 'Ajustar e retornar'),
  requiresAdjustment: Joi.boolean(),
  directionNotes: Joi.string().allow(null, ''),
  directorName: Joi.string(),
}).min(1);
