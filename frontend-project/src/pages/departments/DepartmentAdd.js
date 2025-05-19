import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    DepartementCode: '',
    DepartmentName: '',
    GrossSalary: '',
    TotalDeduction: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.DepartementCode) tempErrors.DepartementCode = 'Department code is required';
    if (!formData.DepartmentName) tempErrors.DepartmentName = 'Department name is required';
    if (!formData.GrossSalary) tempErrors.GrossSalary = 'Gross salary is required';
    if (!formData.TotalDeduction) tempErrors.TotalDeduction = 'Total deduction is required';
    // Employee number is optional for department
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        // Using centralized API configuration for EPMS database
        await axios.post(ENDPOINTS.DEPARTMENTS.BASE, formData, getAuthHeader());
        
        toast.success('Department added successfully to EPMS database');
        navigate('/departments');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to add department';
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };



  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Add New Department</h2>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="DepartementCode"
                    value={formData.DepartementCode}
                    onChange={handleChange}
                    isInvalid={!!errors.DepartementCode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.DepartementCode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="DepartmentName"
                    value={formData.DepartmentName}
                    onChange={handleChange}
                    isInvalid={!!errors.DepartmentName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.DepartmentName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gross Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="GrossSalary"
                    value={formData.GrossSalary}
                    onChange={handleChange}
                    isInvalid={!!errors.GrossSalary}
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.GrossSalary}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Deduction</Form.Label>
                  <Form.Control
                    type="number"
                    name="TotalDeduction"
                    value={formData.TotalDeduction}
                    onChange={handleChange}
                    isInvalid={!!errors.TotalDeduction}
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.TotalDeduction}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/departments')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Department'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DepartmentAdd;
