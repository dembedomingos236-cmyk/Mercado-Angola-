import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // === BACKEND FINANCIAL ENGINE FOR ACADEMIA DE VENDAS ===

  /**
   * Authoritative backend financial calculation for academy courses.
   * Ensures that gross revenue, platform fee (5%), instructor distribution,
   * average ticket and enrollment splits are calculated securely on the server.
   */
  app.post('/api/academy/calculate-financials', (req: Request, res: Response) => {
    try {
      const { enrollments } = req.body;
      const enrollmentList = Array.isArray(enrollments) ? enrollments : [];

      let totalRevenueAoa = 0;
      let paidEnrollmentsCount = 0;
      let meritAwardsCount = 0;
      let adminGrantsCount = 0;

      for (const enr of enrollmentList) {
        if (enr.accessType === 'paid') {
          const amount = typeof enr.amountPaid === 'number' ? enr.amountPaid : 0;
          totalRevenueAoa += amount;
          paidEnrollmentsCount++;
        } else if (enr.accessType === 'merit_award') {
          meritAwardsCount++;
        } else if (enr.accessType === 'admin_grant') {
          adminGrantsCount++;
        }
      }

      const platformCommissionRate = 0.05; // 5% marketplace & platform rule
      const platformCommissionAmountAoa = Math.round(totalRevenueAoa * platformCommissionRate);
      const instructorShareAmountAoa = totalRevenueAoa - platformCommissionAmountAoa;
      const totalEnrollments = enrollmentList.length;
      const averageCourseTicketAoa =
        paidEnrollmentsCount > 0 ? Math.round(totalRevenueAoa / paidEnrollmentsCount) : 0;

      const financialSummary = {
        totalRevenueAoa,
        platformCommissionRate,
        platformCommissionAmountAoa,
        instructorShareAmountAoa,
        paidEnrollmentsCount,
        meritAwardsCount,
        adminGrantsCount,
        totalEnrollments,
        averageCourseTicketAoa,
        calculatedAt: new Date().toISOString(),
        calculationEngine: 'backend_authoritative' as const,
      };

      res.json({
        success: true,
        financials: financialSummary,
      });
    } catch (err: any) {
      console.error('Backend financial calculation error:', err);
      res.status(500).json({
        success: false,
        error: 'Erro ao calcular métricas financeiras da academia no servidor.',
      });
    }
  });

  /**
   * Backend calculation for a single course purchase transaction.
   * Calculates the exact platform 5% fee and instructor 95% share server-side.
   */
  app.post('/api/academy/calculate-course-transaction', (req: Request, res: Response) => {
    try {
      const { coursePrice, discountAmount } = req.body;
      const basePrice = Math.max(0, typeof coursePrice === 'number' ? coursePrice : 0);
      const discount = Math.max(0, typeof discountAmount === 'number' ? discountAmount : 0);
      const effectivePrice = Math.max(0, basePrice - discount);

      const platformFeeRate = 0.05; // 5% platform fee
      const platformFeeAoa = Math.round(effectivePrice * platformFeeRate);
      const instructorNetAoa = effectivePrice - platformFeeAoa;

      res.json({
        success: true,
        calculation: {
          originalPriceAoa: basePrice,
          discountAoa: discount,
          effectivePriceAoa: effectivePrice,
          platformFeeRate,
          platformFeeAoa,
          instructorNetAoa,
          calculatedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Falha no cálculo da transação no servidor.' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite Integration (SPA dev middleware vs production static)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Mercado Angola Full-Stack Server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
