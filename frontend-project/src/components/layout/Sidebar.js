import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaMoneyBill, 
  FaBuilding, 
  FaChartBar,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ isOpen, user, logout }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="d-flex flex-column" style={{ height: '100%' }}>
        <ul className="sidebar-list">
          <li className="sidebar-item">
            <Link to="/" className="sidebar-link">
              <FaHome className="me-2" /> Dashboard
            </Link>
          </li>
          
          {/* Main Menu Items */}
          <li className="sidebar-item">
            <Link to="/employees" className="sidebar-link">
              <FaUsers className="me-2" /> Employees
            </Link>
          </li>
          
          <li className="sidebar-item">
            <Link to="/departments" className="sidebar-link">
              <FaBuilding className="me-2" /> Departments
            </Link>
          </li>
          
          <li className="sidebar-item">
            <Link to="/salaries" className="sidebar-link">
              <FaMoneyBill className="me-2" /> Salaries
            </Link>
          </li>
          
          <li className="sidebar-item">
            <Link to="/payrolls" className="sidebar-link">
              <FaMoneyBill className="me-2" /> Payrolls
            </Link>
          </li>
          
          <li className="sidebar-item">
            <Link to="/reports" className="sidebar-link">
              <FaChartBar className="me-2" /> Reports
            </Link>
          </li>
        </ul>
        
        {/* Logout Option - positioned at the bottom */}
        <div className="mt-auto">
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <Link to="#" className="sidebar-link" onClick={() => logout && logout()}>
                <FaSignOutAlt className="me-2" /> Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
