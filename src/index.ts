import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { customerRoutes } from './routes/customer';
import { authRoutes } from './routes/auth';
import { statsRoutes } from './routes/stats';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/', customerRoutes);
app.use('/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Server is working');
});

const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`listening on http://${'0.0.0.0'}:${port}`);
});