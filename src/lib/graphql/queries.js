import { gql } from '@apollo/client';

// ============================================================
// AUTH MUTATIONS
// ============================================================

export const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      user {
        userId
        name
        email
        role
      }
      message
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        userId
        name
        email
        role
      }
      message
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      user {
        userId
        name
        email
        role
      }
      message
    }
  }
`;

// ============================================================
// USER QUERIES
// ============================================================

export const ME_QUERY = gql`
  query Me {
    me {
      userId
      name
      email
      phoneNumber
      role
      isActive
      addresses {
        id
        label
        addressLine1
        addressLine2
        city
        state
        pincode
        isDefault
      }
      createdAt
    }
  }
`;

export const GET_MY_ADDRESSES = gql`
  query GetMyAddresses {
    myAddresses {
      id
      label
      addressLine1
      addressLine2
      city
      state
      pincode
      isDefault
    }
  }
`;

export const ADD_ADDRESS_MUTATION = gql`
  mutation AddAddress($input: CreateAddressInput!) {
    addAddress(input: $input) {
      id
      label
      addressLine1
      addressLine2
      city
      state
      pincode
      isDefault
    }
  }
`;

export const REMOVE_ADDRESS_MUTATION = gql`
  mutation RemoveAddress($addressId: String!) {
    removeAddress(addressId: $addressId)
  }
`;

// ============================================================
// PRODUCT QUERIES
// ============================================================

export const GET_PRODUCTS = gql`
  query GetProducts($category: String) {
    products(category: $category) {
      id
      name
      description
      price
      salePrice
      category
      imageUrl
      inStock
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      salePrice
      category
      imageUrl
      inStock
      createdAt
      updatedAt
    }
  }
`;

// ============================================================
// CART QUERIES & MUTATIONS
// ============================================================

export const GET_CART = gql`
  query GetCart {
    cart {
      id
      totalAmount
      totalItems
      items {
        id
        quantity
        price
        subtotal
        product {
          id
          name
          imageUrl
          price
          salePrice
          inStock
          category
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      totalAmount
      totalItems
      items {
        id
        quantity
        price
        subtotal
        product {
          id
          name
          imageUrl
          price
          salePrice
          inStock
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      id
      totalAmount
      totalItems
      items {
        id
        quantity
        price
        subtotal
        product {
          id
          name
          imageUrl
          price
          salePrice
        }
      }
    }
  }
`;

export const REMOVE_CART_ITEM = gql`
  mutation RemoveCartItem($cartItemId: ID!) {
    removeCartItem(cartItemId: $cartItemId) {
      id
      totalAmount
      totalItems
      items {
        id
        quantity
        price
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
      id
      totalAmount
      totalItems
      items {
        id
      }
    }
  }
`;

// ============================================================
// ORDER QUERIES & MUTATIONS
// ============================================================

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalAmount
      paymentStatus
      deliveryAddress
      createdAt
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      status
      totalAmount
      paymentStatus
      deliveryAddress
      createdAt
      items {
        id
        productName
        quantity
        unitPrice
        subtotal
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: String!) {
    order(id: $id) {
      id
      status
      totalAmount
      paymentStatus
      deliveryAddress
      notes
      createdAt
      updatedAt
      items {
        id
        productName
        quantity
        unitPrice
        subtotal
        product {
          id
          imageUrl
        }
      }
    }
  }
`;

// ============================================================
// PAYMENT MUTATIONS
// ============================================================

export const CREATE_PAYMENT_ORDER = gql`
  mutation CreatePaymentOrder($orderId: String!) {
    createPaymentOrder(orderId: $orderId) {
      razorpayOrderId
      amount
      currency
      keyId
    }
  }
`;

export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($input: VerifyPaymentInput!) {
    verifyPayment(input: $input) {
      success
      orderId
      paymentId
    }
  }
`;

// ============================================================
// ADMIN QUERIES & MUTATIONS
// ============================================================

export const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    allOrders {
      id
      status
      totalAmount
      paymentStatus
      deliveryAddress
      createdAt
      user {
        userId
        name
        email
      }
      items {
        id
        productName
        quantity
        unitPrice
        subtotal
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      id
      status
      updatedAt
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      userId
      name
      email
      phoneNumber
      role
      isActive
      createdAt
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalOrders
      totalRevenue
      activeUsers
      pendingOrders
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(createProductInput: $input) {
      id
      name
      price
      category
      imageUrl
      inStock
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(updateProductInput: $input) {
      id
      name
      price
      category
      imageUrl
      inStock
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    removeProduct(id: $id)
  }
`;

export const GET_PRESIGNED_UPLOAD_URL = gql`
  mutation GetPresignedUploadUrl($filename: String!, $fileType: String!) {
    getPresignedUploadUrl(filename: $filename, fileType: $fileType) {
      uploadUrl
      fileUrl
    }
  }
`;

export const GET_ALL_PAYMENTS = gql`
  query GetAllPayments {
    allPayments {
      id
      amount
      currency
      razorpayOrderId
      razorpayPaymentId
      status
      orderId
      userId
      createdAt
    }
  }
`;

