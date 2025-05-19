import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeNumber: '',
    FirstName: '',
    LastName: '',
    Position: '',
    Address: '',
    Telephone: '',
    Gender: '',
    hiredDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Format date to YYYY-MM-DD for the date input
        const employee = res.data.data;
        if (employee.hiredDate) {
          const date = new Date(employee.hiredDate);
          employee.hiredDate = date.toISOString().split('T')[0];
        }
        
        setFormData(employee);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load employee data');
        setLoading(false);
        navigate('/employees');
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.employeeNumber) tempErrors.employeeNumber = 'Employee number is required';
    if (!formData.FirstName) tempErrors.FirstName = 'First name is required';
    if (!formData.LastName) tempErrors.LastName = 'Last name is required';
    if (!formData.Position) tempErrors.Position = 'Position is required';
    if (!formData.Telephone) tempErrors.Telephone = 'Telephone is required';
    if (!formData.Gender) tempErrors.Gender = 'Please select a gender';
    if (!formData.hiredDate) tempErrors.hiredDate = 'Hire date is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/employees/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Employee updated successfully');
        navigate('/employees');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update employee';
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading employee data...</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Edit Employee</h2>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeNumber"
                    value={formData.employeeNumber}
                    onChange={handleChange}
                    isInvalid={!!errors.employeeNumber}
                    readOnly // Typically employee number shouldn't be editable
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.employeeNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="Position"
                    value={formData.Position}
                    onChange={handleChange}
                    isInvalid={!!errors.Position}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Position}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleChange}
                    isInvalid={!!errors.FirstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.FirstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="LastName"
                    value={formData.LastName}
                    onChange={handleChange}
                    isInvalid={!!errors.LastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.LastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telephone</Form.Label>
                  <Form.Control
                    type="text"
                    name="Telephone"
                    value={formData.Telephone}
                    onChange={handleChange}
                    isInvalid={!!errors.Telephone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Telephone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="Gender"
                    value={formData.Gender}
                    onChange={handleChange}
                    isInvalid={!!errors.Gender}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.Gender}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="Address"
                    value={formData.Address}
                    onChange={handleChange}
                    isInvalid={!!errors.Address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hire Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="hiredDate"
                    value={formData.hiredDate}
                    onChange={handleChange}
                    isInvalid={!!errors.hiredDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.hiredDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/employees')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Update Employee'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeEdit;
