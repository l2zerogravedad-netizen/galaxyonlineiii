import express from 'express';
import { economyService } from '@/services/economyService';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { asyncHandler } from '@/utils/asyncHandler';

const router = express.Router();

// Get user resources
router.get('/resources',
  rateLimitMiddleware.general,
  asyncHandler(async (req: any, res: express.Response) => {
    const userId = req.user?.userId;
    const result = await economyService.getUserResources(userId);
    
    res.json(result);
  })
);

// Update production
router.post('/production/update',
  rateLimitMiddleware.general,
  asyncHandler(async (req: any, res: express.Response) => {
    const userId = req.user?.userId;
    const { deltaTime } = req.body;
    
    const result = await economyService.updateUserProduction({ userId, deltaTime });
    res.json(result);
  })
);

// Transfer resources
router.post('/transfer',
  rateLimitMiddleware.general,
  asyncHandler(async (req: any, res: express.Response) => {
    const userId = req.user?.userId;
    const transferData = { ...req.body, fromUserId: userId };
    
    const result = await economyService.transferResources(transferData);
    res.json(result);
  })
);

// Get transactions
router.get('/transactions',
  rateLimitMiddleware.general,
  asyncHandler(async (req: any, res: express.Response) => {
    const userId = req.user?.userId;
    const result = await economyService.getUserTransactions(userId, req.query);
    
    res.json(result);
  })
);

export default router;
