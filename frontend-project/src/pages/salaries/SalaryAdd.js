import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SalaryAdd = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeNumber: '',
    month: '',
    GrossSalary: '',
    TotalDeducation: '',
    NetSalary: '0'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/employees', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEmployees(res.data.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load employees');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-calculate Net Salary when Gross Salary or Deduction changes
    if (name === 'GrossSalary' || name === 'TotalDeducation') {
      const grossSalary = name === 'GrossSalary' ? parseFloat(value) || 0 : parseFloat(formData.GrossSalary) || 0;
      const deduction = name === 'TotalDeducation' ? parseFloat(value) || 0 : parseFloat(formData.TotalDeducation) || 0;
      const netSalary = grossSalary - deduction;
      
      setFormData(prevState => ({
        ...prevState,
        NetSalary: netSalary.toFixed(2)
      }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.employeeNumber) tempErrors.employeeNumber = 'Employee is required';
    if (!formData.month) tempErrors.month = 'Month is required';
    if (!formData.GrossSalary) tempErrors.GrossSalary = 'Gross salary is required';
    if (!formData.TotalDeducation && formData.TotalDeducation !== 0) tempErrors.TotalDeducation = 'Total deduction is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/salaries', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success('Salary record added successfully');
        navigate('/salaries');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to add salary record';
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getMonthOptions = () => {
    const months = [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
    
    return months.map(month => (
      <option key={month.value} value={month.value}>{month.label}</option>
    ));
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Add Salary Record</h2>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    name="employeeNumber"
                    value={formData.employeeNumber}
                    onChange={handleChange}
                    isInvalid={!!errors.employeeNumber}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee.employeeNumber}>
                        {employee.FirstName} {employee.LastName} ({employee.employeeNumber})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.employeeNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Month</Form.Label>
                  <Form.Select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    isInvalid={!!errors.month}
                  >
                    <option value="">Select Month</option>
                    {getMonthOptions()}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.month}
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
                    name="TotalDeducation"
                    value={formData.TotalDeducation}
                    onChange={handleChange}
                    isInvalid={!!errors.TotalDeducation}
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.TotalDeducation}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Net Salary (Calculated)</Form.Label>
                  <Form.Control
                    type="number"
                    name="NetSalary"
                    value={formData.NetSalary}
                    readOnly
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/salaries')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Salary Record'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SalaryAdd;
