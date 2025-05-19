import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaFileInvoiceDollar } from 'react-icons/fa';
import axios from 'axios';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import { toast } from 'react-toastify';

const PayrollProcess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [payroll, setPayroll] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [step, setStep] = useState('select'); // 'select', 'review', 'process', 'complete'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payroll data if ID is provided
        if (id) {
          const payrollRes = await axios.get(ENDPOINTS.PAYROLLS.DETAIL(id), getAuthHeader());
          setPayroll(payrollRes.data);
        }

        // Fetch employees regardless of whether there's a payroll ID
        const empRes = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        
        let employeeData = [];
        if (empRes.data && Array.isArray(empRes.data.data)) {
          employeeData = empRes.data.data;
        } else if (empRes.data && Array.isArray(empRes.data)) {
          employeeData = empRes.data;
        }
        
        // Add salary details to each employee
        const employeesWithSalary = await Promise.all(
          employeeData.map(async (emp) => {
            try {
              const empId = emp._id || emp.id;
              const empNumber = emp.employeeId || emp.employeeNumber || emp.EmployeeNumber;
              if (empNumber) {
                const salaryRes = await axios.get(
                  ENDPOINTS.SALARIES.BY_EMPLOYEE(empNumber), 
                  getAuthHeader()
                );
                
                const salaryData = salaryRes.data && 
                  Array.isArray(salaryRes.data.data) ? 
                  salaryRes.data.data[0] : 
                  (Array.isArray(salaryRes.data) ? salaryRes.data[0] : null);
                
                return {
                  ...emp,
                  id: empId,
                  salary: salaryData || { grossSalary: 0, deductions: 0, netSalary: 0 }
                };
              }
              return { ...emp, id: empId, salary: { grossSalary: 0, deductions: 0, netSalary: 0 } };
            } catch (error) {
              console.error(`Error fetching salary for employee ${emp.id}:`, error);
              return { ...emp, id: emp._id || emp.id, salary: { grossSalary: 0, deductions: 0, netSalary: 0 } };
            }
          })
        );
        
        setEmployees(employeesWithSalary);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEmployeeSelection = (e, employeeId) => {
    if (e.target.checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(employees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const goToReview = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee to process');
      return;
    }
    setStep('review');
  };

  const goToProcess = () => {
    setStep('process');
    setProcessing(true);
    
    // Simulate processing - in a real app, this would call your backend API
    let processed = 0;
    const interval = setInterval(() => {
      processed++;
      setProcessedCount(processed);
      
      if (processed >= selectedEmployees.length) {
        clearInterval(interval);
        setProcessing(false);
        setStep('complete');
        toast.success('Payroll processing completed!');
      }
    }, 500);
  };

  const getSelectedEmployeesData = () => {
    return employees.filter(emp => selectedEmployees.includes(emp.id));
  };

  const getTotalAmount = (field) => {
    return getSelectedEmployeesData()
      .reduce((total, emp) => total + (parseFloat(emp.salary[field]) || 0), 0)
      .toFixed(2);
  };

  const getEmployeeName = (emp) => {
    return `${emp.firstName || emp.FirstName || ''} ${emp.lastName || emp.LastName || ''}`;
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">Select Employees for Payroll Processing</h5>
              <div>
                <Form.Check
                  type="checkbox"
                  id="select-all"
                  label="Select All"
                  onChange={handleSelectAll}
                  checked={selectedEmployees.length === employees.length}
                  className="text-white"
                />
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th width="50">Select</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th className="text-end">Gross Salary</th>
                    <th className="text-end">Deductions</th>
                    <th className="text-end">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          id={`emp-${emp.id}`}
                          onChange={(e) => handleEmployeeSelection(e, emp.id)}
                          checked={selectedEmployees.includes(emp.id)}
                        />
                      </td>
                      <td>{emp.employeeId || emp.employeeNumber || emp.EmployeeNumber}</td>
                      <td>{getEmployeeName(emp)}</td>
                      <td>{emp.position || emp.Position || '-'}</td>
                      <td>{emp.department || emp.Department || '-'}</td>
                      <td className="text-end">${parseFloat(emp.salary.grossSalary || 0).toFixed(2)}</td>
                      <td className="text-end">${parseFloat(emp.salary.deductions || 0).toFixed(2)}</td>
                      <td className="text-end">${parseFloat(emp.salary.netSalary || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <Badge bg="info">{selectedEmployees.length} of {employees.length} employees selected</Badge>
                </div>
                <div>
                  <Button 
                    variant="primary" 
                    onClick={goToReview} 
                    disabled={selectedEmployees.length === 0}
                  >
                    Review Payroll
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        );
        
      case 'review':
        return (
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Review Payroll Details</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6>Employees</h6>
                      <h3>{selectedEmployees.length}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6>Total Gross Salary</h6>
                      <h3>${getTotalAmount('grossSalary')}</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6>Total Net Salary</h6>
                      <h3>${getTotalAmount('netSalary')}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <h5 className="mb-3">Employees to Process</h5>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th className="text-end">Gross Salary</th>
                    <th className="text-end">Deductions</th>
                    <th className="text-end">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {getSelectedEmployeesData().map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.employeeId || emp.employeeNumber || emp.EmployeeNumber}</td>
                      <td>{getEmployeeName(emp)}</td>
                      <td className="text-end">${parseFloat(emp.salary.grossSalary || 0).toFixed(2)}</td>
                      <td className="text-end">${parseFloat(emp.salary.deductions || 0).toFixed(2)}</td>
                      <td className="text-end">${parseFloat(emp.salary.netSalary || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-primary">
                    <th colSpan={2}>Totals</th>
                    <th className="text-end">${getTotalAmount('grossSalary')}</th>
                    <th className="text-end">${getTotalAmount('deductions')}</th>
                    <th className="text-end">${getTotalAmount('netSalary')}</th>
                  </tr>
                </tfoot>
              </Table>
              
              <Alert variant="info">
                Payroll period: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Alert>
              
              <div className="d-flex justify-content-between mt-3">
                <Button variant="secondary" onClick={() => setStep('select')}>
                  <FaArrowLeft className="me-2" /> Back to Selection
                </Button>
                <Button variant="success" onClick={goToProcess}>
                  <FaFileInvoiceDollar className="me-2" /> Process Payroll
                </Button>
              </div>
            </Card.Body>
          </Card>
        );
        
      case 'process':
        return (
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Processing Payroll</h5>
            </Card.Header>
            <Card.Body className="text-center py-5">
              <h4 className="mb-4">Processing Payroll for {selectedEmployees.length} Employees</h4>
              <ProgressBar 
                animated 
                now={(processedCount / selectedEmployees.length) * 100} 
                label={`${processedCount} of ${selectedEmployees.length}`}
                className="mb-4"
                style={{ height: '30px' }}
              />
              <p className="text-muted">Please wait while we process the payroll...</p>
            </Card.Body>
          </Card>
        );
        
      case 'complete':
        return (
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Payroll Processing Complete</h5>
            </Card.Header>
            <Card.Body className="text-center py-5">
              <FaCheck size={50} className="text-success mb-3" />
              <h4 className="mb-4">Successfully Processed Payroll</h4>
              <p className="mb-4">Payroll has been processed for {selectedEmployees.length} employees.</p>
              
              <Row className="mb-4 justify-content-center">
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6>Total Processed</h6>
                      <h3>{selectedEmployees.length} Employees</h3>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center">
                    <Card.Body>
                      <h6>Total Amount</h6>
                      <h3>${getTotalAmount('netSalary')}</h3>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" onClick={() => navigate('/payrolls')}>
                  Go to Payroll List
                </Button>
                <Button variant="outline-primary" onClick={() => setStep('select')}>
                  Process Another Payroll
                </Button>
              </div>
            </Card.Body>
          </Card>
        );
        
      default:
        return <p>Unknown step</p>;
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <h3>Loading payroll data...</h3>
          <div className="spinner-border mt-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              {id ? `Process Payroll #${id}` : 'Batch Process Payroll'}
            </h2>
            <Link to="/payrolls" className="btn btn-outline-secondary">
              <FaArrowLeft className="me-2" /> Back to Payrolls
            </Link>
          </div>
        </Col>
      </Row>

      {renderStepContent()}
    </Container>
  );
};

export default PayrollProcess;
