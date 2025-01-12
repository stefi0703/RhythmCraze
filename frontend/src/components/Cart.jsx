import React, { useState, useEffect } from "react";
import { Container, Button, Form, Card } from "react-bootstrap";
import CustomNavbar from "./CustomNavbar";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.log("No token found");
      return;
    }

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
      const username = decodedToken.sub;
      fetchCartItems(username);
      fetchTicketTypes();
    } catch (error) {
      console.error("Failed to decode JWT:", error);
    }
  }, []);

  const fetchCartItems = (username) => {
    setLoading(true);
    fetch(`http://localhost:8080/api/orders/user/${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }
        return response.json();
      })
      .then((data) => {
        const itemsWithTypes = data[0].lineItems.map((item) => ({
          ...item,
          selectedType: item.ticketDto.type, // Initialize with the current type
        }));
        setCartItems(itemsWithTypes);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch cart items:", error);
        setError("Failed to fetch cart items");
        setLoading(false);
      });
  };

  const fetchTicketTypes = () => {
    fetch("http://localhost:8080/api/tickets/types")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch ticket types");
        }
        return response.json();
      })
      .then((data) => {
        setTicketTypes(data);
      })
      .catch((error) => {
        console.error("Failed to fetch ticket types:", error);
        setError("Failed to fetch ticket types");
      });
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = quantity;
    setCartItems(updatedCartItems);
  };

  const handleDeleteItem = (index) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems.splice(index, 1);
    setCartItems(updatedCartItems);
  };

  const handleTypeChange = (index, newType) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].selectedType = newType; // Update the selected type for the specific item
    setCartItems(updatedCartItems);

    // Call the function to update the ticket price
    updateTicketPrice(index, newType);
  };

  const updateTicketPrice = async (index, type) => {
    try {
      const ticketId = cartItems[index].ticketDto.id;
      const response = await fetch(
        `http://localhost:8080/api/tickets/${ticketId}/${type}/updatePriceByType`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error("Failed to update ticket price");
      }

      const { price } = await response.json();

      const updatedCartItems = [...cartItems];
      updatedCartItems[index].ticketDto.price = parseFloat(price); // Update the price for the specific ticket
      setCartItems(updatedCartItems);
    } catch (error) {
      console.error("Failed to update ticket price:", error);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * item.ticketDto.price,
      0
    );
  };

  if (loading) return <p>Loading cart items...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <CustomNavbar />
      <Container>
        <h1>Cart</h1>
        {cartItems.length > 0 ? (
          <>
            {cartItems.map((item, index) => (
              <Card key={index} style={{ marginBottom: "20px" }}>
                <Card.Body>
                  <h4>{item.ticketDto.name}</h4>
                  <Form.Group controlId={`type-${index}`}>
                    <Form.Label>Type:</Form.Label>
                    <Form.Select
                      value={item.selectedType} // Use the specific item's selected type
                      onChange={(e) => handleTypeChange(index, e.target.value)} // Pass the index and the new type
                    >
                      {ticketTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <p>Price: ${item.ticketDto.price.toFixed(2)}</p>
                  <Form.Group controlId={`quantity-${index}`}>
                    <Form.Label>Quantity:</Form.Label>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, parseInt(e.target.value))
                      }
                    />
                  </Form.Group>
                  <p>
                    Total Price: $
                    {(item.quantity * item.ticketDto.price).toFixed(2)}
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteItem(index)}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            ))}
            <p>Total Price: ${getTotalPrice().toFixed(2)}</p>
            <Button variant="primary">Checkout</Button>
          </>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </Container>
    </>
  );
};

export default Cart;
