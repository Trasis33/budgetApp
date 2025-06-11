import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from token in localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Configure axios headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      try {
        const res = await axios.get('/api/auth/user');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      // Store token in localStorage and set auth headers
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage and remove auth header
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
