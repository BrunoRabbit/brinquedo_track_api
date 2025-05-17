import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../Models/User';

interface RequestWithUser extends Request {
  user?: User;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const payloadDecoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as RequestWithUser).user = new User(payloadDecoded);

    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
