import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    {
      id: "ORD12345",
      date: "12 Jan 2025",
      status: "ORDER RECEIVED",
      productImg: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
      productName: "IT Coding Book",
      price: 399,
      qty: 1,
      total: 399,
    },
    {
      id: "ORD92314",
      date: "03 Feb 2025",
      status: "ON THE WAY",
      productImg: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
      productName: "Management Notes",
      price: 299,
      qty: 5,
      total: 1495,
    },
    {
      id: "ORD55219",
      date: "29 Dec 2024",
      status: "REJECTED",
      productImg: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
      productName: "Law Guide Book",
      price: 499,
      qty: 1,
      total: 499,
    },
  ]);

  return (
    <OrderContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
