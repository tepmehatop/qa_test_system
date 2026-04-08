import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const router = Router();

// Mock data store
let mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', active: true },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user', active: true },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'user', active: false },
];
let mockProducts = [
  { id: 1, name: 'Laptop Pro', price: 1299.99, category: 'Electronics', stock: 50 },
  { id: 2, name: 'Wireless Mouse', price: 29.99, category: 'Accessories', stock: 200 },
  { id: 3, name: 'USB Hub', price: 19.99, category: 'Accessories', stock: 150 },
];
let mockOrders = [
  { id: 1, userId: 1, productId: 1, quantity: 2, status: 'delivered', total: 2599.98 },
  { id: 2, userId: 2, productId: 2, quantity: 1, status: 'pending', total: 29.99 },
];

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'QA Test API',
    version: '1.0.0',
    description: 'API для тестирования. Используйте Try it out для выполнения запросов.',
  },
  tags: [
    { name: 'Users', description: 'Управление пользователями' },
    { name: 'Products', description: 'Управление товарами' },
    { name: 'Orders', description: 'Управление заказами' },
    { name: 'Health', description: 'Состояние сервиса' },
  ],
  paths: {
    '/api/swagger-mock/health': {
      get: {
        tags: ['Health'],
        summary: 'Проверка состояния API',
        responses: {
          '200': { description: 'API работает', content: { 'application/json': { example: { status: 'ok', uptime: 12345 } } } },
        },
      },
    },
    '/api/swagger-mock/users': {
      get: {
        tags: ['Users'],
        summary: 'Получить список всех пользователей',
        parameters: [
          { name: 'active', in: 'query', schema: { type: 'boolean' }, description: 'Фильтр по статусу активности' },
        ],
        responses: {
          '200': { description: 'Список пользователей' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Создать нового пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Пользователь создан' },
          '400': { description: 'Ошибка валидации' },
        },
      },
    },
    '/api/swagger-mock/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Получить пользователя по ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: {
          '200': { description: 'Данные пользователя' },
          '404': { description: 'Пользователь не найден' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Обновить данные пользователя',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Данные обновлены' },
          '404': { description: 'Пользователь не найден' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Удалить пользователя',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: {
          '204': { description: 'Пользователь удалён' },
          '404': { description: 'Пользователь не найден' },
        },
      },
    },
    '/api/swagger-mock/products': {
      get: {
        tags: ['Products'],
        summary: 'Получить список товаров',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Фильтр по категории' },
        ],
        responses: { '200': { description: 'Список товаров' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Добавить новый товар',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string', example: 'New Product' },
                  price: { type: 'number', example: 99.99 },
                  category: { type: 'string', example: 'Electronics' },
                  stock: { type: 'integer', example: 10 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Товар создан' },
          '400': { description: 'Ошибка валидации' },
        },
      },
    },
    '/api/swagger-mock/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Получить товар по ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: { '200': { description: 'Данные товара' }, '404': { description: 'Товар не найден' } },
      },
      put: {
        tags: ['Products'],
        summary: 'Обновить товар',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  stock: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Товар обновлён' }, '404': { description: 'Товар не найден' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Удалить товар',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: { '204': { description: 'Удалено' }, '404': { description: 'Не найдено' } },
      },
    },
    '/api/swagger-mock/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Получить список заказов',
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'integer' }, description: 'Фильтр по пользователю' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'delivered', 'cancelled'] } },
        ],
        responses: { '200': { description: 'Список заказов' } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Создать заказ',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'productId', 'quantity'],
                properties: {
                  userId: { type: 'integer', example: 1 },
                  productId: { type: 'integer', example: 2 },
                  quantity: { type: 'integer', example: 3 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Заказ создан' }, '400': { description: 'Ошибка' } },
      },
    },
    '/api/swagger-mock/orders/{id}': {
      put: {
        tags: ['Orders'],
        summary: 'Обновить статус заказа',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['pending', 'delivered', 'cancelled'] } },
              },
            },
          },
        },
        responses: { '200': { description: 'Статус обновлён' }, '404': { description: 'Заказ не найден' } },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Отменить заказ',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: { '204': { description: 'Заказ отменён' }, '404': { description: 'Заказ не найден' } },
      },
    },
  },
};

// Serve Swagger UI
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.get('/spec', (_req, res) => res.json(swaggerSpec));

// ---- Mock endpoints ----

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Users
router.get('/users', (req, res) => {
  const { active } = req.query;
  let result = [...mockUsers];
  if (active !== undefined) result = result.filter((u) => u.active === (active === 'true'));
  res.json(result);
});

router.post('/users', (req, res) => {
  const { name, email, role } = req.body as { name?: string; email?: string; role?: string };
  if (!name || !email) {
    res.status(400).json({ error: 'name and email are required' });
    return;
  }
  const user = { id: mockUsers.length + 1, name, email, role: role || 'user', active: true };
  mockUsers.push(user);
  res.status(201).json(user);
});

router.get('/users/:id', (req, res) => {
  const user = mockUsers.find((u) => u.id === Number(req.params.id));
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

router.put('/users/:id', (req, res) => {
  const idx = mockUsers.findIndex((u) => u.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: 'User not found' }); return; }
  mockUsers[idx] = { ...mockUsers[idx], ...req.body };
  res.json(mockUsers[idx]);
});

router.delete('/users/:id', (req, res) => {
  const idx = mockUsers.findIndex((u) => u.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: 'User not found' }); return; }
  mockUsers.splice(idx, 1);
  res.status(204).send();
});

// Products
router.get('/products', (req, res) => {
  const { category } = req.query;
  let result = [...mockProducts];
  if (category) result = result.filter((p) => p.category === category);
  res.json(result);
});

router.post('/products', (req, res) => {
  const { name, price, category, stock } = req.body as { name?: string; price?: number; category?: string; stock?: number };
  if (!name || price === undefined) {
    res.status(400).json({ error: 'name and price are required' });
    return;
  }
  const product = { id: mockProducts.length + 1, name, price, category: category || 'General', stock: stock || 0 };
  mockProducts.push(product);
  res.status(201).json(product);
});

router.get('/products/:id', (req, res) => {
  const p = mockProducts.find((p) => p.id === Number(req.params.id));
  if (!p) { res.status(404).json({ error: 'Product not found' }); return; }
  res.json(p);
});

router.put('/products/:id', (req, res) => {
  const idx = mockProducts.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: 'Product not found' }); return; }
  mockProducts[idx] = { ...mockProducts[idx], ...req.body };
  res.json(mockProducts[idx]);
});

router.delete('/products/:id', (req, res) => {
  const idx = mockProducts.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: 'Product not found' }); return; }
  mockProducts.splice(idx, 1);
  res.status(204).send();
});

// Orders
router.get('/orders', (req, res) => {
  const { userId, status } = req.query;
  let result = [...mockOrders];
  if (userId) result = result.filter((o) => o.userId === Number(userId));
  if (status) result = result.filter((o) => o.status === status);
  res.json(result);
});

router.post('/orders', (req, res) => {
  const { userId, productId, quantity } = req.body as { userId?: number; productId?: number; quantity?: number };
  if (!userId || !productId || !quantity) {
    res.status(400).json({ error: 'userId, productId, quantity are required' });
    return;
  }
  const product = mockProducts.find((p) => p.id === productId);
  const total = product ? product.price * quantity : 0;
  const order = { id: mockOrders.length + 1, userId, productId, quantity, status: 'pending', total };
  mockOrders.push(order);
  res.status(201).json(order);
});

router.put('/orders/:id', (req, res) => {
  const idx = mockOrders.findIndex((o) => o.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: 'Order not found' }); return; }
  mockOrders[idx] = { ...mockOrders[idx], ...req.body };
  res.json(mockOrders[idx]);
});

router.delete('/orders/:id', (req, res) => {
  const idx = mockOrders.findIndex((o) => o.id === Number(req.params.id));
  if (idx === -1) { res.status(404).json({ error: 'Order not found' }); return; }
  mockOrders.splice(idx, 1);
  res.status(204).send();
});

export default router;
