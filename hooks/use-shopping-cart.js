import React, {useContext, useMemo} from 'react';
import useLocalStorageReducer from './use-local-storage-reducer';
import {ACTION} from "@/hooks/use-action";

// Reducers
const initialCartValues = {
  cartDetails: {},
  cartCount: 0,
  totalPrice: 0,
  payToken: '',
  bindingID: '',
  bindAppTransID: ''
};

const addItem = (state = {}, product = null, quantity = 0) => {
  if (quantity <= 0 || !product) return state;

  let entry = state?.cartDetails?.[product.id];

  // Update item
  if (entry) {
    entry.quantity += quantity;
  }
  // Add item
  else {
    entry = {
      ...product,
      quantity,
    };
  }

  return {
    ...state,
    cartDetails: {
      ...state.cartDetails,
      [product.id]: entry,
    },
    cartCount: Math.max(0, state.cartCount + quantity),
    totalPrice: Math.max(state.totalPrice + product.price * quantity),
  };
};

const removeItem = (state = {}, product = null, quantity = 0) => {
  if (quantity <= 0 || !product) return state;

  let entry = state?.cartDetails?.[product.id];

  if (entry) {
    // Remove item
    if (quantity >= entry.quantity) {
      const {[product.id]: id, ...details} = state.cartDetails;
      return {
        ...state,
        cartDetails: details,
        cartCount: Math.max(0, state.cartCount - entry.quantity),
        totalPrice: Math.max(
            0,
            state.totalPrice - product.price * entry.quantity
        ),
      };
    }
    // Update item
    else {
      return {
        ...state,
        cartDetails: {
          ...state.cartDetails,
          [product.id]: {
            ...entry,
            quantity: entry.quantity - quantity,
          },
        },
        cartCount: Math.max(0, state.cartCount - quantity),
        totalPrice: Math.max(0, state.totalPrice - product.price * quantity),
      };
    }
  } else {
    return state;
  }
};

const clearCart = (state = {}) => {
  return {
    ...state,
    cartDetails: {},
    cartCount: 0,
    totalPrice: 0,
  }
};

const setPayToken = (state = {}, token = '') => {
  if (token === '') return state;

  return {
    ...state,
    payToken: token
  };
};

const clearPayToken = (state = {}) => {
  return {
    ...state,
    payToken: ''
  };
};

const setBindingID = (state = {}, id = '') => {
  if (id === '') return state;

  return {
    ...state,
    bindingID: id
  };
};

const clearBindingID = (state = {}) => {
  return {
    ...state,
    bindingID: ''
  };
};

const setBindAppTransID = (state = {}, appTransID = '') => {
  if (appTransID === '') return state;

  return {
    ...state,
    bindAppTransID: appTransID
  };
};

const clearBindAppTransID = (state = {}) => {
  return {
    ...state,
    bindAppTransID: ''
  };
};

const clearAgreement = (state = {}) => {
  return {
    ...state,
    payToken: '',
    bindingID: '',
    bindAppTransID: ''
  };
}

const cartReducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION.ADD_ITEM:
      return addItem(state, action.product, action.quantity);
    case ACTION.REMOVE_ITEM:
      return removeItem(state, action.product, action.quantity);
    case ACTION.CLEAR_CART:
      return clearCart(state);
    case ACTION.SET_PAY_TOKEN:
      return setPayToken(state, action.token);
    case ACTION.CLEAR_PAY_TOKEN:
      return clearPayToken(state);
    case ACTION.SET_BINDING_ID:
      return setBindingID(state, action.id);
    case ACTION.CLEAR_BINDING_ID:
      return clearBindingID(state);
    case ACTION.SET_BIND_APP_TRANS_ID:
      return setBindAppTransID(state, action.id);
    case ACTION.CLEAR_BIND_APP_TRANS_ID:
      return clearBindAppTransID(state);
    case ACTION.CLEAR_AGREEMENT:
      return clearAgreement(state);
    default:
      return state;
  }
};

// Context + Provider
const CartContext = React.createContext();

export const CartProvider = ({currency = 'VND', children = null}) => {
  const [cart, dispatch] = useLocalStorageReducer(
      'cart',
      cartReducer,
      initialCartValues
  );

  const contextValue = useMemo(
      () => [
        {
          ...cart,
          currency,
        },
        dispatch,
      ],
      [cart, currency]
  );

  return (
      <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

// Hook
export const useShoppingCart = () => {
  const [cart, dispatch] = useContext(CartContext);

  const addItem = (product, quantity = 1) =>
      dispatch({type: ACTION.ADD_ITEM, product, quantity});

  const removeItem = (product, quantity = 1) =>
      dispatch({type: ACTION.REMOVE_ITEM, product, quantity});

  const clearCart = () => dispatch({type: ACTION.CLEAR_CART});

  const setPayToken = (token) => {
    dispatch({type: ACTION.SET_PAY_TOKEN, token});
  }
  const clearPayToken = () => dispatch({type: ACTION.CLEAR_PAY_TOKEN});

  const setBindingID = (id) => {
    dispatch({type: ACTION.SET_BINDING_ID, id});
  }
  const clearBindingID = () => dispatch({type: ACTION.CLEAR_BINDING_ID});

  const setBindAppTransID = (id) => {
    dispatch({type: ACTION.SET_BIND_APP_TRANS_ID, id});
  }
  const clearBindAppTransID = () => dispatch({type: ACTION.CLEAR_BIND_APP_TRANS_ID});

  const clearAgreement = () => dispatch({type: ACTION.CLEAR_AGREEMENT});

  return {
    ...cart,
    addItem,
    removeItem,
    clearCart,
    setPayToken,
    clearPayToken,
    setBindingID,
    clearBindingID,
    setBindAppTransID,
    clearBindAppTransID,
    clearAgreement
  };
};
