import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaUsers, FaBuilding, FaVenusMars } from 'react-icons/fa';
import axios from 'axios';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import { toast } from 'react-toastify';

const EmployeeReports = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesRes = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        setEmployees(employeesRes.data.data);
        
        // Fetch departments
        const departmentsRes = await axios.get(ENDPOINTS.DEPARTMENTS.BASE, getAuthHeader());
        setDepartments(departmentsRes.data.data);
        
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load report data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistical data for reports
  const calculateStats = () => {
    if (!employees || employees.length === 0) return null;
    
    // Filter employees based on report type
    let filteredEmployees = [...employees];
    let reportTitle = "All Employees";
    
    // Apply filters based on reportType
    if (reportType === 'department' && departments.length > 0) {
      // Group employees by department for department view
      const departmentGroups = {};
      
      // Create groups for each department
      departments.forEach(dept => {
        departmentGroups[dept.DepartementCode] = {
          name: dept.DepartmentName,
          employees: employees.filter(emp => emp.departmentcode === dept.DepartementCode)
        };
      });
      
      reportTitle = "Employees by Department";
    } else if (reportType === 'position') {
      // Group employees by position for position view
      const positionGroups = {};
      
      // Identify all positions
      employees.forEach(emp => {
        if (emp.Position && !positionGroups[emp.Position]) {
          positionGroups[emp.Position] = {
            employees: employees.filter(e => e.Position === emp.Position)
          };
        }
      });
      
      reportTitle = "Employees by Position";
    }
    
    // Gender distribution
    const genderData = {
      male: filteredEmployees.filter(emp => emp.Gender === 'male').length,
      female: filteredEmployees.filter(emp => emp.Gender === 'female').length,
      other: filteredEmployees.filter(emp => emp.Gender === 'other').length,
      total: filteredEmployees.length
    };
    
    // Calculate percentages
    genderData.malePercent = (genderData.male / genderData.total) * 100 || 0;
    genderData.femalePercent = (genderData.female / genderData.total) * 100 || 0;
    genderData.otherPercent = (genderData.other / genderData.total) * 100 || 0;
    
    // Department distribution
    const departmentData = {};
    const departmentTotals = { total: filteredEmployees.length };
    
    filteredEmployees.forEach(emp => {
      if (emp.departmentcode) {
        if (departmentData[emp.departmentcode]) {
          departmentData[emp.departmentcode]++;
        } else {
          departmentData[emp.departmentcode] = 1;
        }
      }
    });
    
    // Calculate department percentages
    Object.keys(departmentData).forEach(dept => {
      departmentTotals[dept + 'Percent'] = (departmentData[dept] / departmentTotals.total) * 100 || 0;
    });
    
    // Position distribution
    const positionData = {};
    const positionTotals = { total: filteredEmployees.length };
    
    filteredEmployees.forEach(emp => {
      if (emp.Position) {
        if (positionData[emp.Position]) {
          positionData[emp.Position]++;
        } else {
          positionData[emp.Position] = 1;
        }
      }
    });
    
    // Sort positions by count and take top 10
    const topPositions = Object.entries(positionData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    
    // Calculate position percentages
    Object.keys(topPositions).forEach(pos => {
      positionTotals[pos + 'Percent'] = (topPositions[pos] / positionTotals.total) * 100 || 0;
    });
    
    return {
      reportTitle,
      filteredEmployees,
      gender: genderData,
      departments: {
        data: departmentData,
        totals: departmentTotals
      },
      positions: {
        data: topPositions,
        totals: positionTotals
      }
    };
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading report data...</h3></div>;

  return (
    <Container className="employee-reports">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              {calculateStats() ? calculateStats().reportTitle : "Employee Reports"}
            </h2>
            <div>
              <Link to="/reports" className="btn btn-secondary me-2">
                <FaArrowLeft className="me-2" /> Back to Reports
              </Link>
              <Button variant="primary" onClick={handlePrintReport}>
                <FaFilePdf className="me-2" /> Print Report
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Report Type</Form.Label>
            <Form.Select
              value={reportType}
              onChange={handleReportTypeChange}
            >
              <option value="all">All Employees</option>
              <option value="department">By Department</option>
              <option value="position">By Position</option>
              <option value="gender">By Gender</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Card className="border-left-primary shadow h-100 py-2">
            <Card.Body>
              <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                Total Employees
              </div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">
                {employees.length}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Gender Distribution</span>
              <FaVenusMars />
            </Card.Header>
            <Card.Body>
              <div>
                {calculateStats() && (
                  <>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Male ({calculateStats().gender.male})</span>
                        <span>{calculateStats().gender.malePercent.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        variant="primary" 
                        now={calculateStats().gender.malePercent} 
                        className="mb-3" 
                      />
                      
                      <div className="d-flex justify-content-between mb-1">
                        <span>Female ({calculateStats().gender.female})</span>
                        <span>{calculateStats().gender.femalePercent.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        variant="success" 
                        now={calculateStats().gender.femalePercent} 
                        className="mb-3" 
                      />
                      
                      <div className="d-flex justify-content-between mb-1">
                        <span>Other ({calculateStats().gender.other})</span>
                        <span>{calculateStats().gender.otherPercent.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        variant="info" 
                        now={calculateStats().gender.otherPercent} 
                        className="mb-3" 
                      />
                    </div>
                    <div className="text-center mt-3">
                      <h4>Total Employees: {calculateStats().gender.total}</h4>
                    </div>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Top Positions</span>
              <FaUsers />
            </Card.Header>
            <Card.Body>
              <div>
                {calculateStats() && (
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Position</th>
                        <th>Count</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(calculateStats().positions.data).map(([position, count]) => (
                        <tr key={position}>
                          <td>{position}</td>
                          <td>{count}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {((count / calculateStats().positions.totals.total) * 100).toFixed(1)}%
                              </div>
                              <ProgressBar 
                                now={(count / calculateStats().positions.totals.total) * 100} 
                                style={{ width: '100px', height: '10px' }} 
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Department Distribution</span>
              <FaBuilding />
            </Card.Header>
            <Card.Body>
              <div>
                {calculateStats() && (
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Department Code</th>
                        <th>Department Name</th>
                        <th>Employee Count</th>
                        <th>Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(calculateStats().departments.data).map(([deptCode, count]) => {
                        const deptName = departments.find(d => d.DepartementCode === deptCode)?.DepartmentName || deptCode;
                        return (
                          <tr key={deptCode}>
                            <td>{deptCode}</td>
                            <td>{deptName}</td>
                            <td>{count}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  {((count / calculateStats().departments.totals.total) * 100).toFixed(1)}%
                                </div>
                                <ProgressBar 
                                  variant="primary"
                                  now={(count / calculateStats().departments.totals.total) * 100} 
                                  style={{ width: '200px', height: '10px' }} 
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {reportType === 'department' && calculateStats() && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>Employees by Department</Card.Header>
              <Card.Body>
                {departments.map(dept => {
                  const deptEmployees = employees.filter(emp => emp.departmentcode === dept.DepartementCode);
                  if (deptEmployees.length === 0) return null;
                  
                  return (
                    <div key={dept.DepartementCode} className="mb-4">
                      <h5>{dept.DepartmentName} ({deptEmployees.length} employees)</h5>
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Position</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deptEmployees.map(employee => (
                            <tr key={employee._id}>
                              <td>{employee.employeeNumber}</td>
                              <td>{employee.FirstName} {employee.LastName}</td>
                              <td>{employee.Gender}</td>
                              <td>{employee.Position}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {reportType === 'position' && calculateStats() && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>Employees by Position</Card.Header>
              <Card.Body>
                {Object.entries(calculateStats().positions.data).map(([position]) => {
                  const positionEmployees = employees.filter(emp => emp.Position === position);
                  
                  return (
                    <div key={position} className="mb-4">
                      <h5>{position} ({positionEmployees.length} employees)</h5>
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Department</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positionEmployees.map(employee => {
                            const department = departments.find(d => d.DepartementCode === employee.departmentcode);
                            return (
                              <tr key={employee._id}>
                                <td>{employee.employeeNumber}</td>
                                <td>{employee.FirstName} {employee.LastName}</td>
                                <td>{employee.Gender}</td>
                                <td>{department ? department.DepartmentName : 'N/A'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {reportType === 'all' && (
        <Row>
          <Col>
            <Card>
              <Card.Header>Employee List</Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Position</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(employee => {
                        const department = departments.find(d => d.DepartementCode === employee.departmentcode);
                        return (
                          <tr key={employee._id}>
                            <td>{employee.employeeNumber}</td>
                            <td>{employee.FirstName} {employee.LastName}</td>
                            <td>{employee.Gender}</td>
                            <td>{employee.Position}</td>
                            <td>{department ? department.DepartmentName : 'N/A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default EmployeeReports;
