const customers = [
  {
    id: 1,
    customerId: "CUST001",
    name: "John Doe",
    phone: "+1234567890",
    email: "johndoe@example.com",
    address: "221B Baker Street, London",
    joinedDate: "02 Jan 2024",

    status: "Active",        // Active | VIP | Inactive
    orderCount: 25,
    totalSpend: 3450.0,
    cancelledOrder: 5,
    completedOrder: 20,

    orders: [
      {
        orderId: "#ORD1001",
        date: "01 Jan 2025",
        total: 499.0,
        status: "Delivered",
      },
      {
        orderId: "#ORD0985",
        date: "20 Dec 2024",
        total: 149.0,
        status: "Delivered",
      },
      {
        orderId: "#ORD0972",
        date: "02 Dec 2024",
        total: 79.0,
        status: "Shipped",
      },
    ],
  },

  {
    id: 2,
    customerId: "CUST002",
    name: "Emily Davis",
    phone: "+1987654321",
    email: "emilyd@example.com",
    address: "742 Evergreen Terrace, Springfield",
    joinedDate: "15 Feb 2024",

    status: "VIP",
    orderCount: 30,
    totalSpend: 4600.0,
    cancelledOrder: 5,
    completedOrder: 25,

    orders: [
      {
        orderId: "#ORD1104",
        date: "03 Jan 2025",
        total: 799.0,
        status: "Delivered",
      },
      {
        orderId: "#ORD1076",
        date: "10 Dec 2024",
        total: 1299.0,
        status: "Pending",
      },
      {
        orderId: "#ORD1043",
        date: "01 Dec 2024",
        total: 275.0,
        status: "Cancelled",
      },
    ],
  },

  {
    id: 3,
    customerId: "CUST003",
    name: "Jane Smith",
    phone: "+1234509876",
    email: "janesmith@example.com",
    address: "1600 Pennsylvania Ave, Washington DC",
    joinedDate: "10 Mar 2024",

    status: "Inactive",
    orderCount: 5,
    totalSpend: 250.0,
    cancelledOrder: 1,
    completedOrder: 4,

    orders: [
      {
        orderId: "#ORD1150",
        date: "05 Jan 2025",
        total: 250.0,
        status: "Pending",
      },
    ],
  },
];

export default customers;
