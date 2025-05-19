import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    DepartementCode: '',
    DepartmentName: '',
    GrossSalary: '',
    TotalDeduction: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        // Using centralized API configuration
        const res = await axios.get(`${ENDPOINTS.DEPARTMENTS.DETAIL(id)}`, getAuthHeader());
        
        // Format the gross salary and total deduction as string values for the form
        const department = res.data.data;
        setFormData({
          DepartementCode: department.DepartementCode || '',
          DepartmentName: department.DepartmentName || '',
          GrossSalary: department.GrossSalary?.toString() || '',
          TotalDeduction: department.TotalDeduction?.toString() || ''
        });
        
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load department data');
        setLoading(false);
        navigate('/departments');
      }
    };

    fetchDepartment();
  }, [id, navigate]);

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
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        // Using centralized API configuration
        await axios.put(
          ENDPOINTS.DEPARTMENTS.DETAIL(id), 
          formData, 
          getAuthHeader()
        );
        
        toast.success('Department updated successfully');
        navigate('/departments');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update department';
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Edit Department</h2>
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
                {isSubmitting ? 'Updating...' : 'Update Department'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DepartmentEdit;
