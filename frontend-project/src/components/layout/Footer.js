import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer mt-auto">
      <div className="container">
        <p className="mb-0">
          &copy; {currentYear} Employee Payroll Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
