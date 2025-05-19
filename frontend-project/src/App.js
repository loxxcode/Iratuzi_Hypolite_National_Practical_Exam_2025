import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeAdd from './pages/employees/EmployeeAdd';
import EmployeeEdit from './pages/employees/EmployeeEdit';
import EmployeeView from './pages/employees/EmployeeView';
import DepartmentList from './pages/departments/DepartmentList';
import DepartmentAdd from './pages/departments/DepartmentAdd';
import DepartmentEdit from './pages/departments/DepartmentEdit';
import DepartmentView from './pages/departments/DepartmentView';
import SalaryList from './pages/salaries/SalaryList';
import SalaryAdd from './pages/salaries/SalaryAdd';
import SalaryView from './pages/salaries/SalaryView';
import ReportDashboard from './pages/reports/ReportDashboard';
import EmployeeReports from './pages/reports/EmployeeReports';
import DepartmentReports from './pages/reports/DepartmentReports';
import SalaryReports from './pages/reports/SalaryReports';
import PayrollReports from './pages/reports/PayrollReports';
import PayrollList from './pages/payrolls/PayrollList';
import PayrollAdd from './pages/payrolls/PayrollAdd';
import PayrollView from './pages/payrolls/PayrollView';
import PayrollProcess from './pages/payrolls/PayrollProcess';
import PayrollDashboard from './pages/payrolls/PayrollDashboard';
import NotFound from './pages/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keep track of whether we've checked auth status to prevent flashing
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    console.log('Checking authentication status on page load/refresh...');
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (token && userInfo) {
      try {
        // Parse the user info and validate it
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser && typeof parsedUser === 'object') {
          console.log('Session restored from localStorage');
          setIsAuthenticated(true);
          setUser(parsedUser);
        } else {
          console.warn('Invalid user data in localStorage');
          clearSession(); // Clear invalid session data
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearSession(); // Clear corrupted session data
      }
    }
    
    // Mark authentication check as complete
    setAuthChecked(true);
    console.log('Authentication check complete');
  }, []);
  
  // Helper function to clear session data
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (token, user) => {
    // Log successful login
    console.log('Login successful, storing credentials');
    
    // Store credentials in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update authentication state
    setIsAuthenticated(true);
    setUser(user);
    
    // Log authentication state
    console.log('Authentication state updated:', { isAuthenticated: true, user });
    
    // Note: No need to handle redirect here
    // The PublicRoute component will automatically redirect to the saved URL after login
  };

  const logout = () => {
    console.log('User logged out');
    clearSession();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Create a protected route wrapper
  const ProtectedRoute = ({ children }) => {
    // If still checking auth status, show nothing or a loading indicator to prevent flashing
    if (!authChecked) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    
    // If authenticated, render children normally
    if (isAuthenticated) {
      return children;
    }
    
    // If not authenticated and we've finished checking, redirect to login
    // Store the attempted URL for redirecting after successful login
    localStorage.setItem('redirectUrl', window.location.pathname);
    return <Navigate to="/login" replace />;
  };

  // Create a public route wrapper that redirects authenticated users
  const PublicRoute = ({ children }) => {
    // If still checking auth status, show nothing or a loading indicator to prevent flashing
    if (!authChecked) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    
    // If not authenticated, render children normally
    if (!isAuthenticated) {
      return children;
    }
    
    // If user is authenticated, check if there's a redirect URL
    const redirectUrl = localStorage.getItem('redirectUrl') || '/';
    // Clear the redirect URL after using it
    localStorage.removeItem('redirectUrl');
    // Redirect to the stored URL or dashboard
    return <Navigate to={redirectUrl} replace />;
  };

  return (
    <div className="app-container">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login login={login} />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Protected routes - all require authentication */}
        <Route path="/" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <Dashboard />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/employees" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <EmployeeList />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/employees/add" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <EmployeeAdd />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/employees/edit/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <EmployeeEdit />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/employees/view/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <EmployeeView />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        {/* Department routes */}
        <Route path="/departments" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <DepartmentList />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/departments/add" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <DepartmentAdd />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/departments/edit/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <DepartmentEdit />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/departments/view/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <DepartmentView />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        {/* Salary routes */}
        <Route path="/salaries" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <SalaryList />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/salaries/add" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <SalaryAdd />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/salaries/view/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <SalaryView />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        {/* Payroll routes */}
        <Route path="/payrolls" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollDashboard />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/payrolls/list" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollList />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/payrolls/add" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollAdd />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/payrolls/view/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollView />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/payrolls/process" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollProcess />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/payrolls/process/:id" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollProcess />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        {/* Report routes */}
        <Route path="/reports" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <ReportDashboard />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/reports/employees" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <EmployeeReports />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/reports/departments" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <DepartmentReports />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/reports/salaries" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <SalaryReports />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        <Route path="/reports/payrolls" element={
          <ProtectedRoute>
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <PayrollReports />
                </main>
              </div>
              <Footer />
            </>
          </ProtectedRoute>
        } />

        {/* Catch-all route - needs to wait for auth check */}
        <Route path="*" element={
          !authChecked ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : isAuthenticated ? (
            <>
              <Header user={user} logout={logout} toggleSidebar={toggleSidebar} />
              <div className="content-container">
                <Sidebar isOpen={sidebarOpen} user={user} logout={logout} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                  <NotFound />
                </main>
              </div>
              <Footer />
            </>
          ) : (
            <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
