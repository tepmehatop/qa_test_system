import { Router, Request, Response } from 'express';

const router = Router();

// Mock product catalog
const products = [
  { id: 1, name: 'Беспроводные наушники SoundMax Pro', price: 4999, currency: '₽', category: 'Электроника', image: '/images/headphones.jpg', stock: 12, rating: 4.5 },
  { id: 2, name: 'Умные часы FitTrack X2', price: 8999, currency: '₽', category: 'Электроника', image: '/images/watch.jpg', stock: 5, rating: 4.2 },
  { id: 3, name: 'Механическая клавиатура TypeMaster', price: 6500, currency: '', category: 'Компьютеры', image: '/images/keyboard.jpg', stock: 8, rating: 4.7 },
  // BUG 3: ↑ no currency symbol — intentional
  { id: 4, name: 'Игровая мышь SpeedClick 900', price: 2799, currency: '₽', category: 'Компьютеры', image: '/images/mouse.jpg', stock: 20, rating: 4.3 },
  { id: 5, name: 'Портативная колонка BassBoost Mini', price: 3299, currency: '₽', category: 'Электроника', image: '/images/speaker.jpg', stock: 0, rating: 4.0 },
  // BUG 5: ↑ stock: 0 — but "Buy" button will still be active
  { id: 6, name: 'Веб-камера ClearVision 1080p', price: 3100, currency: '₽', category: 'Компьютеры', image: '/images/webcam.jpg', stock: 15, rating: 4.1 },
  { id: 7, name: 'Зарядное устройство PowerHub 65W', price: 1899, currency: '₽', category: 'Аксессуары', image: '/images/broken-image-404.jpg', stock: 30, rating: 3.9 },
  // BUG 2: ↑ broken image URL — intentional 404
  { id: 8, name: 'USB-хаб MultiPort 7-in-1', price: 2100, currency: '₽', category: 'Аксессуары', image: '/images/hub.jpg', stock: 18, rating: 4.4 },
];

// GET /api/:sessionId/shop/products
router.get('/products', (_req: Request, res: Response) => {
  res.json(products);
});

// POST /api/:sessionId/shop/cart
// BUG 1: Always returns 400 — intentional, not shown on frontend
router.post('/cart', (_req: Request, res: Response) => {
  res.status(400).json({
    error: 'CART_SERVICE_UNAVAILABLE',
    message: 'Cart service is temporarily unavailable. Please try again later.',
    code: 'ERR_CART_001',
  });
});

// GET /api/:sessionId/shop/cart — returns empty cart (no 400 here)
router.get('/cart', (_req: Request, res: Response) => {
  res.json({ items: [], total: 0 });
});

export default router;
