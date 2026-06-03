import { api } from "../lib/api";

export const cartApi = {
  get: (accessToken) =>
    api.get("/cart", { headers: { Authorization: `Bearer ${accessToken}` } }),

  addItem: (accessToken, product) =>
    api.post("/cart/items", product, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  setQty: (accessToken, productId, quantity) =>
    api.patch(
      `/cart/items/${productId}`,
      { quantity },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),

  removeItem: (accessToken, productId) =>
    api.delete(`/cart/items/${productId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
