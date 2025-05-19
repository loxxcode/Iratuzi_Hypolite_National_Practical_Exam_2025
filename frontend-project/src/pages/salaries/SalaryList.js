import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaPlus, FaFilePdf, FaPrint } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const SalaryList = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState({});
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const slipRef = useRef(null);

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/salaries', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSalaries(res.data.data);
        
        // Fetch employee details for each salary record
        const employeeData = {};
        for (const salary of res.data.data) {
          if (!employeeData[salary.employeeNumber]) {
            try {
              const empRes = await axios.get(`http://localhost:5000/api/employees`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              const employee = empRes.data.data.find(
                emp => emp.employeeNumber === salary.employeeNumber
              );
              
              if (employee) {
                employeeData[salary.employeeNumber] = {
                  name: `${employee.FirstName} ${employee.LastName}`,
                  position: employee.Position
                };
              }
            } catch (error) {
              console.error('Error fetching employee details:', error);
            }
          }
        }
        
        setEmployees(employeeData);
        setLoading(false);
      } catch (error) {
        setError('Error fetching salary data. Please try again.');
        setLoading(false);
        toast.error('Failed to load salary data');
      }
    };

    fetchSalaries();
  }, []);

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  const handleGenerateSlip = (salary) => {
    setSelectedSalary(salary);
    setShowSlipModal(true);
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

  if (loading) return <div className="text-center mt-5"><h3>Loading salary data...</h3></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Salary Records</h2>
        </Col>
        <Col className="text-end">
          <Link to="/salaries/add">
            <Button variant="primary">
              <FaPlus className="me-2" /> Add Salary Record
            </Button>
          </Link>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {salaries.length === 0 ? (
            <div className="text-center p-5">
              <h4>No salary records found</h4>
              <p>Add salary records to manage employee payments</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map(salary => (
                  <tr key={salary._id}>
                    <td>
                      {employees[salary.employeeNumber] ? (
                        <>
                          <div>{employees[salary.employeeNumber].name}</div>
                          <small className="text-muted">{employees[salary.employeeNumber].position}</small>
                        </>
                      ) : (
                        salary.employeeNumber
                      )}
                    </td>
                    <td>{getMonthName(salary.month)}</td>
                    <td>${salary.GrossSalary.toFixed(2)}</td>
                    <td>${salary.TotalDeducation.toFixed(2)}</td>
                    <td>${salary.NetSalary.toFixed(2)}</td>
                    <td>
                      <Link to={`/salaries/view/${salary._id}`} className="btn btn-info btn-sm me-2">
                        <FaEye /> View
                      </Link>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleGenerateSlip(salary)}
                      >
                        <FaFilePdf /> Generate Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Salary Slip Modal */}
      <Modal
        show={showSlipModal}
        onHide={() => setShowSlipModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Salary Slip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div ref={slipRef} className="salary-slip-container">
            {selectedSalary && (
              <div className="salary-slip">
                <div className="slip-header text-center mb-4">
                  <h2>EPMS - Employee Payroll Management System</h2>
                  <h3>Salary Slip</h3>
                  <p>For the month of {getMonthName(selectedSalary.month)}</p>
                </div>

                <div className="slip-employee-info mb-4">
                  <div className="row">
                    <div className="col-6">
                      <h5>Employee Information</h5>
                      <p><strong>Employee ID:</strong> {selectedSalary.employeeNumber}</p>
                      {employees[selectedSalary.employeeNumber] && (
                        <>
                          <p>
                            <strong>Name:</strong> {employees[selectedSalary.employeeNumber].name}
                          </p>
                          <p>
                            <strong>Position:</strong> {employees[selectedSalary.employeeNumber].position}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="col-6 text-end">
                      <h5>Salary Reference</h5>
                      <p><strong>Slip ID:</strong> {selectedSalary._id.substring(0, 8)}</p>
                      <p><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="slip-financial-info mb-4">
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
                        <td>{parseFloat(selectedSalary.GrossSalary).toFixed(2)}</td>
                        <td>Total Deductions</td>
                        <td>{parseFloat(selectedSalary.TotalDeducation).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Allowances</td>
                        <td>0.00</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td><strong>TOTAL:</strong></td>
                        <td><strong>{parseFloat(selectedSalary.GrossSalary).toFixed(2)}</strong></td>
                        <td><strong>TOTAL:</strong></td>
                        <td><strong>{parseFloat(selectedSalary.TotalDeducation).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div className="slip-summary">
                  <div className="card bg-light p-3">
                    <div className="d-flex justify-content-between">
                      <h4>Net Salary:</h4>
                      <h4><strong>{parseFloat(selectedSalary.NetSalary).toFixed(2)} RWF</strong></h4>
                    </div>
                    <div className="text-center mt-3">
                      <p><em>This is a computer-generated document. No signature required.</em></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSlipModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrintSlip}>
            <FaPrint className="me-1" /> Print Slip
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SalaryList;
