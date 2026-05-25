import express from 'express';
import { body, validationResult } from 'express-validator';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { asyncHandler } from '@/utils/asyncHandler';

const router = express.Router();

// Get user profile
router.get('/profile',
  rateLimitMiddleware.general,
  asyncHandler(async (req: any, res: express.Response) => {
    const userId = req.user?.userId;
    
    res.json({
      success: true,
      data: {
        userId,
        message: 'User profile endpoint'
      }
    });
  })
);

// Update user profile
router.put('/profile',
  rateLimitMiddleware.general,
  [
    body('username').optional().isLength({ min: 3, max: 50 }),
    body('avatar').optional().isURL(),
    body('title').optional().isLength({ max: 100 })
  ],
  asyncHandler(async (req: any, res: express.Response) => {
    const userId = req.user?.userId;
    
    res.json({
      success: true,
      data: {
        userId,
        message: 'Profile updated successfully'
      }
    });
  })
);

export default router;
