import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaPlus, FaFileDownload } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PayrollList = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        console.log('Fetching payroll list data...');
        const token = localStorage.getItem('token');
        
        // Add a timeout to prevent hanging requests
        const res = await axios.get('http://localhost:5000/api/payrolls', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 5000
        });
        
        console.log('PayrollList API Response:', res);
        
        // Handle different API response formats
        let payrollData = [];
        if (res.data && Array.isArray(res.data.data)) {
          console.log('Found payroll data in data.data array');
          payrollData = res.data.data;
        } else if (res.data && Array.isArray(res.data)) {
          console.log('Found payroll data in direct data array');
          payrollData = res.data;
        } else if (res.data && res.data.payrolls && Array.isArray(res.data.payrolls)) {
          console.log('Found payroll data in data.payrolls array');
          payrollData = res.data.payrolls;
        } else if (res.data && !Array.isArray(res.data) && typeof res.data === 'object') {
          // Single object
          console.log('Found single payroll, converting to array');
          payrollData = [res.data];
        }
        
        console.log('Processed payroll data:', payrollData);
        
        // If no data was found, create sample data for testing UI
        if (payrollData.length === 0) {
          console.log('No payroll data found, creating sample data for display');
          const currentDate = new Date();
          payrollData = [
            {
              _id: '1',
              payrollId: 'PAY-001',
              date: currentDate,
              month: currentDate.getMonth() + 1,
              year: currentDate.getFullYear(),
              netSalary: 5000,
              status: 'pending',
              employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' }
            },
            {
              _id: '2',
              payrollId: 'PAY-002',
              date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              month: currentDate.getMonth() + 1,
              year: currentDate.getFullYear(),
              netSalary: 6000,
              status: 'processed',
              employee: { firstName: 'Jane', lastName: 'Smith', employeeNumber: 'EMP002' }
            }
          ];
          
          // Show toast that we're using sample data
          toast.info('Using sample payroll data for display purposes');
        }
        
        setPayrolls(payrollData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        
        // Create sample data for UI testing even in case of error
        console.log('Creating fallback sample data due to API error');
        const currentDate = new Date();
        const sampleData = [
          {
            _id: '1',
            payrollId: 'PAY-001',
            date: currentDate,
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            netSalary: 5000,
            status: 'pending',
            employee: { firstName: 'John', lastName: 'Doe', employeeNumber: 'EMP001' }
          },
          {
            _id: '2',
            payrollId: 'PAY-002',
            date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
            netSalary: 6000,
            status: 'processed',
            employee: { firstName: 'Jane', lastName: 'Smith', employeeNumber: 'EMP002' }
          }
        ];
        
        setPayrolls(sampleData);
        setError('Error connecting to the server. Showing sample data.');
        setLoading(false);
        toast.warning('Failed to connect to the server. Showing sample data instead.');
      }
    };

    fetchPayrolls();
  }, []);

  const getStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'pending':
        variant = 'warning';
        break;
      case 'processed':
        variant = 'info';
        break;
      case 'paid':
        variant = 'success';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge bg={variant}>{status}</Badge>;
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading payroll data...</h3></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Payroll List</h2>
        </Col>
        <Col className="text-end">
          <Link to="/payrolls/add">
            <Button variant="primary">
              <FaPlus className="me-2" /> Generate Payroll
            </Button>
          </Link>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {payrolls.length === 0 ? (
            <div className="text-center p-5">
              <h4>No payroll records found</h4>
              <p>Generate payroll for employees to get started</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(payroll => {
                  // Safely extract employee information
                  let employeeName = "Unknown Employee";
                  let employeeId = "N/A";
                  let payrollMonth = payroll.month || "N/A";
                  let payrollYear = payroll.year || "N/A";
                  let payrollId = payroll._id || payroll.id || "";
                  let basicSalary = parseFloat(payroll.basicSalary || 0).toFixed(2);
                  let netSalary = parseFloat(payroll.netSalary || 0).toFixed(2);
                  
                  // Extract payment date
                  let paymentDate = payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : '-';
                  
                  // Handle different employee reference formats
                  if (payroll.employee) {
                    if (typeof payroll.employee === 'object') {
                      // Case 1: Employee is an embedded object
                      const firstName = payroll.employee.firstName || payroll.employee.FirstName || '';
                      const lastName = payroll.employee.lastName || payroll.employee.LastName || '';
                      employeeName = `${firstName} ${lastName}`.trim();
                      employeeId = payroll.employee.employeeId || payroll.employee.employeeNumber || payroll.employee._id || '';
                    } else {
                      // Case 2: Employee is a string reference
                      employeeId = payroll.employee;
                      employeeName = `Employee #${payroll.employee}`;
                    }
                  } else if (payroll.employeeId) {
                    // Case 3: Only employeeId is present
                    employeeId = payroll.employeeId;
                    employeeName = `Employee ID: ${payroll.employeeId}`;
                  }
                  
                  return (
                    <tr key={payrollId}>
                      <td>
                        <div>{employeeName}</div>
                        {employeeId && <small className="text-muted">{employeeId}</small>}
                      </td>
                      <td>
                        {payrollMonth}/{payrollYear}
                      </td>
                      <td>${basicSalary}</td>
                      <td>${netSalary}</td>
                      <td>{getStatusBadge(payroll.status || 'pending')}</td>
                      <td>
                        {paymentDate}
                      </td>
                      <td>
                        <Link to={`/payrolls/view/${payrollId}`} className="btn btn-info btn-sm me-2">
                          <FaEye /> View
                        </Link>
                        <Button variant="success" size="sm">
                          <FaFileDownload /> Download
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PayrollList;
