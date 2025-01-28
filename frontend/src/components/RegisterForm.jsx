import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import axios from "axios"; // Import Axios for making HTTP requests
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Formik } from "formik";
import CustomNavbar from "./CustomNavbar";
import styles from "./RegisterForm.css";
import { Card, Container } from "react-bootstrap";
import Footer from "./Footer";

function RegisterForm() {
  const navigate = useNavigate(); // Initialize useHistory hook

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    address: Yup.string().required("Address is required"),
    terms: Yup.bool().oneOf([true], "Terms must be accepted").required(),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Make POST request to backend
      await axios.post("http://localhost:8080/users/register", values);
      console.log("Registration successful");
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      console.error("Registration failed:", error.message);
      // Handle error
    }
    setSubmitting(false);
  };

  return (
    <>
      <CustomNavbar />
      <br />
      <div className="content">
        <Container className={styles.formContainer}>
          <Card className={styles.formCard}>
            <Card.Body className={styles.formCardBody}>
              <Card.Title className={styles.formCardTitle}>
                Registration Form
              </Card.Title>

              <Formik
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                initialValues={{
                  firstName: "",
                  lastName: "",
                  email: "",
                  username: "",
                  password: "",
                  confirmPassword: "",
                  address: "",
                  terms: false,
                }}
              >
                {({
                  handleSubmit,
                  handleChange,
                  values,
                  touched,
                  errors,
                  isValid,
                  isSubmitting,
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="firstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          isInvalid={touched.firstName && !!errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group as={Col} controlId="lastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          isInvalid={touched.lastName && !!errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          isInvalid={touched.email && !!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group as={Col} controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={values.username}
                          onChange={handleChange}
                          isInvalid={touched.username && !!errors.username}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.username}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          isInvalid={touched.password && !!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </Form.Group>
                      <Form.Group as={Col} controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          isInvalid={
                            touched.confirmPassword && !!errors.confirmPassword
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.confirmPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col} controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={values.address}
                          onChange={handleChange}
                          isInvalid={touched.address && !!errors.address}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.address}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Check
                        required
                        label="Agree to terms and conditions"
                        name="terms"
                        onChange={handleChange}
                        isInvalid={touched.terms && !!errors.terms}
                        feedback={errors.terms}
                        feedbackType="invalid"
                        id="terms"
                      />
                    </Form.Group>
                    <Button
                      type="submit"
                      variant="success"
                      disabled={!isValid || isSubmitting}
                      style={{
                        backgroundColor: "black",
                        color: "#FAFAED",
                        borderColor: "black",
                        marginTop: "5px",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#FAFAED";
                        e.target.style.color = "black";
                        e.target.style.borderColor = "#FAFAED";
                        e.target.style.boxShadow =
                          "0 4px 4px rgba(0, 0, 0, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "black";
                        e.target.style.color = "#FAFAED";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      {isSubmitting ? "Submitting..." : "Submit form"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default RegisterForm;
