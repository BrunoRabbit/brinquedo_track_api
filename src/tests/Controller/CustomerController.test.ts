import request from 'supertest';
import app from '../../index';
import { prisma } from '../../lib/prisma';

describe('CustomerController', () => {
  let token: string;
  const testEmail = 'cliente@teste.com';

  beforeAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'admin@teste.com' } });

    await request(app)
      .post('/auth/register')
      .send({ email: 'admin@teste.com', password: '123456' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@teste.com', password: '123456' });

    token = res.body.token;
  });

  afterAll(async () => {
    await prisma.sale.deleteMany();
    await prisma.session.deleteMany();
    await prisma.client.deleteMany({ where: { email: { contains: '@teste.com' } } });
    await prisma.user.deleteMany({ where: { email: { contains: '@teste.com' } } });
    await prisma.$disconnect();
  });

  it('deve criar um novo cliente', async () => {
    const res = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Teste',
        email: testEmail,
        birthDate: '01/01/1990',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testEmail);
  });

  it('deve listar clientes cadastrados', async () => {
    const res = await request(app)
      .get('/customers')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.clientes)).toBe(true);
  });

  it('deve editar o cliente', async () => {
    const oldEmail = 'cliente@teste.com';
    const newEmail = 'cliente-editado@teste.com';

    await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente para editar',
        email: oldEmail,
        birthDate: '01/01/1990',
      });

    const res = await request(app)
      .put('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldEmail,
        newEmail,
        name: 'Cliente Editado',
        birthDate: '02/02/1990',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(newEmail);
  });


  it('deve deletar o cliente', async () => {
    const res = await request(app)
      .delete('/customer/cliente-editado@teste.com')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
