import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CheckoutModal = ({ show, onHide, orderId, total }) => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Card number validation (16 digits)
    if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    // Expiry date validation (MM/YY format)
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardData.expiryDate)) {
      newErrors.expiryDate = "Invalid expiry date (MM/YY)";
    } else {
      const [month, year] = cardData.expiryDate.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        newErrors.expiryDate = "Card has expired";
      }
    }

    // CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    // Cardholder name validation
    if (cardData.cardHolder.trim().length < 3) {
      newErrors.cardHolder = "Please enter the cardholder name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue =
        value
          .replace(/\s/g, "")
          .match(/.{1,4}/g)
          ?.join(" ") || "";
    }

    // Format expiry date with slash
    if (name === "expiryDate") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/^(\d{2})/, "$1/")
        .substr(0, 5);
    }

    setCardData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Update order status to CHECKOUT
      let response = await fetch(
        `http://localhost:8080/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "CHECKOUT" }),
        }
      );

      if (!response.ok) throw new Error("Failed to update order status");

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update order status to PLACED
      response = await fetch(
        `http://localhost:8080/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "PLACED" }),
        }
      );

      if (!response.ok) throw new Error("Failed to place order");

      // Show success message
      alert("Your order has been placed successfully!");

      // Navigate to MyAccount page
      onHide();
      navigate("/account");
    } catch (error) {
      console.error("Checkout error:", error);
      setErrors({ submit: "Failed to process payment. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Checkout</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Total Amount</Form.Label>
            <Form.Control value={`$${total.toFixed(2)}`} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              isInvalid={!!errors.cardNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cardNumber}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row">
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="text"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  isInvalid={!!errors.expiryDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.expiryDate}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  isInvalid={!!errors.cvv}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cvv}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Cardholder Name</Form.Label>
            <Form.Control
              type="text"
              name="cardHolder"
              value={cardData.cardHolder}
              onChange={handleInputChange}
              placeholder="John Doe"
              isInvalid={!!errors.cardHolder}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cardHolder}
            </Form.Control.Feedback>
          </Form.Group>

          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CheckoutModal;
