import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";
import LoginModal from "./LoginModal"; // Assuming this is a modal for confirming the purchase

const TicketPurchasePage = () => {
  const { concertId } = useParams();
  const [concert, setConcert] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Fetch concert details by ID
    if (!concertId) {
      console.error("No concert ID provided");
      return;
    }
    fetch(`http://localhost:8080/concerts/${concertId}`)
      .then((response) => response.json())
      .then((data) => setConcert(data))
      .catch((error) =>
        console.error("Error fetching concert details:", error)
      );
  }, [concertId]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT from local storage
    console.log("Token:", token);
    if (!token) {
      console.log("No token found");
      return;
    }

    try {
      const base64Url = token.split(".")[1]; // Access the payload part of the token
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const decodedToken = JSON.parse(jsonPayload);
      setUsername(decodedToken.sub); // 'sub' is the standard claim for the subject (i.e., username)
    } catch (error) {
      console.error("Failed to decode JWT:", error);
    }
  }, []);

  const handlePurchase = () => {
    if (!ticketType || quantity <= 0) {
      alert("Please select ticket type and quantity.");
      return;
    }

    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT from local storage
    if (!token) {
      // No token found, show the modal
      setModalShow(true);
      return;
    }

    setIsLoading(true);
    fetch(
      `http://localhost:8080/api/tickets/create?concertId=${concertId}&ticketType=${ticketType}&quantity=${quantity}&username=${username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`, // Include the JWT token
        },
      }
    )
      .then((response) => {
        console.log("Ticket purchase response:", response);
        if (!response.ok) throw new Error("Failed to create ticket");
        return response.json();
      })
      .then((orderLineItem) => {
        console.log("Order Line Item created:", orderLineItem);
        setIsLoading(false);
        alert("Added to cart successfully!"); // Show alert for successful purchase
      })
      .catch((error) => {
        console.error("Error during ticket purchase:", error);
        alert("Error during ticket purchase: " + error.message);
        setIsLoading(false);
      });
  };

  const formattedPrice = (price) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00";
  };

  if (!concert) return <p>Loading...</p>;

  return (
    <>
      <CustomNavbar />
      <Container>
        <h1>{concert.name}</h1>
        <Form>
          <Form.Group as={Row} className="mb-3 align-items-center">
            <Form.Label column sm={2}>
              Select number of tickets
            </Form.Label>
            <Col sm={10}>
              <Button
                variant="outline-primary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="mx-3">{quantity}</span>
              <Button
                variant="outline-primary"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={2}>
              Select category
            </Form.Label>
            <Col sm={10}>
              <Form.Select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
              >
                <option value="GENERAL">Standard</option>
                <option value="VIP">VIP</option>
                <option value="PREMIUM">Premium</option>
              </Form.Select>
            </Col>
          </Form.Group>
          <div className="d-flex justify-content-center">
            <Button
              variant="primary"
              onClick={handlePurchase}
              disabled={isLoading}
              className="custom-buy-button"
            >
              {isLoading ? "Processing..." : `Add to Cart`}
            </Button>
          </div>
        </Form>
      </Container>
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
      <style>
        {`
                .custom-buy-button {
                    background-color: black;
                    color: #FAFAED;
                    border-color: black;
                    width: 150px;
                }
                `}
      </style>
    </>
  );
};

export default TicketPurchasePage;
