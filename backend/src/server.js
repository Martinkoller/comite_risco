import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import riskItemRoutes from './routes/riskItemRoutes.js';
import poAnalysisRoutes from './routes/poAnalysisRoutes.js';
import committeeDecisionRoutes from './routes/committeeDecisionRoutes.js';
import actionPlanRoutes from './routes/actionPlanRoutes.js';
import directionReviewRoutes from './routes/directionReviewRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import managementMeetingRoutes from './routes/managementMeetingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import attachmentRoutes from './routes/attachmentRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/risk-items', riskItemRoutes);
app.use('/api/po-analyses', poAnalysisRoutes);
app.use('/api/committee-decisions', committeeDecisionRoutes);
app.use('/api/action-plans', actionPlanRoutes);
app.use('/api/direction-reviews', directionReviewRoutes);
app.use('/api', actionRoutes);
app.use('/api', managementMeetingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api', attachmentRoutes);
app.use('/api/checklists', checklistRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Comitê de Risco API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      riskItems: '/api/risk-items',
      poAnalyses: '/api/po-analyses',
      committeeDecisions: '/api/committee-decisions',
      actionPlans: '/api/action-plans',
      directionReviews: '/api/direction-reviews',
      actions: '/api/actions',
      managementMeetings: '/api/management-meetings',
      dashboard: '/api/dashboard',
      lookups: '/api/lookups',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log('=================================');
  console.log('Available endpoints:');
  console.log(`  - GET  /api/risk-items`);
  console.log(`  - GET  /api/po-analyses`);
  console.log(`  - GET  /api/committee-decisions`);
  console.log(`  - GET  /api/action-plans`);
  console.log(`  - GET  /api/direction-reviews`);
  console.log(`  - GET  /api/actions`);
  console.log(`  - GET  /api/management-meetings`);
  console.log(`  - GET  /api/dashboard/summary`);
  console.log(`  - GET  /api/lookups/all`);
  console.log('=================================');
});

export default app;
