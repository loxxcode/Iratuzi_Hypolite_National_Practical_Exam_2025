import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';

const SalaryView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [salary, setSalary] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const slipRef = useRef(null);

  useEffect(() => {
    const fetchSalaryAndEmployee = async () => {
      try {
        // Fetch salary details
        const salaryRes = await axios.get(`${ENDPOINTS.SALARIES.DETAIL(id)}`, getAuthHeader());
        setSalary(salaryRes.data.data);
        
        // Fetch employee details
        try {
          const employeeNumber = salaryRes.data.data.employeeNumber;
          const employeesRes = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
          const employeeData = employeesRes.data.data.find(
            emp => emp.employeeNumber === employeeNumber
          );
          
          if (employeeData) {
            setEmployee(employeeData);
          }
        } catch (error) {
          console.error('Error fetching employee details:', error);
        }
        
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load salary details');
        setLoading(false);
        navigate('/salaries');
      }
    };

    fetchSalaryAndEmployee();
  }, [id, navigate]);

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  const handleBack = () => {
    navigate('/salaries');
  };

  const handlePrintSlip = () => {
    const printContent = slipRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    
    // Re-render the component after printing
    window.location.reload();
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;
  if (!salary) return <div className="text-center mt-5 text-danger"><h3>Salary record not found</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Salary Details</h2>
            <div>
              <Button variant="secondary" className="me-2" onClick={handleBack}>
                <FaArrowLeft className="me-2" /> Back to List
              </Button>
              <Button variant="primary" onClick={handlePrintSlip}>
                <FaPrint className="me-2" /> Print Slip
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <div ref={slipRef}>
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Header as="h5" className="text-center bg-primary text-white">
                EPMS - Employee Payroll Management System
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-4">
                  <h3>Salary Slip</h3>
                  <p>For the month of {getMonthName(salary.month)}</p>
                </div>
                
                <Row>
                  <Col md={6}>
                    <h5>Employee Information</h5>
                    <ListGroup variant="flush" className="mb-4">
                      <ListGroup.Item>
                        <strong>Employee ID:</strong> {salary.employeeNumber}
                      </ListGroup.Item>
                      {employee && (
                        <>
                          <ListGroup.Item>
                            <strong>Name:</strong> {employee.FirstName} {employee.LastName}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Position:</strong> {employee.Position}
                          </ListGroup.Item>
                          {employee.departmentcode && (
                            <ListGroup.Item>
                              <strong>Department:</strong> {employee.departmentcode}
                            </ListGroup.Item>
                          )}
                        </>
                      )}
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <h5>Salary Reference</h5>
                    <ListGroup variant="flush" className="mb-4">
                      <ListGroup.Item>
                        <strong>Slip ID:</strong> {salary._id}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Month:</strong> {getMonthName(salary.month)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Date Generated:</strong> {new Date().toLocaleDateString()}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Pay Date:</strong> {new Date(salary.createdAt).toLocaleDateString()}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>

                <div className="slip-financial-info mb-4">
                  <h5>Earnings & Deductions</h5>
                  <Table bordered striped>
                    <thead className="thead-dark">
                      <tr>
                        <th>Earnings</th>
                        <th>Amount (RWF)</th>
                        <th>Deductions</th>
                        <th>Amount (RWF)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Basic Salary</td>
                        <td>{parseFloat(salary.GrossSalary).toFixed(2)}</td>
                        <td>Total Deductions</td>
                        <td>{parseFloat(salary.TotalDeducation).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Allowances</td>
                        <td>0.00</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td><strong>TOTAL:</strong></td>
                        <td><strong>{parseFloat(salary.GrossSalary).toFixed(2)}</strong></td>
                        <td><strong>TOTAL:</strong></td>
                        <td><strong>{parseFloat(salary.TotalDeducation).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div className="slip-summary">
                  <Card bg="light" className="p-3">
                    <div className="d-flex justify-content-between">
                      <h4>Net Salary:</h4>
                      <h4><strong>{parseFloat(salary.NetSalary).toFixed(2)} RWF</strong></h4>
                    </div>
                    <div className="text-center mt-3">
                      <p><em>This is a computer-generated document. No signature required.</em></p>
                    </div>
                  </Card>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default SalaryView;
