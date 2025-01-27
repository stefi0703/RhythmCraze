import React, { useState, useEffect } from "react";
import CustomNavbar from "./CustomNavbar";
import { Container, Button, Card } from "react-bootstrap";
import "./MyAccount.css";
import Footer from "./Footer";

const MyAccount = () => {
  const [concertFavorites, setConcertFavorites] = useState([]);
  const [artistFavorites, setArtistFavorites] = useState([]);
  const [venueFavorites, setVenueFavorites] = useState([]);
  const [username, setUsername] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const concertFavoritesData =
      JSON.parse(localStorage.getItem("favorites")) || [];
    setConcertFavorites(concertFavoritesData);

    const artistFavoritesData =
      JSON.parse(localStorage.getItem("artistFavorites")) || [];
    setArtistFavorites(artistFavoritesData);

    const venueFavoritesData =
      JSON.parse(localStorage.getItem("venueFavorites")) || [];
    setVenueFavorites(venueFavoritesData);

    // Retrieve username from token when component mounts
    setUsername(getUsernameFromToken());

    if (username) {
      fetch(`http://localhost:8080/api/orders/user/${username}`)
        .then((response) => response.json())
        .then((data) => setOrders(data))
        .catch((error) => console.error("Failed to fetch orders:", error));
    }
  }, [username]);

  const handleDeleteConcertFavorite = (indexToDelete) => {
    const updatedFavorites = concertFavorites.filter(
      (_, index) => index !== indexToDelete
    );
    setConcertFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const handleDeleteArtistFavorite = (indexToDelete) => {
    const updatedFavorites = artistFavorites.filter(
      (_, index) => index !== indexToDelete
    );
    setArtistFavorites(updatedFavorites);
    localStorage.setItem("artistFavorites", JSON.stringify(updatedFavorites));
  };

  const handleDeleteVenueFavorite = (indexToDelete) => {
    const updatedFavorites = venueFavorites.filter(
      (_, index) => index !== indexToDelete
    );
    setVenueFavorites(updatedFavorites);
    localStorage.setItem("venueFavorites", JSON.stringify(updatedFavorites));
  };

  function parseJwt(token) {
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

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  }

  function getUsernameFromToken() {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT from local storage
    if (!token) {
      console.log("No token found");
      return null;
    }

    const decodedToken = parseJwt(token);
    return decodedToken ? decodedToken.sub : null; // 'sub' is the standard claim for the subject (i.e., username)
  }

  return (
    <>
      <CustomNavbar />
      <div className="bg-dark text-light py-4">
        <Container>
          <p></p>
          <h3 style={{ color: "#FAFAED" }}>
            {username ? `Hello, ${username}!` : "Welcome to your account page!"}
          </h3>
          <p style={{ color: "#FAFAED" }}>
            Here you can view your account details, purchase history, and more.
          </p>
        </Container>
      </div>
      <p></p>
      <Container className="favorites-section py-4">
        <div className="favorites-title">
          <h4>My Favorites</h4>
        </div>
        <p></p>
        <div className="favorites">
          <div className="favorite-item">
            <a href="#">Concerts</a>
            {concertFavorites.length > 0 && (
              <div className="favorites-list">
                {concertFavorites.map((favorite, index) => (
                  <div key={index} className="favorite-dropdown-item">
                    {favorite.name} - {favorite.artist}
                    <Button
                      className="delete-button"
                      size="sm"
                      onClick={() => handleDeleteConcertFavorite(index)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="favorite-item">
            <a href="#">Artists</a>
            {artistFavorites.length > 0 && (
              <div className="favorites-list">
                {artistFavorites.map((favorite, index) => (
                  <div key={index} className="favorite-dropdown-item">
                    {favorite.name}
                    <Button
                      className="delete-button"
                      size="sm"
                      onClick={() => handleDeleteArtistFavorite(index)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="favorite-item">
            <a href="#">Venues</a>
            {venueFavorites.length > 0 && (
              <div className="favorites-list">
                {venueFavorites.map((favorite, index) => (
                  <div key={index} className="favorite-dropdown-item">
                    {favorite.name}
                    <Button
                      className="delete-button"
                      size="sm"
                      onClick={() => handleDeleteVenueFavorite(index)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
      <Container className="orders-section py-4">
        <div className="orders-title">
          <h4>My Orders</h4>
        </div>
        {orders.map((order, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <Card.Title>Order #{order.id}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Status: {order.status}
              </Card.Subtitle>
              {order.lineItems.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <p>
                    {item.ticketDto.name} - {item.quantity} x $
                    {item.ticketDto.price}
                  </p>
                </div>
              ))}
              <strong>
                Total: $
                {order.lineItems
                  .reduce(
                    (sum, item) => sum + item.quantity * item.ticketDto.price,
                    0
                  )
                  .toFixed(2)}
              </strong>
            </Card.Body>
          </Card>
        ))}
      </Container>
      <p></p>
      <Footer />
    </>
  );
};

export default MyAccount;
