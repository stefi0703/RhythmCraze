// ConcertList.jsx
import React, { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import Axios from "axios";
import ExternalConcertService from "../services/ExternalConcertService";
import CustomNavbar from "./CustomNavbar";
import ConcertFilter from "./ConcertFilter";
import { useNavigate } from "react-router-dom";
import "./ConcertList.css";

const ConcertList = () => {
  const [concerts, setConcerts] = useState([]);
  const [filteredConcerts, setFilteredConcerts] = useState([]);
  const navigate = useNavigate();

  const fetchAllConcerts = async () => {
    try {
      // Fetch backend concerts
      const backendResponse = await Axios.get("http://localhost:8080/concerts");
      const backendConcerts = backendResponse.data.map((concert) => ({
        ...concert,
        isExternal: false,
      }));

      // Fetch external concerts
      const externalResponse = await Axios.get(
        "https://app.ticketmaster.com/discovery/v2/events.json",
        {
          params: {
            classificationName: "music",
            apikey: "N5rGnebkF8z6ZSbGAbHXde3WuU51NdBZ",
          },
        }
      );

      // In ConcertList.jsx, modify the transformTicketmasterEvent call:
      const externalConcerts = externalResponse.data._embedded.events.map(
        (event) => {
          const transformedConcert =
            ExternalConcertService.transformTicketmasterEvent(event);
          // Store with clear ID format
          localStorage.setItem(
            `external-concert-${transformedConcert.id}`,
            JSON.stringify(transformedConcert)
          );
          return {
            ...transformedConcert,
            isExternal: true, // Add this flag
          };
        }
      );

      const allConcerts = [...backendConcerts, ...externalConcerts];
      setConcerts(allConcerts);
      setFilteredConcerts(allConcerts);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      alert("Failed to load concerts. Please try again later.");
    }
  };

  const handleFilter = (filterParams) => {
    let filtered = [...concerts];

    if (filterParams.artist?.trim()) {
      const artistSearch = filterParams.artist.trim().toLowerCase();
      filtered = filtered.filter((concert) => {
        const artistName =
          concert.artist?.name?.toLowerCase() || concert.name?.toLowerCase();
        return artistName.includes(artistSearch);
      });
    }

    if (filterParams.dates?.length > 0) {
      filtered = filtered.filter((concert) => {
        const concertDate = new Date(concert.date).toISOString().split("T")[0];
        return filterParams.dates.some(
          (date) => new Date(date).toISOString().split("T")[0] === concertDate
        );
      });
    }

    if (filterParams.venues?.length > 0) {
      filtered = filtered.filter((concert) =>
        filterParams.venues.includes(concert.venue)
      );
    }

    setFilteredConcerts(filtered);
  };

  useEffect(() => {
    fetchAllConcerts();
  }, []);

  return (
    <>
      <CustomNavbar />
      <Container>
        <h1>Concerts</h1>
        <ConcertFilter
          onFilter={handleFilter}
          onReset={() => {
            fetchAllConcerts();
          }}
        />
        <Row>
          {filteredConcerts.length > 0 ? (
            filteredConcerts.map((concert) => (
              <Col
                key={concert.id || `external-${concert.id}`}
                xs={12}
                md={6}
                lg={4}
                className="mb-4"
              >
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{concert.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {concert.artist ? `Artist: ${concert.artist.name}` : ""}
                    </Card.Subtitle>
                    <Card.Text>
                      Venue:{" "}
                      {concert.isExternal
                        ? concert.venue || "Unknown"
                        : concert.venues?.map((v) => v.name).join(", ") ||
                          "Unknown"}
                    </Card.Text>
                    <Card.Text>
                      Date:{" "}
                      {concert.isExternal
                        ? concert.date &&
                          new Date(concert.date).toLocaleDateString()
                        : concert.dates
                            ?.map((date) => new Date(date).toLocaleDateString())
                            .join(", ") || "No date available"}
                    </Card.Text>
                    <Card.Text>
                      Tickets:
                      {concert.tickets?.map((ticket, index) => (
                        <div key={ticket.id || index}>
                          {ticket.type}: ${ticket.price.toFixed(2)}
                        </div>
                      ))}
                    </Card.Text>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (concert.isExternal) {
                          // For external concerts, make sure we're using the correct ID
                          navigate(`/concert/${concert.id}`, {
                            state: { isExternal: true },
                          });
                        } else {
                          // For database concerts
                          navigate(`/concert/${concert.id}`);
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <p>No concerts available</p>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default ConcertList;
