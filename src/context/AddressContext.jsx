import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);

  // ✅ token ko state bana diya (reactive)
  const [token, setToken] = useState(() => sessionStorage.getItem("accessToken"));

  // ✅ auth headers memoized (token change pe update)
  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }),
    [token]
  );

  // ✅ login/logout detect (without refresh)
  useEffect(() => {
    const onAuthChange = () => {
      setToken(sessionStorage.getItem("accessToken"));
    };

    window.addEventListener("authChange", onAuthChange);
    return () => window.removeEventListener("authChange", onAuthChange);
  }, []);

  // ✅ Load addresses from DB (login ke baad)
  useEffect(() => {
    if (!token) {
      setAddresses([]);
      return;
    }
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchAddresses = async () => {
    try {
      if (!token) {
        setAddresses([]);
        return;
      }
      const res = await api.get("/addresses", authHeaders);
      setAddresses(res?.data?.addresses || []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setAddresses([]);
    }
  };

  // ✅ Add address (Checkout ya MyProfile se)
  const addAddress = async (newAddress) => {
    try {
      if (!token) throw new Error("Not logged in");
      const res = await api.post("/addresses", newAddress, authHeaders);
      setAddresses(res?.data?.addresses || []);
      return res?.data?.addresses || [];
    } catch (err) {
      console.error("Add address error:", err);
      throw err;
    }
  };

  // ✅ Remove address (MyProfile se)
  const removeAddress = async (id) => {
    try {
      if (!token) throw new Error("Not logged in");
      const res = await api.delete(`/addresses/${id}`, authHeaders);
      setAddresses(res?.data?.addresses || []);
      return res?.data?.addresses || [];
    } catch (err) {
      console.error("Remove address error:", err);
      throw err;
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        setAddresses,
        addAddress,
        removeAddress,
        fetchAddresses,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
