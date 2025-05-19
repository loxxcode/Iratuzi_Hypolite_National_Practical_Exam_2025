import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const DepartmentView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentAndEmployees = async () => {
      try {
        // Fetch department details
        const deptRes = await axios.get(`${ENDPOINTS.DEPARTMENTS.DETAIL(id)}`, getAuthHeader());
        setDepartment(deptRes.data.data);
        
        // Fetch all employees to find ones in this department
        const empRes = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        
        // Filter employees that belong to this department
        const departmentEmployees = empRes.data.data.filter(
          emp => emp.departmentcode === deptRes.data.data.DepartementCode
        );
        
        setEmployees(departmentEmployees);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load department details');
        setLoading(false);
        navigate('/departments');
      }
    };

    fetchDepartmentAndEmployees();
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/departments');
  };

  const handleEdit = () => {
    navigate(`/departments/edit/${id}`);
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading...</h3></div>;
  if (!department) return <div className="text-center mt-5 text-danger"><h3>Department not found</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Department Details</h2>
            <div>
              <Button variant="secondary" className="me-2" onClick={handleBack}>
                <FaArrowLeft className="me-2" /> Back to List
              </Button>
              <Button variant="primary" onClick={handleEdit}>
                <FaEdit className="me-2" /> Edit Department
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header as="h5">Department Information</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Department Code:</strong> {department.DepartementCode}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Department Name:</strong> {department.DepartmentName}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Gross Salary:</strong> {department.GrossSalary?.toFixed(2)} RWF
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Total Deduction:</strong> {department.TotalDeduction?.toFixed(2)} RWF
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Net Salary:</strong> {(department.GrossSalary - department.TotalDeduction)?.toFixed(2)} RWF
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Created:</strong> {new Date(department.createdAt).toLocaleString()}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Last Updated:</strong> {new Date(department.updatedAt).toLocaleString()}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header as="h5">Employees in Department</Card.Header>
            <Card.Body>
              {employees.length === 0 ? (
                <p className="text-muted">No employees assigned to this department yet.</p>
              ) : (
                <ListGroup variant="flush">
                  {employees.map(employee => (
                    <ListGroup.Item key={employee._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div>{employee.FirstName} {employee.LastName}</div>
                        <small className="text-muted">{employee.Position}</small>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline-info"
                        onClick={() => navigate(`/employees/view/${employee._id}`)}
                      >
                        View
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartmentView;
