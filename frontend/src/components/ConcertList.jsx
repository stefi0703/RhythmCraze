import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import Axios from "axios";
import CustomNavbar from "./CustomNavbar";
import ConcertFilter from "./ConcertFilter";
import { useNavigate } from "react-router-dom";
import heartIcon from "./heart_icon.png";
import "./ConcertList.css";
import Footer from "./Footer";


const ConcertList = () => {
  const [concerts, setConcerts] = useState([]);
  const navigate = useNavigate();

  const fetchAllConcerts = async () => {
    try {
      const response = await Axios.get("http://localhost:8080/concerts");
      setConcerts(response.data);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      alert("Failed to load concerts. Please try again later.");
    }
  };

  const handleFilter = async (filterParams) => {
    try {
      const params = {};

      if (filterParams.artist?.trim()) {
        params.artist = filterParams.artist.trim();
      }

      if (filterParams.dates?.length > 0) {
        params.dates = filterParams.dates;
      }

      if (filterParams.venues?.length > 0) {
        params.venueNames = filterParams.venues;
      }

      console.log("Sending filter request with params:", params);

      const response = await Axios.get(
        "http://localhost:8080/concerts/filter",
        {
          params,
          paramsSerializer: {
            serialize: (params) => {
              const searchParams = new URLSearchParams();
              Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                  value.forEach((item) => searchParams.append(key, item));
                } else {
                  searchParams.append(key, value);
                }
              });
              return searchParams.toString();
            },
          },
        }
      );

      console.log("Filter response:", response.data);
      setConcerts(response.data);
    } catch (error) {
      console.error("Error fetching filtered concerts:", error);
      alert("Failed to filter concerts. Please try again later.");
    }
  };

  useEffect(() => {
    fetchAllConcerts();
  }, []);

  return (
    <>
      <CustomNavbar />
      <div className="content">
      <Container>
        <h1>Concerts</h1>
        <ConcertFilter
          onFilter={handleFilter}
          onReset={fetchAllConcerts} // Pass the reset function
        />
        {concerts.length > 0 ? (
          concerts.map((concert, index) => (
            <Card key={concert.id || index} className="my-3">
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
                      onClick={() => navigate(`/purchase/${concert.id}`)}
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
                        onClick={() => {
                          const favorites =
                            JSON.parse(localStorage.getItem("favorites")) || [];
                          if (!favorites.find((f) => f.name === concert.name)) {
                            favorites.push({
                              name: concert.name,
                              artist: concert.artist?.name || "Unknown",
                            });
                            localStorage.setItem(
                              "favorites",
                              JSON.stringify(favorites)
                            );
                          }
                        }}
                      >
                        <img
                          src={heartIcon}
                          alt="Favorite"
                          style={{ width: "20px" }}
                        />
                      </Button>
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
      </div>
      <Footer />
    </>
  );
};

export default ConcertList;
