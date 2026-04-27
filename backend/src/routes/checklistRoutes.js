import express from 'express';
import checklistController from '../controllers/checklistController.js';

const router = express.Router();

// ── Portais cadastro ──────────────────────────────────────
router.get('/portals',            checklistController.getPortals);
router.post('/portals',           checklistController.createPortal);
router.put('/portals/:id',        checklistController.updatePortal);
router.delete('/portals/:id',     checklistController.deletePortal);

// ── Checklists ────────────────────────────────────────────
router.get('/',                   checklistController.getAll);
router.post('/',                  checklistController.create);
router.get('/week/:week',         checklistController.getByWeek);
router.get('/:id',                checklistController.getById);
router.put('/:id',                checklistController.update);

// ── Entrada de portal (check individual) ─────────────────
router.patch('/entries/:entryId/check', checklistController.checkPortalEntry);

// ── Achados ───────────────────────────────────────────────
router.post('/findings',                      checklistController.createFinding);
router.put('/findings/:findingId',            checklistController.updateFinding);
router.delete('/findings/:findingId',         checklistController.deleteFinding);
router.patch('/findings/:findingId/link-cr',  checklistController.linkRiskItem);

export default router;
