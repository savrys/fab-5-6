const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// OPTIONS handler
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Logging
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Функция для определения базового URL в зависимости от окружения
const getBaseUrl = () => {
  // Если мы в GitHub Codespaces
  if (process.env.CODESPACES === 'true' && process.env.CODESPACE_NAME) {
    return `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`;
  }
  // Локальная разработка
  return `http://localhost:${PORT}`;
};

const baseUrl = getBaseUrl();

// ========== SWAGGER CONFIGURATION ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Store API',
      version: '1.0.0',
      description: 'API для управления товарами интернет-магазина',
      contact: {
        name: 'Student',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Локальный сервер',
      },
      {
        url: `${baseUrl}/api`,
        description: 'Codespaces сервер',
      },
    ],
  },
  apis: ['./server.js'], // путь к файлу с аннотациями
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// ============================================

// ========== DATA ==========
let products = [
  {
    id: nanoid(6),
    name: 'Ноутбук ASUS',
    category: 'Электроника',
    description: 'Мощный ноутбук для работы и игр',
    price: 75000,
    stock: 10,
    rating: 4.5,
    image: 'https://via.placeholder.com/150?text=Notebook'
  },
  {
    id: nanoid(6),
    name: 'Смартфон Samsung',
    category: 'Электроника',
    description: 'Последняя модель с отличной камерой',
    price: 45000,
    stock: 15,
    rating: 4.7,
    image: 'https://via.placeholder.com/150?text=Phone'
  },
  {
    id: nanoid(6),
    name: 'Книга "JavaScript для начинающих"',
    category: 'Книги',
    description: 'Изучение JavaScript с нуля',
    price: 1200,
    stock: 30,
    rating: 4.8,
    image: 'https://via.placeholder.com/150?text=Book'
  },
  {
    id: nanoid(6),
    name: 'Футболка хлопковая',
    category: 'Одежда',
    description: 'Качественная футболка из хлопка',
    price: 800,
    stock: 50,
    rating: 4.2,
    image: 'https://via.placeholder.com/150?text=T-shirt'
  },
  {
    id: nanoid(6),
    name: 'Кофеварка',
    category: 'Техника',
    description: 'Автоматическая кофеварка для дома',
    price: 12000,
    stock: 5,
    rating: 4.6,
    image: 'https://via.placeholder.com/150?text=Coffee'
  },
  {
    id: nanoid(6),
    name: 'Планшет Apple iPad',
    category: 'Электроника',
    description: '10-дюймовый планшет с ретина-экраном',
    price: 35000,
    stock: 8,
    rating: 4.9,
    image: 'https://via.placeholder.com/150?text=iPad'
  },
  {
    id: nanoid(6),
    name: 'Наушники Sony',
    category: 'Электроника',
    description: 'Беспроводные наушники с шумоподавлением',
    price: 8000,
    stock: 12,
    rating: 4.6,
    image: 'https://via.placeholder.com/150?text=Headphones'
  },
  {
    id: nanoid(6),
    name: 'Кроссовки Nike',
    category: 'Одежда',
    description: 'Спортивная обувь для бега',
    price: 5500,
    stock: 20,
    rating: 4.4,
    image: 'https://via.placeholder.com/150?text=Nike'
  },
  {
    id: nanoid(6),
    name: 'Рюкзак',
    category: 'Аксессуары',
    description: 'Водонепроницаемый рюкзак для ноутбука',
    price: 2500,
    stock: 15,
    rating: 4.3,
    image: 'https://via.placeholder.com/150?text=Backpack'
  },
  {
    id: nanoid(6),
    name: 'Микроволновка',
    category: 'Техника',
    description: 'Компактная микроволновая печь',
    price: 6000,
    stock: 7,
    rating: 4.2,
    image: 'https://via.placeholder.com/150?text=Microwave'
  }
];

// Helper
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

// ========== SWAGGER SCHEMA ==========
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Название товара
 *           example: "Ноутбук ASUS"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Электроника"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "Мощный ноутбук для работы и игр"
 *         price:
 *           type: number
 *           description: Цена в рублях
 *           example: 75000
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 10
 *         rating:
 *           type: number
 *           description: Рейтинг товара (0-5)
 *           example: 4.5
 *         image:
 *           type: string
 *           description: URL изображения
 *           example: "https://via.placeholder.com/150"
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */
// ===================================

// ========== API ROUTES ==========

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Не все обязательные поля заполнены
 */
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;
  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating ? Number(rating) : 0,
    image: image || 'https://via.placeholder.com/150?text=Product'
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;

  const { name, category, description, price, stock, rating, image } = req.body;
  if (name === undefined && category === undefined && description === undefined && price === undefined && stock === undefined && rating === undefined && image === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image;
  res.json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Запуск сервера с правильными ссылками
app.listen(PORT, () => {
  
  console.log(`Swagger UI available at ${baseUrl}/api-docs`);
  
  // Дополнительная информация для Codespaces
  if (process.env.CODESPACES === 'true') {
    console.log(`Client URL: https://${process.env.CODESPACE_NAME}-3001.app.github.dev`);
    console.log(`\n🔗 Кликабельные ссылки:`);
   
    console.log(`📚 Swagger: ${baseUrl}/api-docs`);
    console.log(`🎨 Client: https://${process.env.CODESPACE_NAME}-3001.app.github.dev`);
  }
}); 