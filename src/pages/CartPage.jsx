import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import './CartPage.css';

export default function CartPage() {
  const { items, cartCount, totalAmount, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const deliveryFee = totalAmount > 299 || totalAmount === 0 ? 0 : 40;
  const finalTotal = totalAmount + deliveryFee;

  return (
    <div className="cart-page-wrapper">
      <Header />

      <main className="cart-main-content">
        <div className="cart-header-section">
          <h1 className="cart-title">
            <ShoppingBag className="w-8 h-8 text-amber-500 inline" /> Shopping Cart
          </h1>
          <p className="cart-subtitle">
            {cartCount > 0
              ? `You have ${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your cart`
              : 'Your cart is currently empty'}
          </p>
        </div>

        {loading && items.length === 0 ? (
          <div className="cart-loading-state">
            <div className="cart-spinner"></div>
            <p>Loading your cart items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>
              Looks like you haven't added any fresh delicious fruits or salads yet.
              Explore our menu and nourish your day!
            </p>
            <Link to="/#products" className="btn-shop-now">
              <span>Explore Fresh Fruits</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Items Column */}
            <div className="cart-items-column">
              <div className="cart-items-header-bar">
                <span className="cart-items-count-text">Cart Items ({items.length})</span>
                <button
                  className="btn-clear-cart-text"
                  onClick={clearCart}
                  disabled={loading}
                  title="Remove all items from your cart"
                >
                  <Trash2 size={15} />
                  <span>Clear All</span>
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-img-box">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="cart-item-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="cart-item-fallback-icon">🍊</span>';
                        }}
                      />
                    ) : (
                      <span className="cart-item-fallback-icon">🥗</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <p className="cart-item-category">{item.product?.category || 'Fresh'}</p>
                    <h3 className="cart-item-name">{item.product?.name || 'Product'}</h3>
                    <p className="cart-item-unit-price">
                      ₹{item.price} each
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="cart-qty-control">
                    <button
                      className="qty-btn"
                      disabled={loading || item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      disabled={loading}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="cart-item-subtotal-box">
                    <div className="cart-item-subtotal">
                      ₹{Number(item.subtotal ?? (Number(item.price) * item.quantity) ?? 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Remove Item */}
                  <button
                    className="btn-remove-item"
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading}
                    aria-label="Remove item"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Column */}
            <div className="cart-summary-column">
              <div className="cart-summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-row">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{Number(totalAmount || 0).toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="free-delivery-badge">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                {deliveryFee > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mb-2">
                    💡 Add ₹{(300 - Number(totalAmount || 0)).toFixed(0)} more for FREE Delivery!
                  </p>
                )}

                <div className="summary-divider"></div>

                <div className="summary-total-row">
                  <span className="total-label">Total</span>
                  <span className="total-amount-val">₹{Number(finalTotal || 0).toFixed(2)}</span>
                </div>

                <button
                  className="btn-proceed-checkout"
                  onClick={() => navigate('/checkout')}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>

                <div className="cart-perks">
                  <div className="perk-item">
                    <Truck size={15} className="text-amber-500 perk-icon" />
                    <span>Express 30-min farm fresh delivery</span>
                  </div>
                  <div className="perk-item">
                    <ShieldCheck size={15} className="text-green-500 perk-icon" />
                    <span>Safe & secure contactless payment</span>
                  </div>
                  <div className="perk-item">
                    <Sparkles size={15} className="text-yellow-500 perk-icon" />
                    <span>100% natural, hygienic & washed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
