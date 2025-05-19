import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFilePdf, FaChartBar, FaMoneyBillWave, FaPercentage } from 'react-icons/fa';
import axios from 'axios';
import { ENDPOINTS, getAuthHeader } from '../../config/api';
import { toast } from 'react-toastify';

const SalaryReports = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch salaries
        const salariesRes = await axios.get(ENDPOINTS.SALARIES.BASE, getAuthHeader());
        setSalaries(salariesRes.data.data);
        
        // Fetch employees for reference
        const employeesRes = await axios.get(ENDPOINTS.EMPLOYEES.BASE, getAuthHeader());
        
        // Create lookup table for employees
        const employeeLookup = {};
        employeesRes.data.data.forEach(emp => {
          employeeLookup[emp.employeeNumber] = emp;
        });
        
        setEmployees(employeeLookup);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load report data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1] || monthNumber;
  };

  // Calculate summary statistics for salaries
  const calculateStats = () => {
    if (!salaries || salaries.length === 0) return null;

    // Apply filtering if needed
    let filteredSalaries = salaries;
    if (reportType === 'monthly' && filterMonth) {
      filteredSalaries = salaries.filter(salary => salary.month === filterMonth);
    }

    // Group salaries by month
    const salariesByMonth = {};
    salaries.forEach(salary => { // Always group all salaries for the charts
      if (!salariesByMonth[salary.month]) {
        salariesByMonth[salary.month] = {
          count: 0,
          totalGross: 0,
          totalNet: 0,
          totalDeduction: 0
        };
      }
      
      salariesByMonth[salary.month].count++;
      salariesByMonth[salary.month].totalGross += parseFloat(salary.GrossSalary) || 0;
      salariesByMonth[salary.month].totalNet += parseFloat(salary.NetSalary) || 0;
      salariesByMonth[salary.month].totalDeduction += parseFloat(salary.TotalDeducation) || 0;
    });

    // Sort months
    const sortedMonths = Object.keys(salariesByMonth).sort((a, b) => parseInt(a) - parseInt(b));
    
    return {
      byMonth: salariesByMonth,
      sortedMonths: sortedMonths,
      monthNames: sortedMonths.map(month => getMonthName(month)),
      filteredSalaries: filteredSalaries
    };
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setFilterMonth(e.target.value);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getMonthOptions = () => {
    const months = [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
    
    return months.map(month => (
      <option key={month.value} value={month.value}>{month.label}</option>
    ));
  };

  // Calculate total amounts
  const totalGrossSalary = salaries.reduce((sum, salary) => sum + (parseFloat(salary.GrossSalary) || 0), 0);
  const totalNetSalary = salaries.reduce((sum, salary) => sum + (parseFloat(salary.NetSalary) || 0), 0);
  const totalDeductions = salaries.reduce((sum, salary) => sum + (parseFloat(salary.TotalDeducation) || 0), 0);

  if (loading) return <div className="text-center mt-5"><h3>Loading report data...</h3></div>;

  return (
    <Container className="salary-reports">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Salary Reports</h2>
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
          <Form.Group className="mb-3">
            <Form.Label>Report Type</Form.Label>
            <Form.Select
              value={reportType}
              onChange={handleReportTypeChange}
            >
              <option value="all">All Salaries</option>
              <option value="monthly">By Month</option>
            </Form.Select>
          </Form.Group>
          
          {reportType === 'monthly' && (
            <Form.Group>
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={filterMonth}
                onChange={handleMonthChange}
              >
                <option value="">Select Month</option>
                {getMonthOptions()}
              </Form.Select>
            </Form.Group>
          )}
        </Col>
        <Col md={8}>
          <Row>
            <Col md={4}>
              <Card className="border-left-primary shadow h-100 py-2 mb-4">
                <Card.Body>
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Gross Salary
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalGrossSalary.toFixed(2)} RWF
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-left-success shadow h-100 py-2 mb-4">
                <Card.Body>
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Net Salary
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalNetSalary.toFixed(2)} RWF
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-left-danger shadow h-100 py-2 mb-4">
                <Card.Body>
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                    Total Deductions
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {totalDeductions.toFixed(2)} RWF
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Total Net Salary by Month</span>
              <FaMoneyBillWave />
            </Card.Header>
            <Card.Body>
              <div>
                {calculateStats() && (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Total Net Salary (RWF)</th>
                        <th>Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateStats().sortedMonths.map(month => {
                        const monthlyStat = calculateStats().byMonth[month];
                        const totalNetAllMonths = salaries.reduce(
                          (sum, salary) => sum + (parseFloat(salary.NetSalary) || 0),
                          0
                        );
                        const percentage = (monthlyStat.totalNet / totalNetAllMonths) * 100;
                        
                        return (
                          <tr key={month}>
                            <td>{getMonthName(month)}</td>
                            <td>{monthlyStat.totalNet.toFixed(2)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="me-2">
                                  {percentage.toFixed(1)}%
                                </div>
                                <ProgressBar 
                                  variant="primary"
                                  now={percentage} 
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

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Gross vs Net Salary Comparison</span>
              <FaChartBar />
            </Card.Header>
            <Card.Body>
              {calculateStats() && (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Gross Salary</th>
                      <th>Net Salary</th>
                      <th>Ratio (Net/Gross)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStats().sortedMonths.map(month => {
                      const monthlyStat = calculateStats().byMonth[month];
                      const ratio = (monthlyStat.totalNet / monthlyStat.totalGross) * 100;
                      
                      return (
                        <tr key={month}>
                          <td>{getMonthName(month)}</td>
                          <td>{monthlyStat.totalGross.toFixed(2)} RWF</td>
                          <td>{monthlyStat.totalNet.toFixed(2)} RWF</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {ratio.toFixed(1)}%
                              </div>
                              <ProgressBar 
                                variant={ratio > 80 ? "success" : ratio > 70 ? "warning" : "danger"}
                                now={ratio} 
                                style={{ width: '100px', height: '10px' }} 
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Deduction Analysis</span>
              <FaPercentage />
            </Card.Header>
            <Card.Body>
              {calculateStats() && (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Deductions</th>
                      <th>Deduction %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStats().sortedMonths.map(month => {
                      const monthlyStat = calculateStats().byMonth[month];
                      const deductionPercent = (monthlyStat.totalDeduction / monthlyStat.totalGross) * 100;
                      
                      return (
                        <tr key={month}>
                          <td>{getMonthName(month)}</td>
                          <td>{monthlyStat.totalDeduction.toFixed(2)} RWF</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                {deductionPercent.toFixed(1)}%
                              </div>
                              <ProgressBar 
                                variant={deductionPercent < 15 ? "success" : deductionPercent < 25 ? "warning" : "danger"}
                                now={deductionPercent} 
                                style={{ width: '100px', height: '10px' }} 
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
            <Card.Header>
              {reportType === 'monthly' && filterMonth 
                ? `Salary Details for ${getMonthName(filterMonth)}`
                : 'All Salary Records'
              }
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Month</th>
                      <th>Gross Salary</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateStats() && calculateStats().filteredSalaries.map(salary => (
                      <tr key={salary._id}>
                        <td>
                          {employees[salary.employeeNumber] ? (
                            <>
                              {employees[salary.employeeNumber].FirstName} {employees[salary.employeeNumber].LastName}
                              <div><small className="text-muted">{salary.employeeNumber}</small></div>
                            </>
                          ) : (
                            salary.employeeNumber
                          )}
                        </td>
                        <td>{getMonthName(salary.month)}</td>
                        <td>{parseFloat(salary.GrossSalary).toFixed(2)} RWF</td>
                        <td>{parseFloat(salary.TotalDeducation).toFixed(2)} RWF</td>
                        <td>{parseFloat(salary.NetSalary).toFixed(2)} RWF</td>
                      </tr>
                    ))}
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

export default SalaryReports;
