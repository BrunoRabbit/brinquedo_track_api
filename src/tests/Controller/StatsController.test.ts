import request from 'supertest';
import app from '../../index';
import { prisma } from '../../lib/prisma';

describe('StatsController', () => {
  let token: string;
  const customerEmail = 'stats@teste.com';

  beforeAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'statsadmin@teste.com' } });

    await request(app)
      .post('/auth/register')
      .send({ email: 'statsadmin@teste.com', password: '123456' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'statsadmin@teste.com', password: '123456' });

    token = res.body.token;

    await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Stats',
        email: customerEmail,
        birthDate: '01/01/1990',
      });
  });

  afterAll(async () => {
    await prisma.sale.deleteMany();
    await prisma.session.deleteMany();
    await prisma.client.deleteMany({ where: { email: { contains: '@teste.com' } } });
    await prisma.user.deleteMany({ where: { email: { contains: '@teste.com' } } });
    await prisma.$disconnect();
  });

  it('deve retornar vendas agrupadas por dia', async () => {
    const res = await request(app)
      .get('/stats/daily-sales')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('date');
    expect(res.body[0]).toHaveProperty('total');
  });

  it('deve retornar estatísticas de clientes', async () => {
    const res = await request(app)
      .get('/stats/top-clients')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.highlights)).toBe(true);
  });
});
