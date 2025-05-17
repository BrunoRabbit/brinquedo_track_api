import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const sessionId = randomUUID();

    await prisma.session.create({
      data: {
        sessionId,
        userId: user.id,
      },
    });

    const token = jwt.sign({ sessionId, userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      sessionId,
      login: {
        id: user.id,
        email: user.email,
      },
    });
  }

  static async logout(req: Request, res: Response) {
    const { sessionId } = req.body;

    await prisma.session.deleteMany({
      where: { sessionId },
    });

    return res.status(200).json({ success: true });
  }

  static async register(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const sessionId = randomUUID();

    await prisma.session.create({
      data: {
        sessionId,
        userId: user.id,
      },
    });

    const token = jwt.sign({ sessionId, userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      token,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  }

}
