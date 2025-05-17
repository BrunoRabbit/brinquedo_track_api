import request from 'supertest';
import express from 'express';
import { authenticate } from '../../Middleware/authenticate';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/protegida', authenticate, (req, res) => {
  res.json({ access: 'granted' });
});

describe('Middleware: authenticate', () => {
  const secret = process.env.JWT_SECRET!;
  const validToken = jwt.sign({ userId: 123 }, secret);

  it('deve negar acesso sem token', async () => {
    const res = await request(app).get('/protegida');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token missing');
  });

  it('deve negar acesso com token inválido', async () => {
    const res = await request(app)
      .get('/protegida')
      .set('Authorization', 'Bearer token.invalido.aqui');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Invalid token');
  });

  it('deve permitir acesso com token válido', async () => {
    const res = await request(app)
      .get('/protegida')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.access).toBe('granted');
  });
});
