import { createContext, useContext, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_CART,
  ADD_TO_CART,
  UPDATE_CART_ITEM,
  REMOVE_CART_ITEM,
  CLEAR_CART,
} from '../lib/graphql/queries';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const {
    data,
    loading,
    refetch: refetchCart,
  } = useQuery(GET_CART, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const [addToCartMutation, { loading: adding }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ query: GET_CART }],
  });

  const [updateCartItemMutation, { loading: updating }] = useMutation(
    UPDATE_CART_ITEM,
    {
      refetchQueries: [{ query: GET_CART }],
    },
  );

  const [removeCartItemMutation, { loading: removing }] = useMutation(
    REMOVE_CART_ITEM,
    {
      refetchQueries: [{ query: GET_CART }],
    },
  );

  const [clearCartMutation, { loading: clearing }] = useMutation(CLEAR_CART, {
    refetchQueries: [{ query: GET_CART }],
  });

  const cart = data?.cart || null;
  const items = cart?.items || [];
  const cartCount = cart?.totalItems ?? items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart?.totalAmount ?? items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to add items to your cart');
        return false;
      }
      try {
        const { data: res } = await addToCartMutation({
          variables: {
            input: {
              productId: parseInt(productId, 10),
              quantity: parseInt(quantity, 10),
            },
          },
        });
        toast.success('Added to cart!');
        return res?.addToCart;
      } catch (err) {
        toast.error(err?.message || 'Failed to add item to cart');
        return false;
      }
    },
    [isAuthenticated, addToCartMutation],
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      try {
        const { data: res } = await updateCartItemMutation({
          variables: {
            input: {
              cartItemId,
              quantity: parseInt(quantity, 10),
            },
          },
        });
        return res?.updateCartItem;
      } catch (err) {
        toast.error(err?.message || 'Failed to update item quantity');
        return false;
      }
    },
    [updateCartItemMutation],
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        const { data: res } = await removeCartItemMutation({
          variables: { cartItemId },
        });
        toast.success('Item removed from cart');
        return res?.removeCartItem;
      } catch (err) {
        toast.error(err?.message || 'Failed to remove item');
        return false;
      }
    },
    [removeCartItemMutation],
  );

  const clearCart = useCallback(async () => {
    try {
      await clearCartMutation();
      toast.success('Cart cleared');
      return true;
    } catch (err) {
      toast.error(err?.message || 'Failed to clear cart');
      return false;
    }
  }, [clearCartMutation]);

  const value = useMemo(
    () => ({
      cart,
      items,
      cartCount,
      totalAmount,
      loading: loading || adding || updating || removing || clearing,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refetchCart,
    }),
    [
      cart,
      items,
      cartCount,
      totalAmount,
      loading,
      adding,
      updating,
      removing,
      clearing,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refetchCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
