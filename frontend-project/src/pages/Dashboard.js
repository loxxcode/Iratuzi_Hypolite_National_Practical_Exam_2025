import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaMoneyBill, FaBuilding } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: 0,
    salaries: 0,
    departments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        // Fetch employees count
        const employeesRes = await axios.get('http://localhost:5000/api/employees', { headers });
        
        // Fetch salaries count
        const salariesRes = await axios.get('http://localhost:5000/api/salaries', { headers });
        
        // Fetch departments count
        const departmentsRes = await axios.get('http://localhost:5000/api/departments', { headers });
        
        setStats({
          employees: employeesRes.data.count || employeesRes.data.data.length,
          salaries: salariesRes.data.count || salariesRes.data.data.length,
          departments: departmentsRes.data.count || departmentsRes.data.data.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h3>Loading dashboard data...</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard</h2>
      
      <Row>
        <Col md={4}>
          <Card className="dashboard-card dashboard-card-employees mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="dashboard-card-title">Total Employees</h5>
                  <h2 className="dashboard-card-number">{stats.employees}</h2>
                </div>
                <FaUsers size={48} opacity={0.7} />
              </div>
              <div className="mt-3">
                <Link to="/employees" className="text-white">View Details &rarr;</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card dashboard-card-departments mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="dashboard-card-title">Total Departments</h5>
                  <h2 className="dashboard-card-number">{stats.departments}</h2>
                </div>
                <FaBuilding size={48} opacity={0.7} />
              </div>
              <div className="mt-3">
                <Link to="/departments" className="text-white">View Details &rarr;</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card dashboard-card-payrolls mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="dashboard-card-title">Salary Records</h5>
                  <h2 className="dashboard-card-number">{stats.salaries}</h2>
                </div>
                <FaMoneyBill size={48} opacity={0.7} />
              </div>
              <div className="mt-3">
                <Link to="/salaries" className="text-white">View Details &rarr;</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                <p>Welcome to the Employee Payroll Management System!</p>
                <p>This dashboard provides an overview of your organization's payroll data.</p>
                <p>Use the sidebar to navigate through different sections of the application.</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Links</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link to="/employees/add">Add New Employee</Link>
                </li>
                <li className="mb-2">
                  <Link to="/departments/add">Add New Department</Link>
                </li>
                <li className="mb-2">
                  <Link to="/salaries/add">Add Salary Record</Link>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

