/**
 * API Configuration for EPMS Application
 * 
 * This file centralizes all API endpoints and configuration
 * to ensure consistent communication with the backend.
 */

// Base API URL - Change this if your backend server location changes
export const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  
  // Employee endpoints
  EMPLOYEES: {
    BASE: `${API_BASE_URL}/employees`,
    DETAIL: (id) => `${API_BASE_URL}/employees/${id}`,
    BY_POSITION: (position) => `${API_BASE_URL}/employees/position/${position}`,
  },
  
  // Department endpoints
  DEPARTMENTS: {
    BASE: `${API_BASE_URL}/departments`,
    DETAIL: (id) => `${API_BASE_URL}/departments/${id}`,
    BY_CODE: (code) => `${API_BASE_URL}/departments/code/${code}`,
  },
  
  // Salary endpoints
  SALARIES: {
    BASE: `${API_BASE_URL}/salaries`,
    DETAIL: (id) => `${API_BASE_URL}/salaries/${id}`,
    BY_EMPLOYEE: (employeeNumber) => `${API_BASE_URL}/salaries/employee/${employeeNumber}`,
  },
  
  // Payroll endpoints
  PAYROLLS: {
    BASE: `${API_BASE_URL}/payrolls`,
    DETAIL: (id) => `${API_BASE_URL}/payrolls/${id}`,
    BY_EMPLOYEE: (employeeId) => `${API_BASE_URL}/payrolls/employee/${employeeId}`,
  }
};

// API headers configuration
export const getAuthHeader = (noAuth = false) => {
  const token = localStorage.getItem('token');
  const headers = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  // Only add Authorization header if token exists and noAuth is false
  if (token && !noAuth) {
    headers.headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log('API Headers:', headers);
  return headers;
};

// API helper functions
export const apiHelpers = {
  // Get request helper
  get: async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        ...getAuthHeader(),
      });
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  
  // Post request helper
  post: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        ...getAuthHeader(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },
  
  // Put request helper
  put: async (url, data) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        ...getAuthHeader(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },
  
  // Delete request helper
  delete: async (url) => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        ...getAuthHeader(),
      });
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },
};

// Create a named constant for the default export
const apiConfig = {
  API_BASE_URL,
  ENDPOINTS,
  getAuthHeader,
  apiHelpers
};

export default apiConfig;
