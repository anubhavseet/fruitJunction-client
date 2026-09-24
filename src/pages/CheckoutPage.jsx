import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  GET_MY_ADDRESSES,
  ADD_ADDRESS_MUTATION,
  CREATE_ORDER,
  CREATE_PAYMENT_ORDER,
  VERIFY_PAYMENT,
} from '../lib/graphql/queries';
import { toast } from 'sonner';
import {
  MapPin,
  CreditCard,
  Banknote,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import './CheckoutPage.css';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, totalAmount, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: addressData, refetch: refetchAddresses } = useQuery(GET_MY_ADDRESSES);
  const addresses = addressData?.myAddresses || [];

  const [addAddressMutation] = useMutation(ADD_ADDRESS_MUTATION);
  const [createOrderMutation] = useMutation(CREATE_ORDER);
  const [createPaymentOrderMutation] = useMutation(CREATE_PAYMENT_ORDER);
  const [verifyPaymentMutation] = useMutation(VERIFY_PAYMENT);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select default or first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const deliveryFee = totalAmount > 299 || totalAmount === 0 ? 0 : 40;
  const finalTotal = totalAmount + deliveryFee;

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill all required address fields');
      return;
    }
    try {
      const { data } = await addAddressMutation({
        variables: { input: newAddress },
      });
      if (data?.addAddress) {
        toast.success('Address saved successfully');
        setShowNewAddressForm(false);
        setSelectedAddressId(data.addAddress.id);
        refetchAddresses();
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddr) {
      toast.error('Please select or enter a delivery address');
      return;
    }

    const formattedAddress = `${selectedAddr.label}: ${selectedAddr.addressLine1}${
      selectedAddr.addressLine2 ? ', ' + selectedAddr.addressLine2 : ''
    }, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`;

    setIsSubmitting(true);

    try {
      // 1. Create order on backend
      const { data: orderData } = await createOrderMutation({
        variables: {
          input: {
            deliveryAddress: formattedAddress,
            paymentMethod,
            notes: notes || undefined,
          },
        },
      });

      const order = orderData?.createOrder;
      if (!order) throw new Error('Order creation failed');

      // 2. Handle Payment
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        toast.success('Order placed successfully with Cash on Delivery!');
        navigate(`/order-confirmation/${order.id}`);
        return;
      }

      // 3. Online Razorpay payment
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Please try again or choose Cash on Delivery.');
        navigate(`/order-confirmation/${order.id}`);
        return;
      }

      // Generate Razorpay Order
      try {
        const { data: payData } = await createPaymentOrderMutation({
          variables: { orderId: order.id },
        });

        const { razorpayOrderId, amount, currency, keyId } = payData.createPaymentOrder;

        const options = {
          key: keyId || 'rzp_test_placeholder',
          amount: amount,
          currency: currency || 'INR',
          name: 'Fruit Junction',
          description: `Order #${order.id}`,
          image: '/images/fruitJunction_logo.png',
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await verifyPaymentMutation({
                variables: {
                  input: {
                    orderId: order.id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                },
              });
              toast.success('Payment verified successfully!');
              navigate(`/order-confirmation/${order.id}`);
            } catch (err) {
              toast.error('Payment verification failed');
              navigate(`/order-confirmation/${order.id}`);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phoneNumber?.toString(),
          },
          theme: {
            color: '#fcb424',
          },
          modal: {
            ondismiss: () => {
              toast.info('Payment window closed. You can retry from your dashboard.');
              navigate(`/order-confirmation/${order.id}`);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (payErr) {
        // If razorpay credentials are not yet configured on server, graceful fallback
        toast.info('Payment order initialized. Redirecting to confirmation...');
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <Header />

      <main className="checkout-main-content">
        <div className="checkout-header-section">
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Confirm your address and complete your order</p>
        </div>

        <div className="checkout-grid">
          {/* Left Column: Form Steps */}
          <div className="checkout-left-col">
            {/* Step 1: Address */}
            <div className="checkout-step-card">
              <div className="step-card-header">
                <div className="step-number">1</div>
                <h2 className="step-title">Delivery Address</h2>
              </div>

              {addresses.length > 0 && (
                <div className="saved-addresses-grid">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`address-radio-card ${
                        selectedAddressId === addr.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="address-card-top">
                        <span className="address-card-label">📍 {addr.label}</span>
                        {addr.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <p className="address-card-text">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn-toggle-address-form"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
              >
                <Plus size={16} />
                <span>{showNewAddressForm ? 'Cancel New Address' : 'Add New Address'}</span>
              </button>

              {(showNewAddressForm || addresses.length === 0) && (
                <form onSubmit={handleAddNewAddress} className="inline-address-form">
                  <div className="form-group-sm">
                    <label>Address Label</label>
                    <input
                      type="text"
                      placeholder="Home, Office, etc."
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-sm">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      placeholder="110001"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-sm form-full">
                    <label>Flat / House No. / Building / Street *</label>
                    <input
                      type="text"
                      placeholder="House #12, Rose Villa, Street 4"
                      value={newAddress.addressLine1}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, addressLine1: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group-sm form-full">
                    <label>Landmark / Area (Optional)</label>
                    <input
                      type="text"
                      placeholder="Near City Park"
                      value={newAddress.addressLine2}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, addressLine2: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group-sm">
                    <label>City *</label>
                    <input
                      type="text"
                      placeholder="New Delhi"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-sm">
                    <label>State *</label>
                    <input
                      type="text"
                      placeholder="Delhi"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-full">
                    <button type="submit" className="btn-save-address">
                      Save & Use This Address
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="checkout-step-card">
              <div className="step-card-header">
                <div className="step-number">2</div>
                <h2 className="step-title">Payment Method</h2>
              </div>

              <div className="payment-methods-stack">
                <div
                  className={`payment-method-card ${
                    paymentMethod === 'RAZORPAY' ? 'selected' : ''
                  }`}
                  onClick={() => setPaymentMethod('RAZORPAY')}
                >
                  <div className="payment-radio-circle">
                    {paymentMethod === 'RAZORPAY' && <div className="payment-radio-inner" />}
                  </div>
                  <CreditCard size={24} className="text-amber-500" />
                  <div className="payment-info">
                    <p className="payment-title">Online Payment (Razorpay)</p>
                    <p className="payment-desc">UPI, Google Pay, PhonePe, Cards, Net Banking</p>
                  </div>
                </div>

                <div
                  className={`payment-method-card ${
                    paymentMethod === 'CASH_ON_DELIVERY' ? 'selected' : ''
                  }`}
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                >
                  <div className="payment-radio-circle">
                    {paymentMethod === 'CASH_ON_DELIVERY' && (
                      <div className="payment-radio-inner" />
                    )}
                  </div>
                  <Banknote size={24} className="text-green-600" />
                  <div className="payment-info">
                    <p className="payment-title">Cash on Delivery (COD)</p>
                    <p className="payment-desc">Pay cash or scan QR when your order arrives</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Instructions */}
            <div className="checkout-step-card">
              <div className="step-card-header">
                <div className="step-number">3</div>
                <h2 className="step-title">Delivery Instructions (Optional)</h2>
              </div>
              <div className="form-group-sm">
                <textarea
                  rows={2}
                  placeholder="e.g. Ring the bell twice, leave with security guard, extra mint dressing..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-right-col">
            <div className="checkout-summary-card">
              <h2>Order Summary</h2>

              <div className="summary-items-scroll">
                {items.map((item) => (
                  <div key={item.id} className="summary-mini-item">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="mini-item-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="mini-item-img flex items-center justify-center text-lg">
                        🍊
                      </div>
                    )}
                    <div className="mini-item-info">
                      <p className="mini-item-name">{item.product?.name || 'Fruit Item'}</p>
                      <p className="mini-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="mini-item-price">
                      ₹{(item.subtotal || item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
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

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span className="total-label">Total to Pay</span>
                <span className="total-amount-val">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                className="btn-place-order"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0}
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
                <ArrowRight size={18} />
              </button>

              <div className="cart-perks">
                <div className="perk-item">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span>100% Safe & Verified Freshness Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
