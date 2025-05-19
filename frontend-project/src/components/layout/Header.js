import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBars, FaUser, FaSignOutAlt, FaUserCog } from 'react-icons/fa';

const Header = ({ user, logout, toggleSidebar }) => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <button className="btn btn-link text-white me-3" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <Navbar.Brand as={Link} to="/">Employee Payroll Management</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav" className="justify-content-end">
          <Nav>
            {user && (
              <NavDropdown title={
                <span>
                  <FaUser className="me-1" />
                  {user.username}
                </span>
              } id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">
                  <FaUserCog className="me-2" />
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
