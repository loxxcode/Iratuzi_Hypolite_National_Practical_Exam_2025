import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PayrollView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/payrolls/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setPayroll(res.data.data);
        
        // Fetch employee details
        if (res.data.data.employeeId) {
          const empRes = await axios.get(`http://localhost:5000/api/employees/${res.data.data.employeeId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setEmployee(empRes.data.data);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Error fetching payroll data. Please try again.');
        setLoading(false);
        toast.error('Failed to load payroll data');
      }
    };
    
    fetchPayrollData();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const printPayslip = () => {
    window.print();
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading payroll data...</h3></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;
  if (!payroll) return <div className="text-center mt-5"><h3>Payroll record not found</h3></div>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Payroll Details</h2>
        <div>
          <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Back
          </Button>
          <Button variant="primary" className="me-2" onClick={printPayslip}>
            <FaPrint className="me-2" /> Print
          </Button>
          <Button variant="success">
            <FaFilePdf className="me-2" /> Generate PDF
          </Button>
        </div>
      </div>
      
      <Card className="mb-4 payslip-card">
        <Card.Header>
          <h4 className="mb-0">Payslip</h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <h5>Employee Information</h5>
              {employee ? (
                <div>
                  <p><strong>Name:</strong> {employee.firstName} {employee.lastName}</p>
                  <p><strong>ID:</strong> {employee.employeeId}</p>
                  <p><strong>Position:</strong> {employee.position}</p>
                </div>
              ) : (
                <p>Employee details not available</p>
              )}
            </Col>
            <Col md={6}>
              <h5>Payroll Information</h5>
              <p><strong>Payment Date:</strong> {new Date(payroll.paymentDate || payroll.createdAt).toLocaleDateString()}</p>
              <p><strong>Payment Method:</strong> {payroll.paymentMethod || 'Bank Transfer'}</p>
              <p><strong>Status:</strong> {payroll.status}</p>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td className="text-end">{formatCurrency(payroll.basicSalary)}</td>
                  </tr>
                  
                  {/* Allowances */}
                  {Object.entries(payroll.allowances || {}).map(([key, value]) => (
                    value > 0 && (
                      <tr key={`allowance-${key}`}>
                        <td>{key.charAt(0).toUpperCase() + key.slice(1)} Allowance</td>
                        <td className="text-end">{formatCurrency(value)}</td>
                      </tr>
                    )
                  ))}
                  
                  <tr className="table-light">
                    <td><strong>Total Earnings</strong></td>
                    <td className="text-end"><strong>{formatCurrency(payroll.basicSalary + Object.values(payroll.allowances || {}).reduce((a, b) => a + b, 0))}</strong></td>
                  </tr>
                  
                  {/* Deductions */}
                  {Object.entries(payroll.deductions || {}).map(([key, value]) => (
                    value > 0 && (
                      <tr key={`deduction-${key}`}>
                        <td>{key.charAt(0).toUpperCase() + key.slice(1)} Deduction</td>
                        <td className="text-end">{formatCurrency(value)}</td>
                      </tr>
                    )
                  ))}
                  
                  <tr className="table-light">
                    <td><strong>Total Deductions</strong></td>
                    <td className="text-end"><strong>{formatCurrency(Object.values(payroll.deductions || {}).reduce((a, b) => a + b, 0))}</strong></td>
                  </tr>
                  
                  <tr className="table-primary">
                    <td><strong>Net Salary</strong></td>
                    <td className="text-end"><strong>{formatCurrency(payroll.netSalary)}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          
          {payroll.comments && (
            <Row className="mt-3">
              <Col>
                <h5>Comments</h5>
                <p>{payroll.comments}</p>
              </Col>
            </Row>
          )}
        </Card.Body>
        <Card.Footer className="text-center">
          <p className="mb-0">This is a computer generated payslip and does not require a signature.</p>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default PayrollView;
