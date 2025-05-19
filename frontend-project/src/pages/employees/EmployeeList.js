import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Using centralized API configuration
        const res = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        setEmployees(res.data.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching employees. Please try again.');
        setLoading(false);
        toast.error('Failed to load employees');
      }
    };

    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        // Using centralized API configuration
        await axios.delete(`${ENDPOINTS.EMPLOYEES.DETAIL(id)}`, getAuthHeader());
        setEmployees(employees.filter(employee => employee._id !== id));
        toast.success('Employee deleted successfully');
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading employees...</h3></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Employee List</h2>
        </Col>
        <Col className="text-end">
          <Link to="/employees/add">
            <Button variant="primary">
              <FaPlus className="me-2" /> Add Employee
            </Button>
          </Link>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {employees.length === 0 ? (
            <div className="text-center p-5">
              <h4>No employees found</h4>
              <p>Add your first employee to get started</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Employee Number</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Gender</th>
                  <th>Telephone</th>
                  <th>Hire Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee._id}>
                    <td>{employee.employeeNumber}</td>
                    <td>{employee.FirstName} {employee.LastName}</td>
                    <td>{employee.Position}</td>
                    <td>{employee.Gender}</td>
                    <td>{employee.Telephone}</td>
                    <td>{new Date(employee.hiredDate).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/employees/view/${employee._id}`} className="btn btn-info btn-sm me-2">
                        <FaEye /> View
                      </Link>
                      <Link to={`/employees/edit/${employee._id}`} className="btn btn-warning btn-sm me-2">
                        <FaEdit /> Edit
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(employee._id)}>
                        <FaTrash /> Delete
                      </Button>
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

export default EmployeeList;
