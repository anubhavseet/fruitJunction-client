import { useNavigate, Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useBackground } from '../context/BackgroundContext';
import { useCart } from '../context/CartContext';

const Products = () => {
  const navigate = useNavigate();
  const [offersRef, offersVisible] = useScrollAnimation({ threshold: 0.1, once: true });
  const [popularRef, popularVisible] = useScrollAnimation({ threshold: 0.1, once: true });
  const { currentBackground } = useBackground();
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (product) => {
    await addToCart(product.id, 1);
    navigate('/menu', { state: { justAdded: product.name } });
  };

  const specialOffers = [
    {
      id: 1,
      name: 'Cream Chia Paneer Salad',
      originalPrice: 249,
      salePrice: 199,
      category: 'Paneer Based Protein Salad',
      image: '/images/products/paneer_salad.png',
      onSale: true
    },
    {
      id: 2,
      name: 'High Protein Rajma Salad (250 Gms)',
      originalPrice: 349,
      salePrice: 289,
      category: 'Paneer Based Protein Salad',
      image: '/images/products/paneer_salad.png',
      onSale: true
    },
    {
      id: 3,
      name: 'Lettuce Paprika Paneer Salad',
      originalPrice: 499,
      salePrice: 349,
      category: 'Paneer Based Protein Salad',
      image: '/images/products/paneer_salad.png',
      onSale: true
    },
    {
      id: 4,
      name: 'Paneer Protein Salad Classic',
      originalPrice: 239,
      salePrice: 189,
      category: 'Paneer Based Protein Salad',
      image: '/images/products/paneer_salad.png',
      onSale: true
    },
  ];

  const popularProducts = [
    {
      id: 5,
      name: 'Creamy Fruit Bowl Deluxe',
      price: 249,
      category: 'Fresh Mixed Fruit Salad',
      image: '/images/products/creamy_fruit_bowl.png'
    },
    {
      id: 9,
      name: 'Loki Mint Detox Juice – 300 ML',
      price: 99,
      category: 'Healthy Detox Juices',
      image: '/images/products/green_detox_juice.png'
    },
    {
      id: 13,
      name: 'Pure Cold Pressed Orange Juice',
      price: 129,
      category: 'Fresh Fruit Juices',
      image: '/images/products/orange_juice.png'
    },
    {
      id: 10,
      name: 'Amla Anar Detox Juice – 300 ML',
      price: 129,
      category: 'Healthy Detox Juices',
      image: '/images/products/green_detox_juice.png'
    },
  ];

  const ProductCard = ({ product, isSpecialOffer = false, index = 0, isVisible = false }) => (
    <div
      className={`product-card ${isSpecialOffer ? 'special-offer' : ''}`}
    >
      {product.onSale && (
        <span className="sale-badge">SALE</span>
      )}
      <div className="product-image">
        <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        </Link>
        <div className="product-image-overlay">
          <button
            className="quick-view-btn"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            Quick View
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {product.name}
          </Link>
        </h3>
        <p className="product-category">{product.category}</p>
        <div className="product-price">
          {product.onSale ? (
            <>
              <span className="original-price">₹{product.originalPrice}</span>
              <span className="sale-price">₹{product.salePrice}</span>
            </>
          ) : (
            <span className="current-price">₹{product.price}</span>
          )}
        </div>
        <button
          className="add-to-cart-btn"
          onClick={() => handleAddToCart(product)}
          disabled={loading}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="products-section">
      {/* Special Offers */}
      <section
        className="special-offers"
        ref={offersRef}
        style={{
          background: `linear-gradient(135deg, ${currentBackground.colors[0]}dd, ${currentBackground.colors[1]}dd)`,
          transition: 'background 1.5s ease-in-out'
        }}
      >
        <div className="container">
          <div className={`section-header fade-in-up ${offersVisible ? 'animate-on-scroll' : ''}`}>
            <div className="section-title-wrapper">
              <span className="section-label">Limited Time</span>
              <h2 className="section-title animated-title">
                <span className="title-line">Taste the Savings,</span>
                <span className="title-line highlight">Feel the Freshness!</span>
              </h2>
            </div>
            <p className="section-subtitle">
              Looking for the perfect Diet Food or a quick Weight Loss Meal?
              Our special offers make healthy eating affordable!
            </p>
          </div>

          <div className="products-grid">
            {specialOffers.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isSpecialOffer
                index={index}
                isVisible={offersVisible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section
        className="popular-products"
        ref={popularRef}
        style={{
          background: `linear-gradient(135deg, ${currentBackground.colors[1]}dd, ${currentBackground.colors[2]}dd)`,
          transition: 'background 1.5s ease-in-out'
        }}
      >
        <div className="container">
          <div className={`section-header fade-in-up ${popularVisible ? 'animate-on-scroll' : ''}`}>
            <div className="section-title-wrapper">
              <span className="section-label">Customer Favorites</span>
              <h2 className="section-title animated-title">
                <span className="title-line">Loved by Many,</span>
                <span className="title-line highlight">Chosen by You!</span>
              </h2>
            </div>
            <p className="section-subtitle">
              Top picks for every day — from fruit bowls to refreshing sips,
              enjoy our best-selling flavors full of freshness and goodness.
            </p>
          </div>

          <div className="products-grid">
            {popularProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isVisible={popularVisible}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
