import request from 'supertest';
import app from '../../index';
import { prisma } from '../../lib/prisma';

describe('AuthController', () => {
  const testEmail = 'teste@teste.com';
  const testPassword = '123456';

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('deve registrar um novo usuário', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
  });

  it('deve fazer login com usuário existente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
