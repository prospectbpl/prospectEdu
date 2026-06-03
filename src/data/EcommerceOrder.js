import {
  trendingProducts,
  LawProducts,
  merchandiseProducts,
} from "./ProductData";

export const ecommerceOrders = [
  {
    id: "ORD-101",
    product: trendingProducts[0],
    qty: 1,
    amount: trendingProducts[0].price,
    paymentType: "UPI",
    orderDate: "12 Jan 2025",
    paid: true,
    address: {
      name: "Akshat Agrawal",
      street: "Bhopal Bypass Road",
      city: "Bhopal",
      state: "MP",
      pincode: "462038",
      country: "India",
    },
  },
  {
    id: "ORD-102",
    product: LawProducts[0],
    qty: 2,
    amount: LawProducts[0].price * 2,
    paymentType: "Credit Card",
    orderDate: "14 Jan 2025",
    paid: true,
    address: {
      name: "Aditya Singh",
      street: "New Market",
      city: "Bhopal",
      state: "MP",
      pincode: "462001",
      country: "India",
    },
  },
  {
    id: "ORD-103",
    product: merchandiseProducts[0],
    qty: 1,
    amount: merchandiseProducts[0].price,
    paymentType: "COD",
    orderDate: "15 Jan 2025",
    paid: false,
    address: {
      name: "Pratima",
      street: "Kolar Road",
      city: "Bhopal",
      state: "MP",
      pincode: "462042",
      country: "India",
    },
  },
];
