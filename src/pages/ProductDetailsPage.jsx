import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCT, GET_PRODUCTS } from '../lib/graphql/queries';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ShoppingBag,
  Zap,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import './ProductDetailsPage.css';

// Fallback catalog for product details
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Cream Chia Paneer Salad',
    description: 'Nutritious fresh paneer tossed with nutrient-rich chia seeds, bell peppers, fresh cucumber and mild dressings. Packed with 28g natural protein.',
    price: 249,
    salePrice: 199,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 2,
    name: 'High Protein Rajma Salad (250 Gms)',
    description: 'Wholesome red kidney beans mixed with sweet corn, onions, capsicum and zesty lemon herb dressing. Ideal meal replacement for fitness enthusiasts.',
    price: 349,
    salePrice: 289,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 3,
    name: 'Lettuce Paprika Paneer Salad',
    description: 'Crunchy iceberg lettuce topped with marinated paprika grilled cottage cheese cubes, black olives, and olive oil vinaigrette.',
    price: 499,
    salePrice: 349,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 4,
    name: 'Paneer Protein Salad Classic',
    description: 'Fresh malai paneer with diced tomatoes, English cucumbers, mint sprigs and a pinch of roasted cumin.',
    price: 239,
    salePrice: 189,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 5,
    name: 'Creamy Fruit Bowl Deluxe',
    description: 'A vibrant medley of seasonal fresh fruits with light honey-yogurt and pomegranate seeds. High in vitamins, low in calories.',
    price: 299,
    salePrice: 249,
    category: 'Fresh Mixed Fruit Salad',
    imageUrl: '/images/products/creamy_fruit_bowl.png',
    inStock: true,
  },
  {
    id: 6,
    name: 'Exotic Fruit Mix Bowl',
    description: 'Hand-picked kiwi, dragon fruit, blueberries, red grapes, and crisp Washington apples with chia seed toppings.',
    price: 279,
    salePrice: 219,
    category: 'Fresh Mixed Fruit Salad',
    imageUrl: '/images/products/fruit_salad_classic.png',
    inStock: true,
  },
  {
    id: 9,
    name: 'Loki Mint Detox Juice – 300 ML',
    description: 'Cold-pressed bottle gourd infused with garden fresh mint, ginger, and lemon for natural cleansing and rapid hydration.',
    price: 129,
    salePrice: 99,
    category: 'Healthy Detox Juices',
    imageUrl: '/images/products/green_detox_juice.png',
    inStock: true,
  },
  {
    id: 13,
    name: 'Pure Cold Pressed Orange Juice',
    description: '100% natural, freshly squeezed Nagpur oranges with natural pulp. No added sugar or artificial preservatives.',
    price: 149,
    salePrice: 129,
    category: 'Fresh Fruit Juices',
    imageUrl: '/images/products/orange_juice.png',
    inStock: true,
  },
  {
    id: 16,
    name: 'Wild Berry Blast Smoothie',
    description: 'Strawberries, blueberries, cranberries blended with rich Greek yogurt and wildflower honey.',
    price: 189,
    salePrice: 159,
    category: 'Fresh Fruit Smoothies',
    imageUrl: '/images/products/berry_smoothie.png',
    inStock: true,
  },
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Fetch product from GraphQL
  const { data, loading: productLoading } = useQuery(GET_PRODUCT, {
    variables: { id: id ? id.toString() : '1' },
    fetchPolicy: 'cache-and-network',
  });

  // Fetch all products for related items
  const { data: allProductsData } = useQuery(GET_PRODUCTS);

  const fallback = FALLBACK_PRODUCTS.find((p) => p.id.toString() === id?.toString()) || FALLBACK_PRODUCTS[0];
  const product = data?.product || fallback;

  const allProducts = allProductsData?.products && allProductsData.products.length > 0
    ? allProductsData.products
    : FALLBACK_PRODUCTS;

  // Filter related products (same category, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id.toString() !== product.id.toString())
    .slice(0, 3);

  const effectivePrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      navigate('/checkout');
    }
  };

  return (
    <div className="product-details-page-wrapper">
      <Header />

      <main className="product-details-main">
        {/* Breadcrumb Navigation */}
        <nav className="details-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/menu">Menu</Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="breadcrumb-active">{product.name}</span>
        </nav>

        {/* 2-Column Product Layout */}
        <div className="product-details-grid">
          {/* Left: Product Image Box */}
          <div className="details-image-card">
            <div className="details-badges-row">
              <span className="badge-instock">
                {product.inStock ? '● In Stock' : '○ Out of Stock'}
              </span>
              {hasDiscount && (
                <span className="badge-discount-lg">{discountPercent}% OFF</span>
              )}
            </div>

            <div className="details-image-display">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="details-main-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span style="font-size: 6rem">🍊</span>';
                  }}
                />
              ) : (
                <span style={{ fontSize: '6rem' }}>🥗</span>
              )}
            </div>

            {/* Freshness & Trust Badges */}
            <div className="freshness-perks-row">
              <div className="freshness-perk-box">
                <Leaf size={20} color="#16a34a" />
                <strong>100% Organic</strong>
                <span>Direct from farms</span>
              </div>
              <div className="freshness-perk-box">
                <Truck size={20} color="#f59e0b" />
                <strong>30 Mins</strong>
                <span>Cold chain delivery</span>
              </div>
              <div className="freshness-perk-box">
                <ShieldCheck size={20} color="#3b82f6" />
                <strong>Hygienic</strong>
                <span>Triple ozonated wash</span>
              </div>
            </div>
          </div>

          {/* Right: Information & Actions */}
          <div className="details-info-col">
            <span className="details-category-pill">{product.category}</span>
            <h1 className="details-title">{product.name}</h1>

            <div className="details-rating-row">
              <span className="star-rating">
                <Star size={16} fill="#f59e0b" /> 4.9
              </span>
              <span className="review-count-text">• 140+ verified customer reviews</span>
            </div>

            {/* Pricing Box */}
            <div className="details-price-box">
              <span className="details-current-price">₹{effectivePrice}</span>
              {hasDiscount && (
                <>
                  <span className="details-original-price">₹{product.price}</span>
                  <span className="details-savings-badge">
                    Save ₹{product.price - product.salePrice}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="details-desc-text">
              {product.description ||
                'Prepared fresh daily upon receiving your order. We select premium grade ingredients with high nutritional density to fuel your active lifestyle.'}
            </p>

            {/* Nutrition & Health Highlights */}
            <div className="nutrition-tags-grid">
              <span className="nutrition-tag">
                <Sparkles size={14} color="#f59e0b" /> High Fiber
              </span>
              <span className="nutrition-tag">
                <Leaf size={14} color="#16a34a" /> Zero Added Sugar
              </span>
              <span className="nutrition-tag">
                <ShieldCheck size={14} color="#3b82f6" /> Immunity Booster
              </span>
              <span className="nutrition-tag">
                <Zap size={14} color="#dc2626" /> Rich Antioxidants
              </span>
            </div>

            {/* Quantity Selector & Actions */}
            <div className="details-action-section">
              <div className="details-qty-row">
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>
                  Quantity:
                </span>
                <div className="details-qty-picker">
                  <button
                    className="details-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="details-qty-num">{quantity}</span>
                  <button
                    className="details-qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Subtotal: <strong>₹{(effectivePrice * quantity).toFixed(2)}</strong>
                </span>
              </div>

              <div className="details-buttons-stack">
                <button
                  className="btn-details-add-cart"
                  onClick={handleAddToCart}
                  disabled={cartLoading || !product.inStock}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  className="btn-details-buy-now"
                  onClick={handleBuyNow}
                  disabled={cartLoading || !product.inStock}
                >
                  <Zap size={18} />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-section-title">You Might Also Love</h2>
            <div className="menu-products-grid">
              {relatedProducts.map((item) => (
                <div key={item.id} className="menu-card">
                  <div className="menu-card-image-box">
                    <span className="menu-card-badge-category">{item.category}</span>
                    <Link to={`/product/${item.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="menu-card-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="menu-card-fallback-icon">🥗</span>';
                          }}
                        />
                      ) : (
                        <span className="menu-card-fallback-icon">🍊</span>
                      )}
                    </Link>
                  </div>
                  <div className="menu-card-body">
                    <h3 className="menu-card-title">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h3>
                    <div className="menu-card-price-row">
                      <span className="menu-card-sale-price">₹{item.salePrice ?? item.price}</span>
                      {item.salePrice && (
                        <span className="menu-card-regular-price">₹{item.price}</span>
                      )}
                    </div>
                    <Link
                      to={`/product/${item.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        background: '#f1f5f9',
                        color: '#0f172a',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        padding: '0.65rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span>View Details</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
