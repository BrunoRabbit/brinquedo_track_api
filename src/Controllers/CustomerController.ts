import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class CustomerController {
  static async createCustomer(req: Request, res: Response) {
    const { name, email, birthDate } = req.body;

    try {
      const customer = await prisma.client.create({
        data: {
          name,
          email,
          birthDate: CustomerController._parseBirthDate(birthDate),
        },
      });
      res.status(200).json(customer);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(400).json({ error: 'Erro ao criar cliente', details: error });
    }
  }

  static async listCustomers(req: Request, res: Response) {
    const { name, email } = req.query;

    const customers = await prisma.client.findMany({
      where: {
        name: name
          ? { contains: String(name), mode: 'insensitive' }
          : undefined,
        email: email
          ? { contains: String(email), mode: 'insensitive' }
          : undefined,
      },
      include: {
        sales: true,
      },
    });

    const transformed = customers.map((customer) => ({
      info: {
        nomeCompleto: customer.name,
        detalhes: {
          email: customer.email,
          nascimento: customer.birthDate.toISOString().split('T')[0],
        },
      },
      estatisticas: {
        vendas: customer.sales.map((sale) => ({
          data: sale.createdAt.toISOString().split('T')[0],
          valor: sale.value,
        })),
      },
      duplicado: {
        nomeCompleto: customer.name,
      },
    }));

    return res.json({
      data: { clientes: transformed },
      meta: {
        registroTotal: transformed.length,
        pagina: 1,
      },
      redundante: {
        status: 'ok',
      },
    });
  }


  static async editCustomer(req: Request, res: Response) {
    const { oldEmail, newEmail, name, birthDate } = req.body;

    try {
      const updated = await prisma.client.update({
        where: { email: oldEmail },
        data: {
          email: newEmail,
          name,
          birthDate: new Date(birthDate),
        },
      });

      return res.json(updated);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar cliente', details: error });
    }
  }

  static async deleteCustomer(req: Request, res: Response) {
    const { email } = req.params;

    try {
      const existing = await prisma.client.findUnique({
        where: { email },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      }

      await prisma.sale.deleteMany({
        where: { clientId: existing.id },
      });

      await prisma.client.delete({
        where: { email }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Cliente nao encontrado',
        details: error
      });
    }
  }

  static _parseBirthDate = (input: string): Date => {
    const [day, month, year] = input.split('/');
    return new Date(`${year}-${month}-${day}`);
  };
}
