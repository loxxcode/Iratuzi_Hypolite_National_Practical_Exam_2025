import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { ENDPOINTS, getAuthHeader } from '../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({ login }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with:', formData);
      console.log('Using API endpoint:', ENDPOINTS.AUTH.LOGIN);
      
      // Using centralized API configuration with explicit headers
      // Setting noAuth to true since login doesn't require authentication
      const res = await axios.post(ENDPOINTS.AUTH.LOGIN, formData, getAuthHeader(true));
      
      if (res.data.success) {
        // Call the login function passed as prop from App.js
        login(res.data.token, res.data.user);
        
        // Show success message
        toast.success('Login successful!');
        
        // Redirect to dashboard
        navigate('/');
      } else {
        setError(res.data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="mb-3">Employee Payroll Management</h2>
                <h4 className="text-muted">Login to Your Account</h4>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    <FaSignInAlt className="me-2" />
                    {isSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register">
                      <FaUserPlus className="me-1" />
                      Register
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
        
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
