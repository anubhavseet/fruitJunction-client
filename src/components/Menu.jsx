import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useBackground } from '../context/BackgroundContext';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(0);
  const [sectionRef, isVisible] = useScrollAnimation({ threshold: 0.1, once: true });
  const { currentBackground } = useBackground();
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (item) => {
    await addToCart(item.id, 1);
    navigate('/menu', { state: { justAdded: item.name } });
  };

  const categories = [
    {
      id: 1,
      name: 'All Items',
      icon: '🍎',
      items: [
        { id: 5, name: 'Creamy Fruit Bowl Deluxe', price: 249, image: '/images/products/creamy_fruit_bowl.png' },
        { id: 1, name: 'Cream Chia Paneer Salad', price: 199, image: '/images/products/paneer_salad.png' },
        { id: 2, name: 'High Protein Rajma Salad', price: 289, image: '/images/products/paneer_salad.png' },
        { id: 3, name: 'Lettuce Paprika Paneer Salad', price: 349, image: '/images/products/paneer_salad.png' },
        { id: 4, name: 'Paneer Protein Salad Classic', price: 189, image: '/images/products/paneer_salad.png' },
        { id: 9, name: 'Loki Mint Detox Juice – 300 ML', price: 99, image: '/images/products/green_detox_juice.png' },
        { id: 13, name: 'Pure Cold Pressed Orange Juice', price: 129, image: '/images/products/orange_juice.png' },
        { id: 10, name: 'Amla Anar Detox Juice – 300 ML', price: 129, image: '/images/products/green_detox_juice.png' },
      ]
    },
    {
      id: 2,
      name: 'Fresh Mixed Fruit Salad',
      icon: '🍓',
      items: [
        { id: 5, name: 'Creamy Fruit Bowl Deluxe', price: 249, image: '/images/products/creamy_fruit_bowl.png' },
        { id: 6, name: 'Exotic Fruit Mix Bowl', price: 219, image: '/images/products/fruit_salad_classic.png' },
        { id: 7, name: 'Tropical Mango Fruit Bowl', price: 209, image: '/images/products/tropical_fruit_bowl.png' },
        { id: 8, name: 'Seasonal Citrus Bowl', price: 179, image: '/images/products/seasonal_fruit_mix.png' },
      ]
    },
    {
      id: 3,
      name: 'Paneer Protein Salad',
      icon: '🥗',
      items: [
        { id: 1, name: 'Cream Chia Paneer Salad', price: 199, image: '/images/products/paneer_salad.png' },
        { id: 2, name: 'High Protein Rajma Salad', price: 289, image: '/images/products/paneer_salad.png' },
        { id: 3, name: 'Lettuce Paprika Paneer Salad', price: 349, image: '/images/products/paneer_salad.png' },
        { id: 4, name: 'Paneer Protein Salad Classic', price: 189, image: '/images/products/paneer_salad.png' },
      ]
    },
    {
      id: 4,
      name: 'Fresh Fruit Juices',
      icon: '🧃',
      items: [
        { id: 13, name: 'Pure Cold Pressed Orange Juice', price: 129, image: '/images/products/orange_juice.png' },
        { id: 14, name: 'Watermelon Fresh Juice – 300 ML', price: 99, image: '/images/products/watermelon_juice.png' },
        { id: 15, name: 'Fresh Pomegranate Juice – 300 ML', price: 149, image: '/images/products/pomegranate_juice.png' },
      ]
    },
    {
      id: 5,
      name: 'Fresh Fruit Smoothies',
      icon: '🥤',
      items: [
        { id: 16, name: 'Wild Berry Blast Smoothie', price: 159, image: '/images/products/berry_smoothie.png' },
        { id: 17, name: 'Alphonso Mango Smoothie', price: 149, image: '/images/products/mango_smoothie.png' },
        { id: 18, name: 'Green Energy Avocado Smoothie', price: 179, image: '/images/products/green_detox_juice.png' },
      ]
    },
    {
      id: 6,
      name: 'Healthy Detox Juices',
      icon: '🥬',
      items: [
        { id: 9, name: 'Loki Mint Detox Juice – 300 ML', price: 99, image: '/images/products/green_detox_juice.png' },
        { id: 10, name: 'Amla Anar Detox Juice – 300 ML', price: 129, image: '/images/products/green_detox_juice.png' },
        { id: 11, name: 'Lemon Mint Green Cooler – 300 ML', price: 89, image: '/images/products/orange_juice.png' },
        { id: 12, name: 'Carrot Beet Ginger Detox – 300 ML', price: 119, image: '/images/products/pomegranate_juice.png' },
      ]
    },
  ];

  return (
    <section
      id="menu"
      className="menu-section"
      ref={sectionRef}
      style={{
        background: `linear-gradient(135deg, ${currentBackground.colors[0]}dd, ${currentBackground.colors[2]}dd)`,
        transition: 'background 1.5s ease-in-out'
      }}
    >
      <div className="container">
        <div className={`section-header fade-in-up ${isVisible ? 'animate-on-scroll' : ''}`}>
          <div className="section-title-wrapper">
            <span className="section-label">Browse Menu</span>
            <h2 className="section-title animated-title">
              <span className="title-line">Every Bite,</span>
              <span className="title-line highlight">A Delicious Choice!</span>
            </h2>
          </div>
          <p className="section-subtitle">
            Explore our complete menu with fresh, healthy options for every taste
          </p>
        </div>

        <div className="menu-categories">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className={`menu-category-btn ${activeCategory === index ? 'active' : ''} fade-in-up ${isVisible ? 'animate-on-scroll' : ''}`}
              onClick={() => setActiveCategory(index)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="menu-items-grid">
          {categories[activeCategory].items.map((item, index) => (
            <div
              key={item.id}
              className={`menu-item-card fade-in-up ${isVisible ? 'animate-on-scroll' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="menu-item-image">
                <Link to={`/product/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src={item.image} alt={item.name} loading="lazy" />
                </Link>
                <div className="menu-item-overlay">
                  <button className="menu-quick-view" onClick={() => navigate(`/product/${item.id}`)}>
                    Quick View
                  </button>
                </div>
              </div>
              <div className="menu-item-info">
                <h3 className="menu-item-name">
                  <Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {item.name}
                  </Link>
                </h3>
                <div className="menu-item-footer">
                  <span className="menu-item-price">₹{item.price}</span>
                  <button
                    className="menu-add-btn"
                    onClick={() => handleAddToCart(item)}
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link
            to="/menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '0.9rem 2.2rem',
              borderRadius: '9999px',
              fontWeight: '700',
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(16, 185, 129, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.4)';
            }}
          >
            <span>Explore Complete Menu & Search All Flavors</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Menu;

