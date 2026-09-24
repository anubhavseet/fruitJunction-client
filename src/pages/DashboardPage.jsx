import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  GET_MY_ORDERS,
  GET_MY_ADDRESSES,
  ADD_ADDRESS_MUTATION,
  REMOVE_ADDRESS_MUTATION,
} from '../lib/graphql/queries';
import { toast } from 'sonner';
import {
  Package,
  MapPin,
  User as UserIcon,
  ShoppingBag,
  Trash2,
  Plus,
  ArrowRight,
  Shield,
} from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  const { data: ordersData, loading: loadingOrders } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: 'network-only',
  });
  const orders = ordersData?.myOrders || [];

  const { data: addressData, refetch: refetchAddresses } = useQuery(GET_MY_ADDRESSES, {
    fetchPolicy: 'network-only',
  });
  const addresses = addressData?.myAddresses || [];

  const [addAddressMutation] = useMutation(ADD_ADDRESS_MUTATION);
  const [removeAddressMutation] = useMutation(REMOVE_ADDRESS_MUTATION);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddressMutation({
        variables: { input: newAddress },
      });
      toast.success('Address added successfully');
      setShowAddModal(false);
      setNewAddress({
        label: 'Home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      refetchAddresses();
    } catch (err) {
      toast.error(err?.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await removeAddressMutation({
        variables: { addressId },
      });
      toast.success('Address deleted');
      refetchAddresses();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete address');
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PREPARING':
        return 'status-preparing';
      case 'OUT_FOR_DELIVERY':
        return 'status-out_for_delivery';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      <Header />

      <main className="dashboard-main-content">
        {/* User Card */}
        <div className="dashboard-user-card">
          <div className="user-profile-left">
            <div className="user-avatar-lg">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="user-text-info">
              <h1>Welcome, {user?.name || 'Customer'}!</h1>
              <p>{user?.email} • +91 {user?.phoneNumber}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f97316',
                  color: '#fff',
                  fontWeight: '700',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                <Shield size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <Link
              to="/#products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #ffcd05, #fcb424)',
                color: '#0a0500',
                fontWeight: '700',
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              <ShoppingBag size={16} />
              <span>Order Fresh Fruits</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs-bar">
          <button
            className={`dashboard-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            className={`dashboard-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={18} />
            <span>Saved Addresses ({addresses.length})</span>
          </button>
          <button
            className={`dashboard-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon size={18} />
            <span>Profile Details</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            {loadingOrders ? (
              <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                Loading your orders...
              </p>
            ) : orders.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '3.5rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🥗</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  No orders yet!
                </h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  You haven't placed any fruit or salad orders yet. Order now for fresh delivery in 30 mins!
                </p>
                <Link
                  to="/#products"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #ffcd05, #fcb424)',
                    color: '#0a0500',
                    fontWeight: '700',
                    padding: '0.75rem 1.75rem',
                    borderRadius: '24px',
                    textDecoration: 'none',
                  }}
                >
                  <span>Explore Menu</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="orders-list-stack">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id-group">
                        <span className="order-id-txt">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="order-date-txt">
                          • {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                            color: order.paymentStatus === 'PAID' ? '#15803d' : '#b45309',
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="order-items-table">
                      {order.items?.map((item) => (
                        <div key={item.id} className="order-item-row">
                          <div>
                            <span className="order-item-title">{item.productName}</span>
                            <span className="order-item-quant"> × {item.quantity}</span>
                          </div>
                          <span className="order-item-price">
                            ₹{(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <span className="order-footer-address">
                        📍 {order.deliveryAddress}
                      </span>
                      <span className="order-footer-total">
                        Total: ₹{Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Your Saved Addresses</h2>
              <button
                onClick={() => setShowAddModal(!showAddModal)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                }}
              >
                <Plus size={16} />
                <span>{showAddModal ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {showAddModal && (
              <form
                onSubmit={handleCreateAddress}
                style={{
                  background: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '18px',
                  marginBottom: '1.5rem',
                  border: '1px solid #eee',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      Label
                    </label>
                    <input
                      type="text"
                      placeholder="Home / Work"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      Pincode
                    </label>
                    <input
                      type="text"
                      placeholder="110001"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      placeholder="Flat, building, street..."
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Landmark..."
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New Delhi"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="Delhi"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    marginTop: '1rem',
                    background: 'linear-gradient(135deg, #ffcd05, #fcb424)',
                    color: '#000',
                    fontWeight: '700',
                    border: 'none',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Save Address
                </button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: '#1a1a1a' }}>📍 {addr.label}</span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                      title="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p style={{ color: '#555', fontSize: '0.88rem', lineHeight: '1.4' }}>
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '600px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem' }}>Account Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#777', marginBottom: '4px' }}>Full Name</label>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#222' }}>{user?.name}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#777', marginBottom: '4px' }}>Email Address</label>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#222' }}>{user?.email}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#777', marginBottom: '4px' }}>Phone Number</label>
                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#222' }}>+91 {user?.phoneNumber}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#777', marginBottom: '4px' }}>Role</label>
                <span style={{
                  background: 'rgba(252, 180, 36, 0.15)',
                  color: '#b87a00',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
