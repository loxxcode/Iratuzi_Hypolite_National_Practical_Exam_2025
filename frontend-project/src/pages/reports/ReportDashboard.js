import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaMoneyBill, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';

const ReportDashboard = () => {
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>
            <FaChartLine className="me-2" />
            EPMS Reports Dashboard
          </h2>
          <p className="text-muted">
            Generate comprehensive reports for employees, departments, and salaries
          </p>
        </Col>
      </Row>

      <Row>
        <Col md={3} className="mb-4">
          <Card as={Link} to="/reports/employees" className="h-100 text-decoration-none">
            <Card.Body className="text-center">
              <FaUsers className="mb-3" style={{ fontSize: '3rem', color: '#4e73df' }} />
              <Card.Title>Employee Reports</Card.Title>
              <Card.Text>
                View employee distribution by department, position, and gender
              </Card.Text>
            </Card.Body>
            <Card.Footer className="text-center bg-light">
              <small className="text-muted">View Employee Reports</small>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card as={Link} to="/reports/departments" className="h-100 text-decoration-none">
            <Card.Body className="text-center">
              <FaBuilding className="mb-3" style={{ fontSize: '3rem', color: '#1cc88a' }} />
              <Card.Title>Department Reports</Card.Title>
              <Card.Text>
                Analyze departments by employee count, gross salary, and deductions
              </Card.Text>
            </Card.Body>
            <Card.Footer className="text-center bg-light">
              <small className="text-muted">View Department Reports</small>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card as={Link} to="/reports/salaries" className="h-100 text-decoration-none">
            <Card.Body className="text-center">
              <FaMoneyBill className="mb-3" style={{ fontSize: '3rem', color: '#f6c23e' }} />
              <Card.Title>Salary Reports</Card.Title>
              <Card.Text>
                Track salary distribution, net payments, and deduction statistics
              </Card.Text>
            </Card.Body>
            <Card.Footer className="text-center bg-light">
              <small className="text-muted">View Salary Reports</small>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card as={Link} to="/reports/payrolls" className="h-100 text-decoration-none">
            <Card.Body className="text-center">
              <FaMoneyBillWave className="mb-3" style={{ fontSize: '3rem', color: '#36b9cc' }} />
              <Card.Title>Payroll Reports</Card.Title>
              <Card.Text>
                Generate comprehensive payroll reports with charts and filtering options
              </Card.Text>
            </Card.Body>
            <Card.Footer className="text-center bg-light">
              <small className="text-muted">View Payroll Reports</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <Card className="border-left-info shadow h-100 py-2">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col>
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Generate Reports
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    Track your organization's key metrics and performance indicators
                  </div>
                </Col>
                <Col xs="auto">
                  <FaChartLine className="fa-2x text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportDashboard;
