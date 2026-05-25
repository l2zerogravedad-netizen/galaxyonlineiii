import express from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '@/services/authService';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/types';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

// Login endpoint
router.post('/login',
  rateLimitMiddleware.auth,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
    body('clientType')
      .optional()
      .isIn(['PC', 'Web', 'Mobile', 'unknown'])
      .withMessage('Invalid client type')
  ],
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const result = await authService.login(req.body);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  })
);

// Register endpoint
router.post('/register',
  rateLimitMiddleware.auth,
  [
    body('username')
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be 8-128 characters and contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    body('clientType')
      .optional()
      .isIn(['PC', 'Web', 'Mobile', 'unknown'])
      .withMessage('Invalid client type'),
    body('referralCode')
      .optional()
      .isLength({ min: 6, max: 20 })
      .withMessage('Referral code must be 6-20 characters')
  ],
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const result = await authService.register(req.body);
    
    if (!result.success) {
      const statusCode = result.error?.code === 'USERNAME_TAKEN' || result.error?.code === 'EMAIL_TAKEN' ? 409 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(201).json(result);
  })
);

// Refresh token endpoint
router.post('/refresh',
  rateLimitMiddleware.auth,
  [
    body('refreshToken')
      .isLength({ min: 1 })
      .withMessage('Refresh token is required'),
    body('clientType')
      .optional()
      .isIn(['PC', 'Web', 'Mobile', 'unknown'])
      .withMessage('Invalid client type')
  ],
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { refreshToken, clientType } = req.body;
    const result = await authService.refreshToken(refreshToken, clientType);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  })
);

// Logout endpoint
router.post('/logout',
  rateLimitMiddleware.auth,
  [
    body('sessionId')
      .isUUID()
      .withMessage('Valid session ID is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { sessionId } = req.body;
    const result = await authService.logout(sessionId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  })
);

// Logout all sessions endpoint
router.post('/logout-all',
  rateLimitMiddleware.auth,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const result = await authService.logoutAllSessions(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  })
);

// Verify token endpoint
router.post('/verify',
  rateLimitMiddleware.auth,
  [
    body('token')
      .isLength({ min: 1 })
      .withMessage('Token is required')
  ],
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const { token } = req.body;
    const result = await authService.verifyAccessToken(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  })
);

// Change password endpoint
router.post('/change-password',
  rateLimitMiddleware.auth,
  [
    body('currentPassword')
      .isLength({ min: 1 })
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must be 8-128 characters and contain at least one lowercase letter, one uppercase letter, one number, and one special character')
  ],
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      const statusCode = result.error?.code === 'INVALID_CURRENT_PASSWORD' ? 400 : 500;
      return res.status(statusCode).json(result);
    }

    res.json(result);
  })
);

export default router;
