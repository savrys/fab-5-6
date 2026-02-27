const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const PORT = 3000;

// Разрешаем все источники (для отладки – можно сузить позже)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Явная обработка OPTIONS (на случай, если cors() не сработает)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Парсинг JSON
app.use(express.json());

// Логирование запросов (после CORS)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'no origin'}`);
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// ---------- База данных ----------
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

// Вспомогательная функция для поиска товара
function findProductOr404(id, res) {
  const product = products.find(p => p.id === id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return null;
  }
  return product;
}

// ---------- Маршруты API ----------
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

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

app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

// Обработка 404 для несуществующих маршрутов API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});