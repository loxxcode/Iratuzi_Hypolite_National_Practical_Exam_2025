import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalculator } from 'react-icons/fa';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const PayrollAdd = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: {
      overtime: 0,
      medical: 0,
      transportation: 0,
      other: 0
    },
    deductions: {
      tax: 0,
      insurance: 0,
      loan: 0,
      other: 0
    },
    netSalary: 0,
    paymentMethod: 'bank transfer',
    comments: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Using centralized API configuration for EPMS database
        console.log('Fetching employees from:', ENDPOINTS.EMPLOYEES.BASE);
        const res = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        console.log('Employee data received:', res.data);
        
        // Check if data exists and has the expected format
        if (res.data && Array.isArray(res.data.data)) {
          setEmployees(res.data.data);
        } else if (res.data && Array.isArray(res.data)) {
          // Handle different API response format
          setEmployees(res.data);
        } else {
          console.error('Unexpected employee data format:', res.data);
          toast.error('Unexpected employee data format');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const calculateNetSalary = () => {
    const { basicSalary, allowances, deductions } = formData;
    
    // Calculate total allowances
    const totalAllowances = 
      parseFloat(allowances.overtime || 0) + 
      parseFloat(allowances.medical || 0) + 
      parseFloat(allowances.transportation || 0) + 
      parseFloat(allowances.other || 0);
    
    // Calculate total deductions
    const totalDeductions = 
      parseFloat(deductions.tax || 0) + 
      parseFloat(deductions.insurance || 0) + 
      parseFloat(deductions.loan || 0) + 
      parseFloat(deductions.other || 0);
    
    // Calculate net salary
    const netSalary = parseFloat(basicSalary || 0) + totalAllowances - totalDeductions;
    
    return netSalary.toFixed(2);
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    const employee = employees.find(emp => emp._id === employeeId);
    
    setSelectedEmployee(employee);
    
    if (employee) {
      setFormData({
        ...formData,
        employee: employeeId,
        basicSalary: employee.salary?.basic || 0
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAllowanceChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      allowances: {
        ...formData.allowances,
        [name]: parseFloat(value) || 0
      }
    });
  };

  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      deductions: {
        ...formData.deductions,
        [name]: parseFloat(value) || 0
      }
    });
  };

  const validate = () => {
    let tempErrors = {};
    
    if (!formData.employee) tempErrors.employee = 'Employee is required';
    if (!formData.month) tempErrors.month = 'Month is required';
    if (!formData.year) tempErrors.year = 'Year is required';
    if (!formData.basicSalary) tempErrors.basicSalary = 'Basic salary is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Update net salary before submission
    const netSalary = calculateNetSalary();
    const updatedFormData = {
      ...formData,
      netSalary
    };
    
    if (validate()) {
      setIsSubmitting(true);
      
      try {
        // Using centralized API configuration for EPMS database
        await axios.post(ENDPOINTS.PAYROLLS.BASE, updatedFormData, getAuthHeader());
        
        toast.success('Payroll generated successfully in EPMS database');
        navigate('/payrolls');
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to generate payroll';
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
          <h2>Generate Payroll</h2>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    name="employee"
                    value={formData.employee}
                    onChange={handleEmployeeChange}
                    isInvalid={!!errors.employee}
                  >
                    <option value="">Select Employee</option>
                    {employees && employees.length > 0 ? (
                      employees.map(employee => (
                        <option 
                          key={employee._id || employee.id} 
                          value={employee._id || employee.id}
                        >
                          {employee.firstName || employee.FirstName} {employee.lastName || employee.LastName} 
                          ({employee.employeeId || employee.employeeNumber || employee.EmployeeNumber})
                        </option>
                      ))
                    ) : (
                      <option disabled>No employees found</option>
                    )}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.employee}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
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
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    isInvalid={!!errors.year}
                    min="2000"
                    max="2100"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.year}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {selectedEmployee && (
              <Card className="mt-3 mb-4 bg-light">
                <Card.Body>
                  <h5>Employee Details</h5>
                  <Row>
                    <Col md={4}>
                      <p><strong>Name:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    </Col>
                    <Col md={4}>
                      <p><strong>Position:</strong> {selectedEmployee.position}</p>
                    </Col>
                    <Col md={4}>
                      <p><strong>ID:</strong> {selectedEmployee.employeeId}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            <h5 className="mt-4">Earnings</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Basic Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    isInvalid={!!errors.basicSalary}
                    step="0.01"
                    min="0"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.basicSalary}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Overtime</Form.Label>
                  <Form.Control
                    type="number"
                    name="overtime"
                    value={formData.allowances.overtime}
                    onChange={handleAllowanceChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Medical</Form.Label>
                  <Form.Control
                    type="number"
                    name="medical"
                    value={formData.allowances.medical}
                    onChange={handleAllowanceChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Transportation</Form.Label>
                  <Form.Control
                    type="number"
                    name="transportation"
                    value={formData.allowances.transportation}
                    onChange={handleAllowanceChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Other Allowances</Form.Label>
                  <Form.Control
                    type="number"
                    name="other"
                    value={formData.allowances.other}
                    onChange={handleAllowanceChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4">Deductions</h5>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tax</Form.Label>
                  <Form.Control
                    type="number"
                    name="tax"
                    value={formData.deductions.tax}
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Insurance</Form.Label>
                  <Form.Control
                    type="number"
                    name="insurance"
                    value={formData.deductions.insurance}
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Loan</Form.Label>
                  <Form.Control
                    type="number"
                    name="loan"
                    value={formData.deductions.loan}
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Other Deductions</Form.Label>
                  <Form.Control
                    type="number"
                    name="other"
                    value={formData.deductions.other}
                    onChange={handleDeductionChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="bank transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Card className="bg-light mt-4 mb-4">
              <Card.Body>
                <h5 className="mb-3">Payroll Summary</h5>
                <Table bordered>
                  <tbody>
                    <tr>
                      <td width="50%"><strong>Basic Salary</strong></td>
                      <td>${parseFloat(formData.basicSalary || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><strong>Total Allowances</strong></td>
                      <td>
                        ${(
                          parseFloat(formData.allowances.overtime || 0) +
                          parseFloat(formData.allowances.medical || 0) +
                          parseFloat(formData.allowances.transportation || 0) +
                          parseFloat(formData.allowances.other || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Total Deductions</strong></td>
                      <td>
                        ${(
                          parseFloat(formData.deductions.tax || 0) +
                          parseFloat(formData.deductions.insurance || 0) +
                          parseFloat(formData.deductions.loan || 0) +
                          parseFloat(formData.deductions.other || 0)
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="table-primary">
                      <td><strong>Net Salary</strong></td>
                      <td><strong>${calculateNetSalary()}</strong></td>
                    </tr>
                  </tbody>
                </Table>
                <div className="text-center">
                  <Button variant="outline-primary" type="button" onClick={() => toast.info('Calculation updated')}>
                    <FaCalculator className="me-2" /> Recalculate
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={() => navigate('/payrolls')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Generate Payroll'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PayrollAdd;
