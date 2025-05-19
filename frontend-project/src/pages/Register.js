import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { ENDPOINTS, getAuthHeader } from '../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.username) tempErrors.username = 'Username is required';
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        // Remove confirmPassword before sending to server
        const { confirmPassword, ...submitData } = formData;
        
        // Add detailed logging
        console.log('Attempting registration with:', submitData);
        console.log('Using API endpoint:', ENDPOINTS.AUTH.REGISTER);
        
        // Using centralized API configuration for EPMS database with explicit headers
        // Setting noAuth to true since registration doesn't require authentication
        const res = await axios.post(ENDPOINTS.AUTH.REGISTER, submitData, getAuthHeader(true));
        
        // Log the successful response
        console.log('Registration successful:', res.data);
        
        if (res.data.success) {
          // Store the token in localStorage temporarily to verify it's working
          localStorage.setItem('temp_token', res.data.token);
          
          // Registration successful - redirect to login
          navigate('/login');
          // Show success message
          toast.success('Registration successful. Please login to continue.');
        } else {
          console.error('Server returned success:false', res.data);
          setServerError(res.data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error details:', error.response?.data || error.message || error);
        console.error('API endpoint attempted:', ENDPOINTS.AUTH.REGISTER);
        setServerError(error.response?.data?.message || 'Registration failed. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
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
                <h4 className="text-muted">Create an Account</h4>
              </div>
              
              {serverError && <Alert variant="danger">{serverError}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!errors.username}
                    placeholder="Choose a username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    placeholder="Create a password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Confirm your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    <FaUserPlus className="me-2" />
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login">
                      <FaSignInAlt className="me-1" />
                      Login
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

export default Register;
