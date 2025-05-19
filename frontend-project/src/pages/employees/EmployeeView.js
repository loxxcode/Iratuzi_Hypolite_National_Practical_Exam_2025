import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaMoneyBill } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch employee details
        const empRes = await axios.get(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setEmployee(empRes.data.data);
        
        // Fetch employee salaries
        try {
          const salaryRes = await axios.get(`http://localhost:5000/api/salaries/employee/${empRes.data.data.employeeNumber}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setSalaries(salaryRes.data.data);
        } catch (err) {
          console.error('Error fetching salary data:', err);
          // Don't show error toast for salaries, just set empty array
          setSalaries([]);
        }
        
        setLoading(false);
      } catch (error) {
        setError('Error fetching employee data. Please try again.');
        setLoading(false);
        toast.error('Failed to load employee data');
      }
    };
    
    fetchEmployeeData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading employee data...</h3></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;
  if (!employee) return <div className="text-center mt-5"><h3>Employee not found</h3></div>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employee Details</h2>
        <div>
          <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Back
          </Button>
          <Link to={`/employees/edit/${id}`} className="btn btn-primary">
            <FaEdit className="me-2" /> Edit
          </Link>
        </div>
      </div>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Personal Information</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Employee Number:</strong> {employee.employeeNumber}</p>
                  <p><strong>Name:</strong> {employee.FirstName} {employee.LastName}</p>
                  <p><strong>Gender:</strong> {employee.Gender ? employee.Gender.charAt(0).toUpperCase() + employee.Gender.slice(1) : 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Position:</strong> {employee.Position}</p>
                  <p><strong>Hired Date:</strong> {formatDate(employee.hiredDate)}</p>
                  <p><strong>Telephone:</strong> {employee.Telephone || 'N/A'}</p>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <p><strong>Address:</strong> {employee.Address || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Quick Actions</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to="/salaries/add" className="btn btn-success">
                  <FaMoneyBill className="me-2" /> Generate Salary
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Card.Header>
          <h4 className="mb-0">Salary History</h4>
        </Card.Header>
        <Card.Body>
          {salaries.length === 0 ? (
            <div className="text-center p-4">
              <p>No salary records found for this employee.</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
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
                    <td>{getMonthName(salary.month)}</td>
                    <td>${parseFloat(salary.GrossSalary).toFixed(2)}</td>
                    <td>${parseFloat(salary.TotalDeducation).toFixed(2)}</td>
                    <td>${parseFloat(salary.NetSalary).toFixed(2)}</td>
                    <td>
                      <Link to={`/salaries/view/${salary._id}`} className="btn btn-info btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployeeView;
