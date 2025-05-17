import { Router } from 'express';
import { CustomerController } from '../Controllers/CustomerController';
import { authenticate } from '../Middleware/authenticate';

const router = Router();

router.post('/customer', authenticate, CustomerController.createCustomer);
router.get('/customers', authenticate, CustomerController.listCustomers);
router.put('/customer', authenticate, CustomerController.editCustomer);
router.delete('/customer/:email', authenticate, CustomerController.deleteCustomer);

export { router as customerRoutes };
