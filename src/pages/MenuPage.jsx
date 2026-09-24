import { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS } from '../lib/graphql/queries';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowRight,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import './MenuPage.css';

// Fallback products in case GraphQL server is spinning up or offline
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Cream Chia Paneer Salad',
    description: 'Nutritious fresh paneer tossed with nutrient-rich chia seeds, bell peppers and mild dressings.',
    price: 249,
    salePrice: 199,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 2,
    name: 'High Protein Rajma Salad (250 Gms)',
    description: 'Wholesome red kidney beans mixed with sweet corn, onions, capsicum and zesty lemon herb dressing.',
    price: 349,
    salePrice: 289,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 3,
    name: 'Lettuce Paprika Paneer Salad',
    description: 'Crunchy iceberg lettuce topped with marinated paprika grilled cottage cheese cubes and olives.',
    price: 499,
    salePrice: 349,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 4,
    name: 'Paneer Protein Salad Classic',
    description: 'Fresh malai paneer with diced tomatoes, English cucumbers and a pinch of roasted cumin.',
    price: 239,
    salePrice: 189,
    category: 'Paneer Based Protein Salad',
    imageUrl: '/images/products/paneer_salad.png',
    inStock: true,
  },
  {
    id: 5,
    name: 'Creamy Fruit Bowl Deluxe',
    description: 'A vibrant medley of seasonal fresh fruits with light honey-yogurt and pomegranate seeds.',
    price: 299,
    salePrice: 249,
    category: 'Fresh Mixed Fruit Salad',
    imageUrl: '/images/products/creamy_fruit_bowl.png',
    inStock: true,
  },
  {
    id: 6,
    name: 'Exotic Fruit Mix Bowl',
    description: 'Hand-picked kiwi, dragon fruit, blueberries, red grapes, and crisp Washington apples.',
    price: 279,
    salePrice: 219,
    category: 'Fresh Mixed Fruit Salad',
    imageUrl: '/images/products/fruit_salad_classic.png',
    inStock: true,
  },
  {
    id: 7,
    name: 'Tropical Mango Fruit Bowl',
    description: 'Freshly diced Alphonso mangoes, pineapple slices, ripe papaya and roasted chia sprinkles.',
    price: 259,
    salePrice: 209,
    category: 'Fresh Mixed Fruit Salad',
    imageUrl: '/images/products/tropical_fruit_bowl.png',
    inStock: true,
  },
  {
    id: 8,
    name: 'Seasonal Citrus Bowl',
    description: 'Refreshing sweet lime segments, Nagpur oranges, mint leaves, and a dash of black salt.',
    price: 219,
    salePrice: 179,
    category: 'Fresh Mixed Fruit Salad',
    imageUrl: '/images/products/seasonal_fruit_mix.png',
    inStock: true,
  },
  {
    id: 9,
    name: 'Loki Mint Detox Juice – 300 ML',
    description: 'Cold-pressed bottle gourd infused with garden fresh mint, ginger, and lemon for natural cleansing.',
    price: 129,
    salePrice: 99,
    category: 'Healthy Detox Juices',
    imageUrl: '/images/products/green_detox_juice.png',
    inStock: true,
  },
  {
    id: 10,
    name: 'Amla Anar Detox Juice – 300 ML',
    description: 'Immunity-boosting Indian gooseberry paired with antioxidant-rich pomegranate juice.',
    price: 149,
    salePrice: 129,
    category: 'Healthy Detox Juices',
    imageUrl: '/images/products/green_detox_juice.png',
    inStock: true,
  },
  {
    id: 11,
    name: 'Lemon Mint Green Cooler – 300 ML',
    description: 'Zesty organic lemon juice cold-blended with peppermint, cucumber, and pink Himalayan salt.',
    price: 109,
    salePrice: 89,
    category: 'Healthy Detox Juices',
    imageUrl: '/images/products/orange_juice.png',
    inStock: true,
  },
  {
    id: 12,
    name: 'Carrot Beet Ginger Detox – 300 ML',
    description: 'Root vegetable booster with fresh carrots, ruby red beets, and a spicy kick of ginger.',
    price: 139,
    salePrice: 119,
    category: 'Healthy Detox Juices',
    imageUrl: '/images/products/pomegranate_juice.png',
    inStock: true,
  },
  {
    id: 13,
    name: 'Pure Cold Pressed Orange Juice',
    description: '100% natural, freshly squeezed Nagpur oranges with pulp. No added sugar or preservatives.',
    price: 149,
    salePrice: 129,
    category: 'Fresh Fruit Juices',
    imageUrl: '/images/products/orange_juice.png',
    inStock: true,
  },
  {
    id: 14,
    name: 'Watermelon Fresh Juice – 300 ML',
    description: 'Hydrating, naturally sweet Indian watermelons cold pressed fresh on order.',
    price: 119,
    salePrice: 99,
    category: 'Fresh Fruit Juices',
    imageUrl: '/images/products/watermelon_juice.png',
    inStock: true,
  },
  {
    id: 15,
    name: 'Fresh Pomegranate Juice – 300 ML',
    description: 'Ruby red arils pressed pure for heart health and glowing vitality. Zero water added.',
    price: 179,
    salePrice: 149,
    category: 'Fresh Fruit Juices',
    imageUrl: '/images/products/pomegranate_juice.png',
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
  {
    id: 17,
    name: 'Alphonso Mango Smoothie',
    description: 'Velvety mango puree with chilled almond milk, chia seeds, and cardamom essence.',
    price: 179,
    salePrice: 149,
    category: 'Fresh Fruit Smoothies',
    imageUrl: '/images/products/mango_smoothie.png',
    inStock: true,
  },
  {
    id: 18,
    name: 'Green Energy Avocado Smoothie',
    description: 'Hass avocado, baby spinach, green apple, and tender coconut water for sustained vitality.',
    price: 199,
    salePrice: 179,
    category: 'Fresh Fruit Smoothies',
    imageUrl: '/images/products/green_detox_juice.png',
    inStock: true,
  },
];

export default function MenuPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();

  // Notification if user was redirected after adding an item from landing page
  const [justAddedItem, setJustAddedItem] = useState(location.state?.justAdded || null);

  // Clear just-added state from history so page refresh doesn't keep showing it
  useEffect(() => {
    if (location.state?.justAdded) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data, loading: productsLoading } = useQuery(GET_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
  });

  const rawProducts = data?.products && data.products.length > 0 ? data.products : FALLBACK_PRODUCTS;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Local card quantities state
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, delta) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(rawProducts.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [rawProducts]);

  // Filter and Sort logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...rawProducts];

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)),
      );
    }

    // Sorting
    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [rawProducts, selectedCategory, searchQuery, sortBy]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAndSortedProducts.length);
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }
  };

  const handleAddToCart = async (product) => {
    const qty = quantities[product.id] || 1;
    await addToCart(product.id, qty);
    setJustAddedItem(product.name);
  };

  return (
    <div className="menu-page-wrapper">
      <Header />

      <main className="menu-main-content">
        {/* Banner when user adds an item */}
        {justAddedItem && (
          <div className="just-added-banner">
            <div className="just-added-info">
              <CheckCircle2 size={24} color="#059669" />
              <div>
                <strong>"{justAddedItem}"</strong> was added to your cart! Explore more items below or proceed to checkout.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/cart" className="btn-view-cart-banner">
                <span>View Cart & Checkout</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setJustAddedItem(null)}
                style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', padding: '4px' }}
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className="menu-hero-header">
          <h1 className="menu-hero-title">
            Our Fresh & Healthy <span className="highlight">Menu</span>
          </h1>
          <p className="menu-hero-subtitle">
            Hand-crafted fruit bowls, paneer protein salads, and raw cold-pressed juices delivered in 30 minutes across Kolkata.
          </p>
        </div>

        {/* Toolbar: Search, Categories & Sorting */}
        <div className="menu-toolbar">
          {/* Search Bar */}
          <div className="menu-search-wrapper">
            <Search className="search-icon-pos" size={20} />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by fruit, salad name, or ingredient (e.g. Avocado, Mango, Paneer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-clear-search" onClick={() => setSearchQuery('')}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Categories Pills */}
          <div className="menu-categories-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'ALL' ? '🍎 All Items' : cat}
              </button>
            ))}
          </div>

          {/* Sub Toolbar */}
          <div className="menu-sub-toolbar">
            <span className="results-count-badge">
              Showing {filteredAndSortedProducts.length > 0 ? `${startIndex + 1} - ${endIndex}` : '0'} of{' '}
              {filteredAndSortedProducts.length} items
            </span>

            <div className="menu-sort-controls">
              <SlidersHorizontal size={16} color="#64748b" />
              <select
                className="sort-select-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="FEATURED">Featured / Default</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="NAME_ASC">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {currentProducts.length === 0 ? (
          <div className="menu-empty-results">
            <div className="menu-empty-icon">🔍</div>
            <h3>No Products Found</h3>
            <p>We couldn't find any fresh items matching "{searchQuery}". Try searching for another ingredient or reset your filters.</p>
            <button
              className="btn-shop-now"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="menu-products-grid">
            {currentProducts.map((prod) => {
              const effectivePrice = prod.salePrice ?? prod.price;
              const hasDiscount = prod.salePrice && prod.salePrice < prod.price;
              const discountPercent = hasDiscount
                ? Math.round(((prod.price - prod.salePrice) / prod.price) * 100)
                : 0;
              const qty = quantities[prod.id] || 1;

              return (
                <div key={prod.id} className="menu-card">
                  {/* Image & Badges */}
                  <div className="menu-card-image-box">
                    {hasDiscount && (
                      <span className="menu-card-badge-sale">{discountPercent}% OFF</span>
                    )}
                    <span className="menu-card-badge-category">{prod.category}</span>

                    <Link to={`/product/${prod.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="menu-card-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="menu-card-fallback-icon">🍊</span>';
                          }}
                        />
                      ) : (
                        <span className="menu-card-fallback-icon">🥗</span>
                      )}
                    </Link>
                  </div>

                  {/* Body */}
                  <div className="menu-card-body">
                    <h3 className="menu-card-title">
                      <Link to={`/product/${prod.id}`}>{prod.name}</Link>
                    </h3>
                    <p className="menu-card-desc">{prod.description}</p>

                    <div className="menu-card-price-row">
                      <span className="menu-card-sale-price">₹{effectivePrice}</span>
                      {hasDiscount && (
                        <span className="menu-card-regular-price">₹{prod.price}</span>
                      )}
                      {hasDiscount && (
                        <span className="menu-card-discount-tag">Save ₹{prod.price - prod.salePrice}</span>
                      )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="menu-card-actions-row">
                      <div className="menu-card-qty-box">
                        <button
                          className="menu-qty-btn"
                          onClick={() => handleQuantityChange(prod.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="menu-qty-val">{qty}</span>
                        <button
                          className="menu-qty-btn"
                          onClick={() => handleQuantityChange(prod.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        className="btn-menu-add-cart"
                        onClick={() => handleAddToCart(prod)}
                        disabled={cartLoading || !prod.inStock}
                      >
                        <ShoppingBag size={16} />
                        <span>{prod.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="menu-pagination-bar">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              aria-label="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
