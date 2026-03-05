import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { requireTenant } from '../middleware/tenant';
import { listReports, uploadReport } from '../controllers/reportController';

const upload = multer({
  dest: '../uploads',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.json', '.xml', '.docx', '.csv', '.html'];
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();
router.get('/', authMiddleware, requireTenant, listReports);
router.post('/upload', authMiddleware, requireTenant, upload.single('report'), uploadReport);

export default router;
