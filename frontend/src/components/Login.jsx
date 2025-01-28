import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import Axios from "axios";
import * as yup from "yup";
import { useFormik } from "formik";
import CustomNavbar from "./CustomNavbar";
import styles from "./LoginForm.css";
import Footer from "./Footer";

function Login() {
  const [error, setError] = useState("");

  const schema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        console.log(values);
        const response = await Axios.post(
          "http://localhost:8080/users/login",
          values
        );
        // console.log(response.data);
        if (response.status === 200) {
          localStorage.setItem("jwtToken", response.data);
          alert("Login successful");
          console.log(response.data);
          window.location.href = "/"; // Redirect to home page
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Invalid username or password");
        } else {
          alert("An error occurred");
        }
      }
    },
  });

  return (
    <>
      <CustomNavbar />
      <div className="content">

      <Container className={styles.formContainer}>
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
        <Form className={styles.formCard} onSubmit={formik.handleSubmit}>
          <h1>Login</h1>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              isInvalid={formik.touched.username && formik.errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.username}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              isInvalid={formik.touched.password && formik.errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            type="submit"
            variant="primary"
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
              e.target.style.boxShadow = "0 4px 4px rgba(0, 0, 0, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "black";
              e.target.style.color = "#FAFAED";
              e.target.style.boxShadow = "none";
            }}
          >
            Login
          </Button>
        </Form>
      </Container>
      </div>
      <Footer />
    </>
  );
}

export default Login;
