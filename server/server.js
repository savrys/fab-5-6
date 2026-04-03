const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// Секреты
const ACCESS_SECRET = 'access_secret_key_change_in_production';
const REFRESH_SECRET = 'refresh_secret_key_change_in_production';
const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

// ========== РАБОТА С ФАЙЛОМ ДАННЫХ ==========
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const data = JSON.parse(raw);
      console.log(' Данные загружены из файла');
      return data;
    }
  } catch (err) {
    console.error(' Ошибка загрузки данных:', err.message);
  }
  return { users: [], products: [] };
}

function saveData(users, products) {
  try {
    const dataToSave = { users, products };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    console.log(' Данные сохранены в файл');
  } catch (err) {
    console.error(' Ошибка сохранения данных:', err.message);
  }
}

// ========== ЗАГРУЗКА НАЧАЛЬНЫХ ДАННЫХ ==========
let { users: loadedUsers, products: loadedProducts } = loadData();

let users = [];
let products = [];

if (loadedUsers.length === 0) {
  // Первый запуск – создаём администратора
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  users = [
    {
      id: nanoid(6),
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      passwordHash: adminPasswordHash,
      role: 'admin'
    }
  ];
  console.log(' Создан администратор по умолчанию');
} else {
  // Восстанавливаем пользователей с их хешами
  users = loadedUsers;
  console.log(` Загружено ${users.length} пользователей`);
}

if (loadedProducts.length === 0) {
  // Начальные товары
  products = [
    { id: nanoid(6), title: 'Ноутбук ASUS', category: 'Электроника', description: 'Мощный ноутбук для работы и игр', price: 75000, stock: 10, rating: 4.5, image: 'https://via.placeholder.com/150?text=Notebook' },
    { id: nanoid(6), title: 'Смартфон Samsung', category: 'Электроника', description: 'Последняя модель с отличной камерой', price: 45000, stock: 15, rating: 4.7, image: 'https://via.placeholder.com/150?text=Phone' },
    { id: nanoid(6), title: 'Книга "JavaScript для начинающих"', category: 'Книги', description: 'Изучение JavaScript с нуля', price: 1200, stock: 30, rating: 4.8, image: 'https://via.placeholder.com/150?text=Book' },
    { id: nanoid(6), title: 'Футболка хлопковая', category: 'Одежда', description: 'Качественная футболка из хлопка', price: 800, stock: 50, rating: 4.2, image: 'https://via.placeholder.com/150?text=T-shirt' },
    { id: nanoid(6), title: 'Кофеварка', category: 'Техника', description: 'Автоматическая кофеварка для дома', price: 12000, stock: 5, rating: 4.6, image: 'https://via.placeholder.com/150?text=Coffee' },
    { id: nanoid(6), title: 'Планшет Apple iPad', category: 'Электроника', description: '10-дюймовый планшет с ретина-экраном', price: 35000, stock: 8, rating: 4.9, image: 'https://via.placeholder.com/150?text=iPad' },
    { id: nanoid(6), title: 'Наушники Sony', category: 'Электроника', description: 'Беспроводные наушники с шумоподавлением', price: 8000, stock: 12, rating: 4.6, image: 'https://via.placeholder.com/150?text=Headphones' },
    { id: nanoid(6), title: 'Кроссовки Nike', category: 'Одежда', description: 'Спортивная обувь для бега', price: 5500, stock: 20, rating: 4.4, image: 'https://via.placeholder.com/150?text=Nike' },
    { id: nanoid(6), title: 'Рюкзак', category: 'Аксессуары', description: 'Водонепроницаемый рюкзак для ноутбука', price: 2500, stock: 15, rating: 4.3, image: 'https://via.placeholder.com/150?text=Backpack' },
    { id: nanoid(6), title: 'Микроволновка', category: 'Техника', description: 'Компактная микроволновая печь', price: 6000, stock: 7, rating: 4.2, image: 'https://via.placeholder.com/150?text=Microwave' }
  ];
  console.log(' Созданы начальные товары');
} else {
  products = loadedProducts;
  console.log(` Загружено ${products.length} товаров`);
}

// Сохраняем данные после загрузки, чтобы синхронизировать файл
saveData(users, products);

// ========== CORS ==========
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('app.github.dev') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','X-Requested-With'] }));
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') console.log('Body:', req.body);
  });
  next();
});

const getBaseUrl = () => {
  if (process.env.CODESPACES === 'true' && process.env.CODESPACE_NAME) return `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`;
  return `http://localhost:${PORT}`;
};
const baseUrl = getBaseUrl();

const refreshTokens = new Set();

// ========== Вспомогательные функции ==========
const findUserByEmail = (email) => users.find(u => u.email === email);
const findUserById = (id) => users.find(u => u.id === id);

const hashPassword = async (password) => await bcrypt.hash(password, 10);
const verifyPassword = async (password, hash) => await bcrypt.compare(password, hash);

const generateAccessToken = (user) => jwt.sign(
  { sub: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
  ACCESS_SECRET,
  { expiresIn: ACCESS_EXPIRES_IN }
);
const generateRefreshToken = (user) => jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid authorization format' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
const roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden: insufficient rights' });
  next();
};

// ========== SWAGGER ДОКУМЕНТАЦИЯ ==========
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Аутентификация
 *   - name: Users
 *     description: Управление пользователями (только админ)
 *   - name: Products
 *     description: Управление товарами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         rating:
 *           type: number
 *         image:
 *           type: string
 */

// ========== МАРШРУТЫ ==========

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка в данных
 */
app.post('/api/auth/register', async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  if (!email || !first_name || !last_name || !password) return res.status(400).json({ error: 'Missing required fields' });
  if (findUserByEmail(email)) return res.status(400).json({ error: 'User already exists' });
  const passwordHash = await hashPassword(password);
  const newUser = { id: nanoid(6), email, first_name, last_name, passwordHash, role: 'user' };
  users.push(newUser);
  saveData(users, products);
  res.status(201).json({ id: newUser.id, email, first_name, last_name, role: newUser.role });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Неверные учётные данные
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.add(refreshToken);
  res.json({ accessToken, refreshToken });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 */
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  if (!refreshTokens.has(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    refreshTokens.delete(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.add(newRefreshToken);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  res.json(safeUsers);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       200:
 *         description: Обновлённый пользователь
 */
app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { email, first_name, last_name, role } = req.body;
  if (email !== undefined && email !== user.email && findUserByEmail(email)) return res.status(400).json({ error: 'Email already in use' });
  if (email !== undefined) user.email = email;
  if (first_name !== undefined) user.first_name = first_name;
  if (last_name !== undefined) user.last_name = last_name;
  if (role !== undefined && ['user','seller','admin'].includes(role)) user.role = role;
  saveData(users, products);
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Пользователь удалён
 *       400:
 *         description: Нельзя удалить себя
 */
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  if (users[index].id === req.user.sub) return res.status(400).json({ error: 'Cannot delete yourself' });
  users.splice(index, 1);
  saveData(users, products);
  res.status(204).send();
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
app.get('/api/products', authMiddleware, roleMiddleware(['user','seller','admin']), (req, res) => res.json(products));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, roleMiddleware(['user','seller','admin']), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар (только продавец или админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller','admin']), (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;
  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newProduct = {
    id: nanoid(6),
    title: name.trim(),
    category: category.trim(),
    description: description.trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating ? Number(rating) : 0,
    image: image || 'https://via.placeholder.com/150?text=Product'
  };
  products.push(newProduct);
  saveData(users, products);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (только продавец или админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Обновлённый товар
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller','admin']), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { name, category, description, price, stock, rating, image } = req.body;
  if (name !== undefined) product.title = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = image;
  saveData(users, products);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (только админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  products.splice(index, 1);
  saveData(users, products);
  res.status(204).send();
});

// ========== Обработка ошибок ==========
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== Swagger UI ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Online Store API',
      version: '1.0.0',
      description: 'API для интернет-магазина с аутентификацией и ролями',
      contact: { name: 'Student' },
    },
    servers: [{ url: baseUrl, description: 'Сервер' }],  // <- убрали /api
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`Server running at ${baseUrl}`);
  console.log(`Swagger UI available at ${baseUrl}/api-docs`);
  if (process.env.CODESPACES === 'true') {
    console.log(`Client URL: https://${process.env.CODESPACE_NAME}-3001.app.github.dev`);
  }
});