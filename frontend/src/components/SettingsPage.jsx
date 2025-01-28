import React, { useState, useEffect } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";
import Footer from "./Footer";

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  const getUsernameFromToken = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error("No token found");
      return null;
    }

    const decodedToken = parseJwt(token);
    return decodedToken ? decodedToken.sub : null;
  };

  useEffect(() => {
    const username = getUsernameFromToken();
    if (!username) {
      setErrorMessage("Failed to retrieve username. Please log in again.");
      setIsLoading(false);
      return;
    }

    fetch(`http://localhost:8080/users/details?username=${username}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user details.");
        }
        return response.json();
      })
      .then((data) => {
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          username: data.username || "",
        });
        setIsLoading(false);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Log the Authorization header
    const token = localStorage.getItem("jwtToken");
    console.log("Authorization Header:", localStorage.getItem("jwtToken"));

    fetch("http://localhost:8080/users/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update user settings.");
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        setSuccessMessage(data.message); // Use the "message" field from the response
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error("Error during update:", error);
      });
  };

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      <CustomNavbar />
      <div className="content">
        <Container className="mt-5">
          <h2>Update Your Account</h2>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                disabled
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Container>
      </div>
      <br></br>
      <Footer />
    </>
  );
};

export default SettingsPage;
