import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { login as apiLogin, signup as apiSignup } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('placement_token');
    const storedUser = localStorage.getItem('placement_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsed = JSON.parse(storedUser);
      setUser(normalizeUser(parsed));
      setAuthToken(storedToken);
    }
    setLoading(false);
  }, []);

  const normalizeUser = (u) => {
    return {
      sub: u.id || u.sub,
      name: u.firstname ? `${u.firstname} ${u.lastname}` : u.name,
      email: u.email,
      role: u.role,
      roles: u.roles || (u.role ? [u.role] : [])
    };
  };

  const setAuthToken = (t) => {
    if (t) {
      api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const handleAuthResponse = (data) => {
    const t = data.token;
    const u = normalizeUser(data.user);
    setToken(t);
    setUser(u);
    localStorage.setItem('placement_token', t);
    localStorage.setItem('placement_user', JSON.stringify(u));
    setAuthToken(t);
  };

  const login = async (credentials) => {
    const { data } = await apiLogin(credentials);
    handleAuthResponse(data);
  };

  const signup = async (userInfo) => {
    const { data } = await apiSignup(userInfo);
    handleAuthResponse(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('placement_token');
    localStorage.removeItem('placement_user');
    setAuthToken(null);
  };

  const hasRole = (role) => {
    return user?.role === role || user?.roles?.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, hasRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
