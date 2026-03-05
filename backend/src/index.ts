import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import reportRoutes from './routes/reportRoutes';
import vulnerabilityRoutes from './routes/vulnerabilityRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redisClient.connect().catch(() => console.log('Redis unavailable; queue features disabled for MVP.'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'PentestAI API' }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);
app.use('/api/marketplace', marketplaceRoutes);

app.listen(port, () => {
  console.log(`PentestAI backend running on port ${port}`);
});
