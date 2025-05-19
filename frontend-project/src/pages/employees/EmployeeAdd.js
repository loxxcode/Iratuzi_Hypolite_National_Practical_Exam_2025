import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeAdd = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeNumber: '',
    FirstName: '',
    LastName: '',
    Position: '',
    Address: '',
    Telephone: '',
    Gender: '',
    hiredDate: '',
    departmentcode: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Using centralized API configuration
        const res = await axios.get(ENDPOINTS.DEPARTMENTS.BASE, getAuthHeader());
        setDepartments(res.data.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load departments');
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

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
    if (!formData.departmentcode) tempErrors.departmentcode = 'Department is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        // Using the centralized API configuration
        await axios.post(ENDPOINTS.EMPLOYEES.BASE, formData, getAuthHeader());
        
        toast.success('Employee added successfully to EPMS database');
        navigate('/employees');
      } catch (error) {
        // Handle duplicate employee number error
        if (error.response?.data?.message?.includes('already exists')) {
          setErrors({
            ...errors,
            employeeNumber: error.response.data.message
          });
          // Focus on the employee number field
          document.getElementsByName('employeeNumber')[0].focus();
        } else {
          // Handle other validation errors
          if (error.response?.data?.errors) {
            const validationErrors = {};
            error.response.data.errors.forEach(err => {
              const field = err.toLowerCase().includes('employee number') ? 'employeeNumber' :
                          err.toLowerCase().includes('first name') ? 'FirstName' :
                          err.toLowerCase().includes('last name') ? 'LastName' :
                          err.toLowerCase().includes('position') ? 'Position' :
                          err.toLowerCase().includes('telephone') ? 'Telephone' :
                          err.toLowerCase().includes('gender') ? 'Gender' :
                          err.toLowerCase().includes('hire date') ? 'hiredDate' :
                          err.toLowerCase().includes('department') ? 'departmentcode' : null;
              
              if (field) {
                validationErrors[field] = err;
              }
            });
            setErrors(validationErrors);
          } else {
            // Show generic error message
            toast.error(error.response?.data?.message || 'Failed to add employee');
          }
        }
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
          <h2>Add New Employee</h2>
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
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="departmentcode"
                    value={formData.departmentcode}
                    onChange={handleChange}
                    isInvalid={!!errors.departmentcode}
                  >
                    <option value="">Select Department</option>
                    {departments.map(department => (
                      <option key={department._id} value={department.DepartementCode}>
                        {department.DepartmentName} ({department.DepartementCode})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.departmentcode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
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
            </Row>

            <Row>
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
                {isSubmitting ? 'Saving...' : 'Save Employee'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeAdd;
