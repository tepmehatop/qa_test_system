import { useState, useEffect } from 'react';
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

export default function ShopTask() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/${sessionId}/shop/products`).then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
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
    // BUG 5: even if stock === 0, this button is available (no disabled state)
    try {
      // This always returns 400 from backend — BUG 1 of the task
      await axios.post(
        `/api/${sessionId}/shop/cart`,
        { productId: product.id, quantity: 1 },
      );
      // If somehow succeeds, add to local cart
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { product, quantity: 1 }];
      });
    } catch (_err) {
      // BUG: error received but NOT shown to user — cart silently "works"
      // Add to local cart anyway so it looks like it worked
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { product, quantity: 1 }];
      });
    }
  }

  // BUG 4: wishlist button — adds to state but no visual feedback shown
  function handleWishlist(id: number) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    // No toast, no visual change — intentional
  }

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const sorted = getSorted(products);

  return (
    <div className="shop-page">
      <header className="shop-header">
        <button className="back-btn" onClick={() => navigate(`/testQasystem/${sessionId}/dashboard`)}>
          ← Назад
        </button>
        <div className="shop-header-center">
          {/* BUG: орфографическая ошибка #1 — "Интренет-магазин" */}
          <h1>Интренет-магазин TechStore</h1>
          <p>Лучшие товары по лучщим ценам</p>{/* BUG: орфографическая ошибка #2 — "лучщим" */}
        </div>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Корзина
          {/* BUG 3: counter not updated — always shows stale value on first render */}
          <span className="cart-count">{cartCount}</span>
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
                <img src={product.image} alt={product.name} className="product-image" />
                <button
                  className="wishlist-btn"
                  onClick={() => handleWishlist(product.id)}
                  title="В избранное"
                >
                  {/* BUG 4: heart icon never changes — no visual feedback */}
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
                    {/* BUG 3 (price): one product has no currency symbol — handled in data */}
                    {product.price.toLocaleString('ru-RU')}{product.currency ? ` ${product.currency}` : ''}
                  </div>
                  <div className="product-stock">
                    {product.stock > 0
                      ? <span className="in-stock">В наличии: {product.stock}</span>
                      : <span className="out-of-stock">Нет в наличии</span>}
                  </div>
                </div>
                {/* BUG 5: button active even when stock === 0 */}
                <button className="btn-primary add-to-cart" onClick={() => handleAddToCart(product)}>
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUG 6: footer link → 404 */}
      <footer className="shop-footer">
        <p>© 2024 TechStore. <a href="/about-us">О компании</a> · <a href="/contacts">Контакты</a> · <a href="/policy-page-not-exist">Политика конфиденциальности</a></p>
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
