import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Fallback to absolute backend URL for dynamic staging/local runs
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const { data } = await axios.get(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await axios.post(`${API_BASE}/auth/register`, { name, email, password, role });
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    setToken(data.token);
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
