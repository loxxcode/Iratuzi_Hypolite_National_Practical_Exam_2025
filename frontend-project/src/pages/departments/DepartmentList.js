import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/departments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDepartments(res.data.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching departments. Please try again.');
        setLoading(false);
        toast.error('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/departments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDepartments(departments.filter(department => department._id !== id));
        toast.success('Department deleted successfully');
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading departments...</h3></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h3>{error}</h3></div>;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Department List</h2>
        </Col>
        <Col className="text-end">
          <Link to="/departments/add">
            <Button variant="primary">
              <FaPlus className="me-2" /> Add Department
            </Button>
          </Link>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {departments.length === 0 ? (
            <div className="text-center p-5">
              <h4>No departments found</h4>
              <p>Add your first department to get started</p>
            </div>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Department Code</th>
                  <th>Department Name</th>
                  <th>Gross Salary</th>
                  <th>Total Deduction</th>
                  <th>Net Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(department => (
                  <tr key={department._id}>
                    <td>{department.DepartementCode}</td>
                    <td>{department.DepartmentName}</td>
                    <td>{department.GrossSalary ? department.GrossSalary.toFixed(2) : '0.00'}rwf</td>
                    <td>{department.TotalDeduction ? department.TotalDeduction.toFixed(2) : '0.00'}rwf</td>
                    <td>{(department.GrossSalary - (department.TotalDeduction || 0)).toFixed(2)}rwf</td>
                    <td>
                      <Link to={`/departments/view/${department._id}`} className="btn btn-info btn-sm me-2">
                        <FaEye /> View
                      </Link>
                      <Link to={`/departments/edit/${department._id}`} className="btn btn-warning btn-sm me-2">
                        <FaEdit /> Edit
                      </Link>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(department._id)}>
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

export default DepartmentList;
