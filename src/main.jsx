import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import { OrderProvider } from "./context/OrderContext";
import { AuthProvider } from "./context/AuthContext";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
     <HelmetProvider>
    <BrowserRouter>
    <AuthProvider>
    <OrderProvider>
  <WishlistProvider>
    <CartProvider>
      <AddressProvider>
      <App />
      </AddressProvider>
    </CartProvider>
  </WishlistProvider>
  </OrderProvider>
  </AuthProvider>
</BrowserRouter>
</HelmetProvider>

  </React.StrictMode>
);
