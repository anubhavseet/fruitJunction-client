import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '../context/AuthContext';
import {
  GET_DASHBOARD_STATS,
  GET_ALL_ORDERS,
  GET_ALL_USERS,
  GET_ALL_PAYMENTS,
  GET_PRODUCTS,
  UPDATE_ORDER_STATUS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  GET_PRESIGNED_UPLOAD_URL,
} from '../lib/graphql/queries';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Upload,
  ExternalLink,
  LogOut,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: statsData, refetch: refetchStats } = useQuery(GET_DASHBOARD_STATS);
  const { data: ordersData, refetch: refetchOrders } = useQuery(GET_ALL_ORDERS);
  const { data: usersData } = useQuery(GET_ALL_USERS);
  const { data: paymentsData } = useQuery(GET_ALL_PAYMENTS);
  const { data: productsData, refetch: refetchProducts } = useQuery(GET_PRODUCTS);

  const stats = statsData?.dashboardStats;
  const orders = ordersData?.allOrders || [];
  const users = usersData?.users || [];
  const payments = paymentsData?.allPayments || [];
  const products = productsData?.products || [];

  // Mutations
  const [updateOrderStatusMutation] = useMutation(UPDATE_ORDER_STATUS);
  const [createProductMutation] = useMutation(CREATE_PRODUCT);
  const [updateProductMutation] = useMutation(UPDATE_PRODUCT);
  const [deleteProductMutation] = useMutation(DELETE_PRODUCT);
  const [getPresignedUrlMutation] = useMutation(GET_PRESIGNED_UPLOAD_URL);

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category: 'Fresh Mixed Fruit Salad',
    price: '',
    salePrice: '',
    description: '',
    imageUrl: '',
    inStock: true,
  });

  // Orders Filter
  const [orderFilter, setOrderFilter] = useState('ALL');

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  // Handle Order Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusMutation({
        variables: {
          input: {
            orderId,
            status: newStatus,
          },
        },
      });
      toast.success(`Order #${orderId.slice(0, 6)} updated to ${newStatus}`);
      refetchOrders();
      refetchStats();
    } catch (err) {
      toast.error(err?.message || 'Failed to update order status');
    }
  };

  // Handle S3 Image Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data } = await getPresignedUrlMutation({
        variables: {
          filename: file.name,
          fileType: file.type || 'image/jpeg',
        },
      });

      const { uploadUrl, fileUrl } = data.getPresignedUploadUrl;

      // Upload file directly to S3 if not simulation URL
      if (!uploadUrl.includes('.local')) {
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
      }

      setProductForm((prev) => ({ ...prev, imageUrl: fileUrl }));
      toast.success('Image uploaded to S3 successfully!');
    } catch (err) {
      toast.error('Image upload failed. Using fallback URL.');
      setProductForm((prev) => ({
        ...prev,
        imageUrl: `/images/products/${file.name}`,
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // Save / Update Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast.error('Please enter name, category, and price');
      return;
    }

    try {
      if (productForm.id) {
        // Update
        await updateProductMutation({
          variables: {
            input: {
              id: parseInt(productForm.id, 10),
              name: productForm.name,
              category: productForm.category,
              price: parseFloat(productForm.price),
              salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined,
              description: productForm.description || undefined,
              imageUrl: productForm.imageUrl || undefined,
              inStock: productForm.inStock,
            },
          },
        });
        toast.success('Product updated successfully');
      } else {
        // Create
        await createProductMutation({
          variables: {
            input: {
              name: productForm.name,
              category: productForm.category,
              price: parseFloat(productForm.price),
              salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined,
              description: productForm.description || undefined,
              imageUrl: productForm.imageUrl || undefined,
              inStock: productForm.inStock,
            },
          },
        });
        toast.success('Product created successfully');
      }

      setShowProductModal(false);
      refetchProducts();
      refetchStats();
    } catch (err) {
      toast.error(err?.message || 'Failed to save product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProductMutation({
        variables: { id },
      });
      toast.success('Product deleted');
      refetchProducts();
      refetchStats();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete product');
    }
  };

  const openCreateProduct = () => {
    setProductForm({
      id: null,
      name: '',
      category: 'Fresh Mixed Fruit Salad',
      price: '',
      salePrice: '',
      description: '',
      imageUrl: '',
      inStock: true,
    });
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: prod.price.toString(),
      salePrice: prod.salePrice ? prod.salePrice.toString() : '',
      description: prod.description || '',
      imageUrl: prod.imageUrl || '',
      inStock: prod.inStock,
    });
    setShowProductModal(true);
  };

  return (
    <div className="admin-page-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/images/fruitJunction_logo.png" alt="Logo" className="sidebar-logo-img" />
          <div>
            <h2 className="sidebar-title">
              Fruit Junction <span className="admin-badge">Admin</span>
            </h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Products ({products.length})</span>
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Users ({users.length})</span>
          </button>
          <button
            className={`sidebar-nav-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} />
            <span>Payments ({payments.length})</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="btn-sidebar-store" target="_blank">
            <ExternalLink size={16} />
            <span>View Public Store</span>
          </Link>
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="btn-sidebar-store"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
          </h1>
          <div className="admin-topbar-actions">
            <div className="admin-user-pill">
              <div className="admin-avatar">{user?.name ? user.name[0] : 'A'}</div>
              <span className="admin-name">{user?.name} (Admin)</span>
            </div>
          </div>
        </header>

        <div className="admin-content-inner">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Stat Cards */}
              <div className="stat-cards-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-revenue">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="stat-info-title">Total Revenue</p>
                    <h3 className="stat-info-value">
                      ₹{Number(stats?.totalRevenue || 0).toFixed(2)}
                    </h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-orders">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="stat-info-title">Total Orders</p>
                    <h3 className="stat-info-value">{stats?.totalOrders ?? orders.length}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-pending">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="stat-info-title">Pending Orders</p>
                    <h3 className="stat-info-value">{stats?.pendingOrders ?? 0}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-users">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="stat-info-title">Registered Users</p>
                    <h3 className="stat-info-value">{stats?.activeUsers ?? users.length}</h3>
                  </div>
                </div>
              </div>

              {/* Recent Orders in Overview */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Recent Orders</h3>
                  <button
                    className="btn-admin-primary"
                    onClick={() => setActiveTab('orders')}
                  >
                    View All Orders
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id}>
                          <td>
                            <strong>#{ord.id.slice(0, 8).toUpperCase()}</strong>
                          </td>
                          <td>{ord.user?.name || 'Customer'}</td>
                          <td>₹{Number(ord.totalAmount).toFixed(2)}</td>
                          <td>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: '#fef3c7',
                                color: '#b45309',
                              }}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: ord.paymentStatus === 'PAID' ? '#dcfce7' : '#f1f5f9',
                                color: ord.paymentStatus === 'PAID' ? '#15803d' : '#64748b',
                              }}
                            >
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">Fruit & Salad Catalog</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Manage products, pricing, stock and upload images to AWS S3
                  </p>
                </div>
                <button className="btn-admin-primary" onClick={openCreateProduct}>
                  <Plus size={16} />
                  <span>Add New Product</span>
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Sale Price</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: '#f1f5f9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                🍊
                              </div>
                            )}
                            <strong>{prod.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                            }}
                          >
                            {prod.category}
                          </span>
                        </td>
                        <td>₹{prod.price}</td>
                        <td>{prod.salePrice ? `₹${prod.salePrice}` : '—'}</td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: prod.inStock ? '#dcfce7' : '#fee2e2',
                              color: prod.inStock ? '#15803d' : '#dc2626',
                            }}
                          >
                            {prod.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openEditProduct(prod)}
                              style={{
                                background: '#f1f5f9',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                              title="Edit"
                            >
                              <Edit2 size={16} color="#334155" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              style={{
                                background: '#fee2e2',
                                border: 'none',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">Orders Management</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Track, prepare, and change fulfillment status for customer orders
                  </p>
                </div>
                {/* Filter buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        style={{
                          background: orderFilter === st ? '#0f172a' : '#f1f5f9',
                          color: orderFilter === st ? '#fff' : '#475569',
                          border: 'none',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer & Address</th>
                      <th>Items Ordered</th>
                      <th>Total</th>
                      <th>Change Status</th>
                      <th>Payment</th>
                      <th>Placed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <strong>#{ord.id.slice(0, 8).toUpperCase()}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{ord.user?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '200px' }}>
                            {ord.deliveryAddress}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem' }}>
                            {ord.items?.map((it) => (
                              <div key={it.id}>
                                {it.productName} × {it.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong>₹{Number(ord.totalAmount).toFixed(2)}</strong>
                        </td>
                        <td>
                          <select
                            className="status-select-sm"
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: ord.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7',
                              color: ord.paymentStatus === 'PAID' ? '#15803d' : '#b45309',
                            }}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(ord.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS */}
          {activeTab === 'users' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Registered Users</h3>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId}>
                        <td>
                          <strong>{u.name}</strong>
                        </td>
                        <td>{u.email}</td>
                        <td>+91 {u.phoneNumber}</td>
                        <td>
                          <span
                            style={{
                              background: u.role === 'ADMIN' ? '#fef3c7' : '#f1f5f9',
                              color: u.role === 'ADMIN' ? '#b45309' : '#475569',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: u.isActive ? '#15803d' : '#dc2626', fontWeight: '700' }}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">Razorpay Transactions Audit Log</h3>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Razorpay Order ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                          No payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.razorpayPaymentId || 'PENDING'}</strong>
                          </td>
                          <td style={{ fontFamily: 'monospace' }}>{p.razorpayOrderId}</td>
                          <td>
                            <strong>₹{Number(p.amount).toFixed(2)}</strong> {p.currency}
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                background: p.status === 'PAID' ? '#dcfce7' : '#fee2e2',
                                color: p.status === 'PAID' ? '#15803d' : '#dc2626',
                              }}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {productForm.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowProductModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Exotic Fruit Mix Salad"
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="199"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                      Sale Price (₹) (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                      placeholder="149"
                      style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  >
                    <option value="Fresh Mixed Fruit Salad">Fresh Mixed Fruit Salad</option>
                    <option value="Paneer Based Protein Salad">Paneer Based Protein Salad</option>
                    <option value="Healthy Detox Juices">Healthy Detox Juices</option>
                    <option value="Fresh Fruit Smoothies">Fresh Fruit Smoothies</option>
                  </select>
                </div>

                {/* S3 Image Upload Dropzone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                    Upload Product Image to S3
                  </label>
                  <label className="image-upload-dropzone" style={{ display: 'block' }}>
                    <Upload size={24} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem' }}>
                      {isUploading ? 'Uploading to S3...' : 'Click to select & upload image'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG or WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                      disabled={isUploading}
                    />
                  </label>

                  {productForm.imageUrl && (
                    <div className="image-preview-box">
                      <img
                        src={productForm.imageUrl}
                        alt="Preview"
                        className="image-preview-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Freshly cut dragon fruit, kiwi, blueberries..."
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="stockCheck"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  />
                  <label htmlFor="stockCheck" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Product in stock and available for sale
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={isUploading}
                >
                  {productForm.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
