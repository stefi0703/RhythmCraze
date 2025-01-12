import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import Axios from "axios";
import CustomNavbar from "./CustomNavbar";
import ConcertFilter from "./ConcertFilter";
import { useNavigate } from "react-router-dom";
import heartIcon from "./heart_icon.png";
import "./ConcertList.css";

const ConcertList = () => {
  const [concerts, setConcerts] = useState([]);

  const concertsOptions = {
    method: "GET",
    url: "https://app.ticketmaster.com/discovery/v2/events?apikey=N5rGnebkF8z6ZSbGAbHXde3WuU51NdBZ",
    params: {
      keyword: "Taylor Swift",
    },
  };
  const navigate = useNavigate();

  const handleBuyTickets = async (concertId) => {
    // try {
    //   // Make a POST request to create a ticket for the specified concert
    //   await Axios.post(
    //     `http://localhost:8080/api/tickets/create?concertId=${concertId}`,
    //     {}, // Empty request body
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    // Redirect to the purchase page or perform any other action upon successful ticket creation
    navigate(`/purchase/${concertId}`);
  };

  const handleFilter = async (artist, dates, venues) => {
    try {
      const response = await Axios.get(
        "http://localhost:8080/concerts/filter",
        {
          params: {
            artist,
            dates: dates.join(","), // Join dates array with comma separator
            venues: venues.join(","),
          },
        }
      );
      setConcerts(response.data);
    } catch (error) {
      console.error("Error fetching filtered concerts:", error);
    }
  };

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await Axios.get("http://localhost:8080/concerts");
        setConcerts(response.data);
      } catch (error) {
        console.error("Error fetching concerts:", error);
      }
    };

    fetchConcerts();
  }, []);

  const handleAddFavorite = (concert) => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isAlreadyFavorite = favorites.find(
      (fav) =>
        fav.name === concert.name &&
        fav.artist === (concert.artist ? concert.artist.name : "Unknown")
    );

    if (!isAlreadyFavorite) {
      favorites.push({
        name: concert.name,
        artist: concert.artist ? concert.artist.name : "Unknown",
      });
      localStorage.setItem("favorites", JSON.stringify(favorites));
      alert("Concert added to 'My Favorites'");
    } else {
      alert("Concert already added to 'My Favorites'");
    }
  };

  return (
    <>
      <CustomNavbar />
      <Container>
        <h1>Concerts</h1>
        <ConcertFilter onFilter={handleFilter} />
        {concerts.length > 0 ? (
          concerts.map((concert, index) => (
            <Card key={concert.id || index} className="my-3">
              {" "}
              <Card.Body>
                <Card.Title>{concert.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {concert.artist ? `Artist: ${concert.artist.name}` : ""}
                </Card.Subtitle>
                <Card.Text>
                  Venues:{" "}
                  {concert.venues
                    ? concert.venues.map((venue) => venue.name).join(", ")
                    : ""}
                </Card.Text>
                <Card.Text>
                  Dates:{" "}
                  {concert.dates
                    ? concert.dates
                        .map((date) => new Date(date).toLocaleDateString())
                        .join(", ")
                    : "No dates available"}
                </Card.Text>
                <Card.Text>Price: ${concert.price}</Card.Text>
                <Row>
                  <Col>
                    <Button
                      variant="primary"
                      onClick={() => handleBuyTickets(concert.id)}
                      style={{
                        backgroundColor: "black",
                        color: "#FAFAED",
                        borderColor: "black",
                      }}
                    >
                      Buy Tickets
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <div className="favorite-container">
                      <Button
                        variant="link"
                        onClick={() => handleAddFavorite(concert)}
                      >
                        <img
                          src={heartIcon}
                          alt="Favorite"
                          style={{
                            width: "24px",
                            height: "24px",
                          }}
                        />
                      </Button>
                      <div className="favorite-text">Add to favorite</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No concerts available</p>
        )}
      </Container>
    </>
  );
};

export default ConcertList;
