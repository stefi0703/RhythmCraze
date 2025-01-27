import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";
import LoginModal from "./LoginModal";

const TicketPurchasePage = () => {
  const { concertId } = useParams();
  const location = useLocation();
  const [concert, setConcert] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("GENERAL");
  const [modalShow, setModalShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [isExternalConcert, setIsExternalConcert] = useState(false);
  const isExternal = location.state?.isExternal;

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        if (isExternal) {
          // Try to get from localStorage first
          const storedConcert = localStorage.getItem(
            `external-concert-${concertId}`
          );
          if (storedConcert) {
            setConcert(JSON.parse(storedConcert));
            setIsExternalConcert(true);
            return;
          }
        }

        // If not external or not found in localStorage, try backend
        const response = await fetch(
          `http://localhost:8080/concerts/${concertId}`
        );
        const data = await response.json();
        setConcert(data);
        setIsExternalConcert(false);
      } catch (error) {
        console.error("Error fetching concert:", error);
      }
    };

    fetchConcert();
  }, [concertId, isExternal]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const decodedToken = JSON.parse(jsonPayload);
      setUsername(decodedToken.sub);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
    }
  }, []);

  const getTicketPrice = () => {
    if (isExternalConcert) {
      const ticketInfo = concert.priceRanges?.[0];
      switch (ticketType) {
        case "GENERAL":
          return ticketInfo?.min || 0;
        case "VIP":
          return ticketInfo?.max || 0;
        case "PREMIUM":
          return ticketInfo?.max * 1.5 || 0;
        default:
          return 0;
      }
    } else {
      return concert?.price || 0;
    }
  };

  const handlePurchase = () => {
    if (!ticketType || quantity <= 0) {
      alert("Please select ticket type and quantity.");
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setModalShow(true);
      return;
    }

    setIsLoading(true);

    if (isExternalConcert) {
      // Store external purchase in localStorage or your backend
      const purchase = {
        concertId: concert.id,
        ticketType,
        quantity,
        username,
        price: getTicketPrice(),
        purchaseDate: new Date().toISOString(),
      };

      const purchases = JSON.parse(
        localStorage.getItem("external-purchases") || "[]"
      );
      purchases.push(purchase);
      localStorage.setItem("external-purchases", JSON.stringify(purchases));

      alert("Added to cart successfully!");
      setIsLoading(false);
    } else {
      fetch(
        `http://localhost:8080/api/tickets/create?concertId=${concertId}&ticketType=${ticketType}&quantity=${quantity}&username=${username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => {
          if (!response.ok) throw new Error("Failed to create ticket");
          return response.json();
        })
        .then((orderLineItem) => {
          console.log("Order Line Item created:", orderLineItem);
          alert("Added to cart successfully!");
        })
        .catch((error) => {
          console.error("Error during ticket purchase:", error);
          alert("Error during ticket purchase: " + error.message);
        })
        .finally(() => setIsLoading(false));
    }
  };

  if (!concert) return <p>Loading...</p>;

  return (
    <>
      <CustomNavbar />
      <Container>
        <h1>{concert.name}</h1>

        {/* Show venues */}
        {isExternalConcert ? (
          <p>Venue: {concert.venue || "Unknown"}</p>
        ) : (
          concert.venues &&
          concert.venues.length > 0 && (
            <p>Venue: {concert.venues.map((venue) => venue.name).join(", ")}</p>
          )
        )}

        {/* Show dates */}
        {isExternalConcert ? (
          <p>
            Date: {concert.date && new Date(concert.date).toLocaleDateString()}
          </p>
        ) : (
          concert.dates &&
          concert.dates.length > 0 && (
            <p>
              Dates:{" "}
              {concert.dates
                .map((date) => new Date(date).toLocaleDateString())
                .join(", ")}
            </p>
          )
        )}

        {/* Show artist */}
        <p>
          Artist:{" "}
          {isExternalConcert ? concert.name : concert.artist?.name || "Unknown"}
        </p>

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

          <p>Price per ticket: ${getTicketPrice().toFixed(2)}</p>
          <p>Total price: ${(getTicketPrice() * quantity).toFixed(2)}</p>

          <div className="d-flex justify-content-center">
            <Button
              variant="primary"
              onClick={handlePurchase}
              disabled={isLoading}
              className="custom-buy-button"
            >
              {isLoading ? "Processing..." : "Add to Cart"}
            </Button>
          </div>
        </Form>
      </Container>
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
      <style>{`
        .custom-buy-button {
          background-color: black;
          color: #FAFAED;
          border-color: black;
          width: 150px;
        }
      `}</style>
    </>
  );
};

export default TicketPurchasePage;
