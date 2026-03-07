import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  reseller?: {
    id: string;
    name: string;
  };
}

const authService = new AuthService();

export const authenticateReseller = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new UnauthorizedError('Missing token');
    }
    
    const reseller = await authService.validateBearerToken(token);
    
    if (!reseller) {
      throw new UnauthorizedError('Invalid token');
    }
    
    // Attach reseller info to request
    req.reseller = {
      id: reseller.id,
      name: reseller.name,
    };
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError());
    }
  }
};
