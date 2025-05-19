import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import { toast } from 'react-toastify';

const DepartmentReports = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const departmentsRes = await axios.get(ENDPOINTS.DEPARTMENTS.BASE, getAuthHeader());
        setDepartments(departmentsRes.data.data);
        
        // Fetch employees
        const employeesRes = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        setEmployees(employeesRes.data.data);
        
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load report data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate department statistics
  const calculateStats = () => {
    if (!departments || !employees || departments.length === 0) return null;
    
    // Count employees by department
    const employeeCounts = {};
    const departmentNames = {};
    
    departments.forEach(dept => {
      employeeCounts[dept.DepartementCode] = 0;
      departmentNames[dept.DepartementCode] = dept.DepartmentName;
    });
    
    employees.forEach(emp => {
      if (emp.departmentcode && employeeCounts[emp.departmentcode] !== undefined) {
        employeeCounts[emp.departmentcode]++;
      }
    });
    
    // Calculate salary info by department
    const departmentSalaryInfo = {};
    departments.forEach(dept => {
      departmentSalaryInfo[dept.DepartementCode] = {
        grossSalary: parseFloat(dept.GrossSalary) || 0,
        totalDeduction: parseFloat(dept.TotalDeduction) || 0,
        netSalary: (parseFloat(dept.GrossSalary) || 0) - (parseFloat(dept.TotalDeduction) || 0),
        deductionPercent: ((parseFloat(dept.TotalDeduction) || 0) / (parseFloat(dept.GrossSalary) || 1)) * 100
      };
    });
    
    // Calculate total employees
    const totalEmployees = Object.values(employeeCounts).reduce((sum, count) => sum + count, 0);
    
    // Sort departments by employee count for better display
    const sortedDepartments = Object.keys(employeeCounts)
      .sort((a, b) => employeeCounts[b] - employeeCounts[a])
      .map(deptCode => ({
        code: deptCode,
        name: departmentNames[deptCode],
        employeeCount: employeeCounts[deptCode],
        employeePercent: (employeeCounts[deptCode] / totalEmployees) * 100,
        ...departmentSalaryInfo[deptCode]
      }));
    
    return {
      departments: sortedDepartments,
      totalEmployees: totalEmployees
    };
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) return <div className="text-center mt-5"><h3>Loading report data...</h3></div>;

  return (
    <Container className="department-reports">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Department Reports</h2>
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
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Employee Distribution by Department</span>
              <FaUsers />
            </Card.Header>
            <Card.Body>
              {calculateStats() && (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Department Code</th>
                      <th>Department Name</th>
                      <th>Employee Count</th>
                      <th>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStats().departments.map(dept => (
                      <tr key={dept.code}>
                        <td>{dept.code}</td>
                        <td>{dept.name}</td>
                        <td>{dept.employeeCount}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {dept.employeePercent.toFixed(1)}%
                            </div>
                            <ProgressBar 
                              variant="primary"
                              now={dept.employeePercent} 
                              style={{ width: '200px', height: '10px' }} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">Total Employees:</td>
                      <td colSpan="2" className="fw-bold">{calculateStats().totalEmployees}</td>
                    </tr>
                  </tfoot>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Department Salary Analysis</span>
              <FaMoneyBillWave />
            </Card.Header>
            <Card.Body>
              {calculateStats() && (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Gross Salary (RWF)</th>
                      <th>Deductions (RWF)</th>
                      <th>Net Salary (RWF)</th>
                      <th>Deduction %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStats().departments.map(dept => (
                      <tr key={dept.code}>
                        <td>
                          <div>{dept.name}</div>
                          <small className="text-muted">{dept.code}</small>
                        </td>
                        <td>{dept.grossSalary.toFixed(2)}</td>
                        <td>{dept.totalDeduction.toFixed(2)}</td>
                        <td>{dept.netSalary.toFixed(2)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {dept.deductionPercent.toFixed(1)}%
                            </div>
                            <ProgressBar 
                              variant={dept.deductionPercent < 15 ? "success" : dept.deductionPercent < 25 ? "warning" : "danger"}
                              now={dept.deductionPercent} 
                              style={{ width: '100px', height: '10px' }} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>Department Details</Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Department Code</th>
                      <th>Department Name</th>
                      <th>Employees</th>
                      <th>Gross Salary</th>
                      <th>Total Deduction</th>
                      <th>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(department => {
                      const employeeCount = employees.filter(
                        emp => emp.departmentcode === department.DepartementCode
                      ).length;
                      
                      return (
                        <tr key={department._id}>
                          <td>{department.DepartementCode}</td>
                          <td>{department.DepartmentName}</td>
                          <td>{employeeCount}</td>
                          <td>{department.GrossSalary?.toFixed(2) || '0.00'} RWF</td>
                          <td>{department.TotalDeduction?.toFixed(2) || '0.00'} RWF</td>
                          <td>
                            {((department.GrossSalary || 0) - (department.TotalDeduction || 0)).toFixed(2)} RWF
                          </td>
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
    </Container>
  );
};

export default DepartmentReports;
