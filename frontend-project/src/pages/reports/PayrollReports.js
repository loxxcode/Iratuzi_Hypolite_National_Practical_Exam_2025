import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaDownload, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import axios from 'axios';
// We're using direct API calls instead of endpoints
// import { ENDPOINTS, getAuthHeader } from '../../config/api';
import { toast } from 'react-toastify';

const PayrollReports = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [stats, setStats] = useState({
    totalPayrolls: 0,
    totalAmount: 0,
    avgAmount: 0,
    monthlyDistribution: {},
    departmentDistribution: {}
  });
  
  // Sample data generation functions removed - using real API data only

  useEffect(() => {
    const fetchData = async () => {
      let payrollData = [];
      let employeeData = [];
      let departmentData = [];
      
      try {
        console.log('Fetching data for payroll reports...');
        const token = localStorage.getItem('token');
        
        // Helper function to handle API responses consistently
        const handleApiResponse = (response, dataPath) => {
          if (!response || !response.data) return [];
          
          // Handle different API response formats
          if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            return response.data;
          } else if (response.data && response.data.payrolls && Array.isArray(response.data.payrolls)) {
            return response.data.payrolls;
          } else if (response.data && !Array.isArray(response.data) && typeof response.data === 'object') {
            return [response.data];
          }
          
          return [];
        };
        
        // Fetch payroll data with department filter
        try {
          console.log('Fetching payroll data...');
          const apiUrl = 'http://localhost:5000/api/payrolls';
          const queryParams = new URLSearchParams();
          
          if (departmentFilter !== 'all') {
            queryParams.append('department', departmentFilter);
          }
          
          const url = `${apiUrl}?${queryParams.toString()}`;
          console.log('Making request to:', url);
          
          const res = await axios.get(url, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (res.status === 200) {
            payrollData = handleApiResponse(res, 'data');
            console.log('Processed payroll data:', payrollData.length, 'records');
          }
        } catch (payrollError) {
          console.error('Error fetching payroll data:', payrollError);
          toast.error('Failed to load payroll data');
        }
        
        // Fetch department data
        try {
          console.log('Fetching department data...');
          const deptRes = await axios.get('http://localhost:5000/api/departments', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          departmentData = handleApiResponse(deptRes, 'data');
          console.log('Processed department data:', departmentData.length, 'records');
        } catch (deptError) {
          console.error('Error fetching department data:', deptError);
          toast.error('Failed to load department data');
        }
        
        // Set fetched data to state
        setPayrolls(payrollData);
        setFilteredPayrolls(payrollData);
        setDepartments(departmentData);
        
        // Calculate initial stats
        calculateStats(payrollData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error in main PayrollReports fetch:', error);
        toast.error('Failed to load report data');
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentFilter]);

  useEffect(() => {
    filterPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, year, month, startDate, endDate, departmentFilter, payrolls]);

  const calculateStats = (payrollData) => {
    console.log('Calculating stats for', payrollData.length, 'payroll records');
    
    // Basic stats
    const totalAmount = payrollData.reduce((sum, p) => {
      const amount = parseFloat(p.netSalary || p.amount || p.totalAmount || 0);
      return sum + amount;
    }, 0);
    
    const avgAmount = payrollData.length > 0 ? totalAmount / payrollData.length : 0;
    
    // Monthly distribution
    const monthlyDist = {};
    payrollData.forEach(p => {
      // Try to get date from multiple possible fields
      const dateStr = p.date || p.createdAt || p.paymentDate || p.payPeriod;
      if (!dateStr) return; // Skip if no date field found
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthYear = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!monthlyDist[monthYear]) {
        monthlyDist[monthYear] = {
          count: 0,
          amount: 0,
          label: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
      }
      
      monthlyDist[monthYear].count += 1;
      monthlyDist[monthYear].amount += parseFloat(p.netSalary || 0);
    });
    
    // Department distribution
    const deptDist = {};
    payrollData.forEach(p => {
      // If payroll has employee with department info
      let deptId = null;
      let deptName = 'Unknown';
      
      // Case 1: Department directly on payroll
      if (p.departmentId) {
        deptId = p.departmentId;
      }
      // Case 2: Employee object embedded with department info
      else if (p.employee && typeof p.employee === 'object') {
        if (p.employee.departmentId) {
          deptId = p.employee.departmentId;
        } else if (p.employee.departmentcode) {
          // Try to find department by code
          const dept = departments.find(d => d.DepartementCode === p.employee.departmentcode);
          if (dept) {
            deptId = dept._id || dept.id;
            deptName = dept.name || dept.DepartmentName;
          }
        }
      } 
      // Case 3: employeeId reference - need to look up the employee
      else if (p.employeeId) {
        const employee = employees.find(e => e._id === p.employeeId || e.id === p.employeeId);
        if (employee) {
          if (employee.departmentId) {
            deptId = employee.departmentId;
          } else if (employee.departmentcode) {
            // Try to find department by code
            const dept = departments.find(d => d.DepartementCode === employee.departmentcode);
            if (dept) {
              deptId = dept._id || dept.id;
              deptName = dept.name || dept.DepartmentName;
            }
          }
        }
      }
      
      if (deptId) {
        if (!deptDist[deptId]) {
          // If we haven't set deptName yet, look it up
          if (deptName === 'Unknown') {
            const dept = departments.find(d => d._id === deptId || d.id === deptId);
            if (dept) {
              deptName = dept.name || dept.DepartmentName;
            }
          }
          
          deptDist[deptId] = {
            count: 0,
            amount: 0,
            name: deptName
          };
        }
        
        deptDist[deptId].count += 1;
        deptDist[deptId].amount += parseFloat(p.netSalary || 0);
      }
    });
    
    setStats({
      totalPayrolls: payrollData.length,
      totalAmount,
      avgAmount,
      monthlyDistribution: monthlyDist,
      departmentDistribution: deptDist
    });
  };

  const filterPayrolls = () => {
    if (payrolls.length === 0) {
      console.log('No payrolls to filter');
      setFilteredPayrolls([]);
      calculateStats([]);
      return;
    }
    
    console.log('Filtering payrolls. Total payrolls:', payrolls.length);
    let filtered = [...payrolls];
    
    // Apply report type filter
    if (reportType === 'monthly') {
      console.log(`Filtering for month: ${month}, year: ${year}`);
      filtered = filtered.filter(p => {
        const dateStr = p.date || p.createdAt || p.paymentDate || p.payPeriod;
        if (!dateStr) return false;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return false;
        
        return date.getMonth() + 1 === parseInt(month) && 
               date.getFullYear() === parseInt(year);
      });
    } else if (reportType === 'custom') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(p => {
        const dateStr = p.date || p.createdAt || p.paymentDate || p.payPeriod;
        if (!dateStr) return false;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return false;
        
        return date >= start && date <= end;
      });
    } else if (reportType === 'yearly') {
      filtered = filtered.filter(p => {
        const dateStr = p.date || p.createdAt || p.paymentDate || p.payPeriod;
        if (!dateStr) return false;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return false;
        
        return date.getFullYear() === parseInt(year);
      });
    }
    
    setFilteredPayrolls(filtered);
    calculateStats(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
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

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    
    return years.map(year => (
      <option key={year} value={year}>{year}</option>
    ));
  };
  
  const getStatisticsData = () => {
    if (reportType === 'monthly' || reportType === 'custom') {
      // For monthly or custom date range, show department distribution
      const departmentStats = Object.values(stats.departmentDistribution)
        .map(d => ({
          name: d.name,
          amount: d.amount,
          count: d.count,
          percentage: stats.totalAmount > 0 ? (d.amount / stats.totalAmount) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
      
      return {
        type: 'department',
        data: departmentStats
      };
    } else {
      // For yearly, show monthly distribution
      const monthlyStats = Object.values(stats.monthlyDistribution)
        .filter(m => m.label.includes(year))
        .map(m => ({
          label: m.label,
          amount: m.amount,
          count: m.count,
          percentage: stats.totalAmount > 0 ? (m.amount / stats.totalAmount) * 100 : 0
        }))
        .sort((a, b) => {
          const aDate = new Date(a.label);
          const bDate = new Date(b.label);
          return aDate - bDate;
        });
      
      return {
        type: 'monthly',
        data: monthlyStats
      };
    }
  };

  const getReportTitle = () => {
    if (reportType === 'monthly') {
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
      return `Payroll Report: ${monthName} ${year}`;
    } else if (reportType === 'yearly') {
      return `Annual Payroll Report: ${year}`;
    } else {
      return `Custom Payroll Report: ${formatDate(startDate)} to ${formatDate(endDate)}`;
    }
  };
  
  const generateExport = () => {
    try {
      // Show a message about the missing dependencies
      toast.info('PDF/Excel export requires additional libraries.');
      
      // Provide the data that would be in the export
      console.log('Report data for: ' + getReportTitle());
      console.log('Total Payrolls:', stats.totalPayrolls);
      console.log('Total Amount:', formatCurrency(stats.totalAmount));
      console.log('Average Payroll:', formatCurrency(stats.avgAmount));
      
      // Show an alternative method for exporting
      const exportData = {
        title: getReportTitle(),
        generatedOn: new Date().toLocaleDateString(),
        summary: {
          totalPayrolls: stats.totalPayrolls,
          totalAmount: stats.totalAmount,
          avgAmount: stats.avgAmount
        },
        payrolls: filteredPayrolls.map(payroll => {
          // Find employee info if available
          let employeeName = "N/A";
          let departmentName = "N/A";
          
          if (payroll.employeeId) {
            const employee = employees.find(e => e.id === payroll.employeeId || e._id === payroll.employeeId);
            if (employee) {
              employeeName = `${employee.firstName || employee.FirstName || ''} ${employee.lastName || employee.LastName || ''}`;
              
              // Find department if available using departmentcode
              if (employee.departmentcode) {
                const department = departments.find(d => 
                  d.DepartementCode === employee.departmentcode
                );
                
                if (department) {
                  departmentName = department.name || department.DepartmentName;
                }
              }
            }
          }
          
          return {
            id: payroll.payrollId || payroll._id || payroll.id || "N/A",
            date: formatDate(payroll.date || payroll.createdAt),
            employee: employeeName,
            department: departmentName,
            amount: formatCurrency(payroll.totalAmount || payroll.netSalary || 0),
            status: payroll.status || "N/A"
          };
        })
      };
      
      // Log the export data
      console.log('Export Data:', exportData);
      
      // Offer alternative approach
      toast.success('Report data is available in browser console');
    } catch (error) {
      console.error('Error generating report data:', error);
      toast.error('Failed to generate report data');
    }
  };
  
  const renderFilterForm = () => {
    return (
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0 d-flex align-items-center">
            <FaFilter className="me-2" /> Report Filters
          </h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="monthly">Monthly Report</option>
                    <option value="yearly">Annual Report</option>
                    <option value="custom">Custom Date Range</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {reportType === 'monthly' && (
                <>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Month</Form.Label>
                      <Form.Select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      >
                        {getMonthOptions()}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Form.Select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      >
                        {getYearOptions()}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </>
              )}
              
              {reportType === 'yearly' && (
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {getYearOptions()}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              
              {reportType === 'custom' && (
                <>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
              
              <Col md={reportType === 'monthly' ? 12 : 4}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option 
                        key={dept._id || dept.id} 
                        value={dept.DepartementCode}
                      >
                        {dept.name || dept.DepartmentName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    );
  };
  
  const renderSummaryCards = () => {
    return (
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaCalendarAlt className="text-primary mb-3" size={30} />
              <h5>Report Period</h5>
              <h4>{reportType === 'monthly' 
                ? new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
                : (reportType === 'yearly' 
                  ? year 
                  : `${formatDate(startDate)} - ${formatDate(endDate)}`)}
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaMoneyBillWave className="text-success mb-3" size={30} />
              <h5>Total Payroll</h5>
              <h4>{formatCurrency(stats.totalAmount)}</h4>
              <p className="text-muted mb-0">{stats.totalPayrolls} payroll records</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <FaDownload className="text-info mb-3" size={30} />
              <h5>Export Report</h5>
              <Button 
                variant="primary" 
                className="mt-2"
                onClick={generateExport}
                disabled={filteredPayrolls.length === 0}
              >
                <FaDownload className="me-2" /> Export Data
              </Button>
              <p className="small text-muted mt-2">Data will be logged to console</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  const renderStatistics = () => {
    const statisticsData = getStatisticsData();
    
    if (!statisticsData || !statisticsData.data || statisticsData.data.length === 0) {
      return (
        <Alert variant="info">
          No data available for the selected filters.
        </Alert>
      );
    }
    
    return (
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                {statisticsData.type === 'monthly' ? 'Monthly Payroll Distribution' : 'Department Payroll Distribution'}
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{statisticsData.type === 'monthly' ? 'Month' : 'Department'}</th>
                      <th className="text-end">Amount</th>
                      <th className="text-end">Count</th>
                      <th className="text-end">Percentage</th>
                      <th>Visualization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statisticsData.data.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{statisticsData.type === 'monthly' ? item.label : item.name}</td>
                        <td className="text-end">{formatCurrency(item.amount)}</td>
                        <td className="text-end">{item.count}</td>
                        <td className="text-end">{item.percentage.toFixed(2)}%</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="bg-primary" 
                              style={{ 
                                width: `${Math.max(item.percentage, 3)}%`, 
                                height: '20px',
                                borderRadius: '4px'
                              }}
                            ></div>
                            <span className="ms-2">{item.percentage.toFixed(2)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-active">
                      <th colSpan="2">Total</th>
                      <th className="text-end">{formatCurrency(stats.totalAmount)}</th>
                      <th className="text-end">{stats.totalPayrolls}</th>
                      <th className="text-end">100%</th>
                      <th></th>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  const renderPayrollTable = () => {
    return (
      <Card>
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Payroll Records</h5>
            <span className="badge bg-light text-dark">{filteredPayrolls.length} Records</span>
          </div>
        </Card.Header>
        <Card.Body>
          {filteredPayrolls.length === 0 ? (
            <Alert variant="info">
              No payroll records found for the selected criteria.
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Payroll ID</th>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map(payroll => {
                  // Find employee info if available
                  let employeeName = "N/A";
                  let departmentName = "N/A";
                  let payrollId = payroll._id || payroll.id || "N/A";
                  let payrollDate = "N/A";
                  let payrollAmount = 0;
                  
                  // Handle different date formats
                  if (payroll.month && payroll.year) {
                    payrollDate = `${payroll.month}/${payroll.year}`;
                  } else if (payroll.date) {
                    payrollDate = formatDate(payroll.date);
                  } else if (payroll.createdAt) {
                    payrollDate = formatDate(payroll.createdAt);
                  } else if (payroll.paymentDate) {
                    payrollDate = formatDate(payroll.paymentDate);
                  }
                  
                  // Handle different salary amount fields
                  payrollAmount = parseFloat(payroll.netSalary || 0);
                  
                  // Case 1: Employee object is embedded
                  if (payroll.employee && typeof payroll.employee === 'object') {
                    employeeName = `${payroll.employee.FirstName || ''} ${payroll.employee.LastName || ''}`;
                    
                    // Get department for embedded employee using departmentcode
                    if (payroll.employee.departmentcode) {
                      const department = departments.find(d => 
                        d.DepartementCode === payroll.employee.departmentcode
                      );
                      if (department) {
                        departmentName = department.name || department.DepartmentName;
                      }
                    }
                  }
                  // Case 2: Employee ID reference
                  else if (payroll.employeeId) {
                    const employee = employees.find(e => e.id === payroll.employeeId || e._id === payroll.employeeId);
                    if (employee) {
                      employeeName = `${employee.FirstName || ''} ${employee.LastName || ''}`;
                      
                      // Find department if available using departmentcode
                      if (employee.departmentcode) {
                        const department = departments.find(d => 
                          d.DepartementCode === employee.departmentcode
                        );
                        
                        if (department) {
                          departmentName = department.name || department.DepartmentName;
                        }
                      }
                    }
                  }
                  // Case 3: Employee number as string
                  else if (payroll.employee && typeof payroll.employee === 'string') {
                    // Try to find the employee by ID or number
                    const employee = employees.find(e => 
                      e.id === payroll.employee || 
                      e._id === payroll.employee || 
                      e.employeeNumber === payroll.employee ||
                      e.employeeId === payroll.employee
                    );
                    
                    if (employee) {
                      employeeName = `${employee.firstName || employee.FirstName || ''} ${employee.lastName || employee.LastName || ''}`;
                      
                      // Get department info
                      if (employee.departmentId || employee.departmentcode) {
                        const department = departments.find(d => 
                          d.id === employee.departmentId || 
                          d._id === employee.departmentId ||
                          d.DepartementCode === employee.departmentcode
                        );
                        
                        if (department) {
                          departmentName = department.name || department.DepartmentName;
                        }
                      }
                    } else {
                      employeeName = `Employee #${payroll.employee}`;
                    }
                  }
                  
                  return (
                    <tr key={payrollId}>
                      <td>{payrollId}</td>
                      <td>{payrollDate}</td>
                      <td>{employeeName}</td>
                      <td>{departmentName}</td>
                      <td className="text-end">{formatCurrency(payrollAmount)}</td>
                      <td>
                        <span className={`badge ${payroll.status === 'pending' ? 'bg-warning' : (payroll.status === 'processed' ? 'bg-success' : 'bg-secondary')}`}>
                          {payroll.status || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/payrolls/view/${payrollId}`} className="btn btn-sm btn-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <h3>Loading payroll report data...</h3>
          <div className="spinner-border mt-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>{getReportTitle()}</h2>
            <Link to="/reports" className="btn btn-outline-secondary">
              <FaArrowLeft className="me-2" /> Back to Reports
            </Link>
          </div>
        </Col>
      </Row>

      {renderFilterForm()}
      {renderSummaryCards()}
      {renderStatistics()}
      {renderPayrollTable()}
    </Container>
  );
};

export default PayrollReports;
