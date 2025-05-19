import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="mt-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="mb-4">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              <FaHome className="me-2" /> Go to Homepage
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
