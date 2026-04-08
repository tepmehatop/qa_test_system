import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './shop.css';

interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  stock: number;
  rating: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

const CART_KEY = 'shop_cart';

export default function ShopTask() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // BUG 3 (counter): initialized once from localStorage — never updates reactively
  // Only becomes correct after page refresh (when localStorage is re-read on mount)
  const [displayCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        return items.reduce((s, i) => s + i.quantity, 0);
      }
    } catch {/* ignore */}
    return 0;
  });

  // Ref to track whether we should show the broken image for product 7 (no fallback)
  const brokenImgRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    axios.get(`/api/${sessionId}/shop/products`).then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
    // Load cart from localStorage on mount
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {/* ignore */}
  }, [sessionId]);

  // BUG 1 (sort): sorts as strings — intentional
  function getSorted(list: Product[]): Product[] {
    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => String(a.price).localeCompare(String(b.price)));
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => String(b.price).localeCompare(String(a.price)));
    }
    if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }

  async function handleAddToCart(product: Product) {
    try {
      await axios.post(`/api/${sessionId}/shop/cart`, { productId: product.id, quantity: 1 });
    } catch {
      // BUG: 400 error silently swallowed — cart appears to work
    }

    // Update in-memory cart state (sidebar works correctly)
    const updated = (() => {
      const existing = cart.find((i) => i.product.id === product.id);
      if (existing) {
        return cart.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...cart, { product, quantity: 1 }];
    })();

    setCart(updated);
    // Persist to localStorage — counter will be correct only after page refresh
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    // displayCount is NOT updated here — that's the bug
  }

  // BUG 4: wishlist — no visual feedback
  function handleWishlist(id: number) {
    void id; // state not tracked — no effect
  }

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const sorted = getSorted(products);

  return (
    <div className="shop-page">
      <header className="shop-header">
        <button className="back-btn" onClick={() => navigate(`/testQasystem/${sessionId}/dashboard`)}>
          ← Назад
        </button>
        <div className="shop-header-center">
          {/* BUG орфо #1: "Интренет-магазин" */}
          <h1>Интренет-магазин TechStore</h1>
          {/* BUG орфо #2: "лучщим" */}
          <p>Лучшие товары по лучщим ценам</p>
        </div>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Корзина
          {/* BUG 3: displayCount is stale — shows value from last page load only */}
          <span className="cart-count">{displayCount}</span>
        </button>
      </header>

      <div className="shop-toolbar">
        <div className="shop-categories">
          <span className="category-tag active">Все</span>
          <span className="category-tag">Электроника</span>
          <span className="category-tag">Компьютеры</span>
          <span className="category-tag">Аксессуары</span>
        </div>
        <div className="shop-sort">
          <label>Сортировка:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="default">По умолчанию</option>
            <option value="price-asc">По цене ↑</option>
            <option value="price-desc">По цене ↓</option>
            <option value="name">По названию</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="shop-loading">Загрузка товаров...</div>
      ) : (
        <div className="products-grid">
          {sorted.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrap">
                {/* BUG 2: product 7 has broken image (no onError fallback for it) */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  onError={product.id === 7 ? undefined : (e) => {
                    const img = e.currentTarget;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent && !brokenImgRef.current.has(product.id)) {
                      brokenImgRef.current.add(product.id);
                      const ph = document.createElement('div');
                      ph.className = 'product-image-placeholder';
                      ph.textContent = product.category === 'Электроника' ? '📱' :
                        product.category === 'Компьютеры' ? '💻' : '🔧';
                      parent.appendChild(ph);
                    }
                  }}
                />
                {/* BUG 4: heart always 🤍, never changes — no visual feedback */}
                <button
                  className="wishlist-btn"
                  onClick={() => handleWishlist(product.id)}
                  title="В избранное"
                >
                  🤍
                </button>
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-rating">
                  {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                  <span>{product.rating}</span>
                </div>
                <div className="product-footer">
                  <div className="product-price">
                    {/* BUG 7 (price): product 3 has no currency symbol */}
                    {product.price.toLocaleString('ru-RU')}{product.currency ? ` ${product.currency}` : ''}
                  </div>
                  <div className="product-stock">
                    {product.stock > 0
                      ? <span className="in-stock">В наличии: {product.stock}</span>
                      : <span className="out-of-stock">Нет в наличии</span>}
                  </div>
                </div>
                {/*
                  BUG 5: product with stock=0 should have disabled button.
                  CSS class "add-to-cart--disabled" LOOKS disabled (gray, cursor not-allowed)
                  but the HTML 'disabled' attribute is NOT set → button is still clickable!
                */}
                <button
                  className={`btn-primary add-to-cart${product.stock === 0 ? ' add-to-cart--disabled' : ''}`}
                  onClick={() => handleAddToCart(product)}
                >
                  {product.stock === 0 ? 'Недоступно' : 'В корзину'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUG 6: "Политика конфиденциальности" link → backend 404 */}
      <footer className="shop-footer">
        <p>
          © 2024 TechStore.{' '}
          {/* О компании and Контакты work fine */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate(`/testQasystem/${sessionId}/task1/about`); }}
          >
            О компании
          </a>
          {' · '}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); navigate(`/testQasystem/${sessionId}/task1/contacts`); }}
          >
            Контакты
          </a>
          {' · '}
          {/* BUG 6: goes to /api/privacy-policy → backend 404 JSON */}
          <a href="/api/privacy-policy">Политика конфиденциальности</a>
        </p>
      </footer>

      {/* Cart sidebar */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-sidebar-header">
              <h2>Корзина</h2>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="cart-empty">Корзина пуста</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.product.id} className="cart-item">
                      <div className="cart-item-name">{item.product.name}</div>
                      <div className="cart-item-qty">× {item.quantity}</div>
                      <div className="cart-item-price">
                        {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  Итого: <strong>{cartTotal.toLocaleString('ru-RU')} ₽</strong>
                </div>
                <button className="btn-primary btn-full" onClick={() => toast.success('Заказ оформлен!')}>
                  Оформить заказ
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
