import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GET_ORDER } from '../lib/graphql/queries';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle2, Clock, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import './CartPage.css';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { data, loading } = useQuery(GET_ORDER, {
    variables: { id },
    fetchPolicy: 'network-only',
  });

  const order = data?.order;

  return (
    <div className="cart-page-wrapper">
      <Header />

      <main className="cart-main-content">
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '3rem 2rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={72} color="#22c55e" />
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1a1a1a', marginBottom: '0.5rem' }}>
              Order Confirmed!
            </h1>
            <p style={{ color: '#666', fontSize: '1.05rem', marginBottom: '1.75rem' }}>
              Thank you for choosing Fruit Junction! Your nutritious fruits and bowls are being prepared.
            </p>

            {loading ? (
              <p style={{ color: '#888' }}>Loading order details...</p>
            ) : order ? (
              <div style={{ textAlign: 'left', background: '#fafafa', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#777', fontSize: '0.9rem' }}>Order Number</span>
                  <span style={{ fontWeight: '700', color: '#222', fontSize: '0.9rem' }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#777', fontSize: '0.9rem' }}>Order Status</span>
                  <span style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '2px 10px',
                    borderRadius: '8px',
                    textTransform: 'uppercase'
                  }}>
                    {order.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#777', fontSize: '0.9rem' }}>Payment Status</span>
                  <span style={{
                    background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                    color: order.paymentStatus === 'PAID' ? '#15803d' : '#b45309',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '2px 10px',
                    borderRadius: '8px',
                    textTransform: 'uppercase'
                  }}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#777', fontSize: '0.9rem' }}>Total Amount</span>
                  <span style={{ fontWeight: '800', color: '#1a1a1a', fontSize: '1.1rem' }}>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="#fcb424" /> Delivery Address:
                  </p>
                  <p style={{ color: '#333', fontSize: '0.88rem', fontWeight: '500' }}>
                    {order.deliveryAddress}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                  <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#fcb424" /> Estimated Delivery:
                  </p>
                  <p style={{ color: '#15803d', fontSize: '0.95rem', fontWeight: '700' }}>
                    ⚡ Within 30 to 45 minutes
                  </p>
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/dashboard"
                style={{
                  background: 'linear-gradient(135deg, #ffcd05, #fcb424)',
                  color: '#0a0500',
                  fontWeight: '700',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>Track Orders in Dashboard</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/"
                style={{
                  color: '#555',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  padding: '0.5rem',
                }}
              >
                Back to Home Page
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
