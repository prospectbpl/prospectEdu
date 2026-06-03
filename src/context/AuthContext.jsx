import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem("accessToken"));

  const login = (newToken) => {
    sessionStorage.setItem("accessToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    setToken(null);
  };

  // optional: keep in sync across tabs
  useEffect(() => {
    const onStorage = () => setToken(sessionStorage.getItem("accessToken"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
