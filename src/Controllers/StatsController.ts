import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class StatsController {
  static async salesByDay(req: Request, res: Response) {
    try {
      const clients = await prisma.client.findMany({ select: { id: true } });

      if (!clients.length) {
        return res.status(400).json({ error: 'Sem clientes para associar às vendas.' });
      }

      const mockSalesData = Array.from({ length: 10 }).map((_, i) => ({
        value: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
        ),
        clientId: clients[i % clients.length].id,
      }));


      await prisma.sale.createMany({ data: mockSalesData });

      const sales = await prisma.sale.groupBy({
        by: ['createdAt'],
        _sum: {
          value: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const result = sales.map((v) => ({
        date: v.createdAt.toISOString().split('T')[0],
        total: v._sum.value,
      }));

      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao agrupar vendas por dia',
        details: error
      });
    }
  }

  static async topCustomers(req: Request, res: Response) {
    try {
      const customers = await prisma.client.findMany({
        include: { sales: true },
      });

      if (!customers.length) {
        return res.json({ highlights: [] });
      }

      const results = customers.map((customer) => {
        const total = customer.sales.reduce((sum, sale) => sum + sale.value, 0);
        const average = customer.sales.length ? total / customer.sales.length : 0;
        const uniqueDays = new Set(
          customer.sales.map((sale) => sale.createdAt.toISOString().split('T')[0])
        ).size;

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          total,
          average,
          uniqueDays,
        };
      });

      const topVolume = results.reduce((a, b) => (a.total > b.total ? a : b));
      const topAverage = results.reduce((a, b) => (a.average > b.average ? a : b));
      const topFrequency = results.reduce((a, b) => (a.uniqueDays > b.uniqueDays ? a : b));

      const highlights = [
        {
          type: 'topVolume',
          customer: {
            id: topVolume.id,
            name: topVolume.name,
            email: topVolume.email,
          },
          metric: {
            label: 'Total de vendas',
            value: topVolume.total,
          },
        },
        {
          type: 'topAverage',
          customer: {
            id: topAverage.id,
            name: topAverage.name,
            email: topAverage.email,
          },
          metric: {
            label: 'Média por venda',
            value: topAverage.average,
          },
        },
        {
          type: 'topFrequency',
          customer: {
            id: topFrequency.id,
            name: topFrequency.name,
            email: topFrequency.email,
          },
          metric: {
            label: 'Frequência de compra',
            value: topFrequency.uniqueDays,
          },
        },
      ];

      return res.json({ highlights });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to calculate top customers statistics.',
        details: error,
      });
    }
  }


}