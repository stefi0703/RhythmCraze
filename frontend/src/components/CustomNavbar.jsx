import React, { useState, useEffect } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import ApiSearch from "./ApiSearch";
import LoginModal from "./LoginModal"; // Import the LoginModal component

const CustomNavbar = () => {
  const [modalShow, setModalShow] = useState(false); // State to control modal visibility

  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); // Clear the authentication token
    window.location.href = "/login"; // Redirect to the login page after logout
  };

  const handleMyAccountClick = () => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token
    if (!token) {
      // If token not present, show the modal
      setModalShow(true);
    } else {
      // If token present, navigate to My account page
      window.location.href = "/account";
    }
  };

  const handleCartClick = () => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token
    if (!token) {
      // If token not present, show the modal
      setModalShow(true);
    } else {
      // If token present, navigate to Cart page
      window.location.href = "/cart";
    }
  };

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: "#FAFAED" }}>
        <Container fluid>
          <Navbar.Brand href="#">Navbar scroll</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: "100px" }}
              navbarScroll
            >
              <Nav.Link href="/">Home</Nav.Link>
              <NavDropdown title="Features" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/concerts">Concerts</NavDropdown.Item>
                <NavDropdown.Item href="/artists">Artists</NavDropdown.Item>
                <NavDropdown.Item href="/venues">Venues</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link onClick={handleCartClick}>Cart</Nav.Link>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/register">Register</Nav.Link>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              <Nav.Link onClick={handleMyAccountClick}>My account</Nav.Link>
            </Nav>
            <ApiSearch />
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Login modal */}
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default CustomNavbar;
