// ConcertFilter.jsx
import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Axios from "axios";

const ConcertFilter = ({ onFilter, onReset }) => {
  const [artist, setArtist] = useState("");
  const [dates, setDates] = useState([]);
  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await Axios.get("http://localhost:8080/venues");
        setAllVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
  }, []);

  const handleFilterClick = () => {
    onFilter({
      artist,
      dates,
      venues,
    });
  };

  const handleResetClick = () => {
    setArtist("");
    setDates([]);
    setVenues([]);
    onReset();
  };

  const handleDateBlur = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate && !dates.includes(selectedDate)) {
      setDates([...dates, selectedDate]);
    }
  };

  const removeDate = (dateToRemove) => {
    setDates(dates.filter((date) => date !== dateToRemove));
  };

  return (
    <Form className="mb-4">
      <Form.Group className="mb-3" controlId="artist">
        <Form.Label>Artist</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter artist name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="dates">
        <Form.Label>Dates</Form.Label>
        <Form.Control type="date" onBlur={handleDateBlur} />
        {dates.length > 0 && (
          <div className="mt-2">
            Selected dates:
            {dates.map((date, index) => (
              <span key={index} className="me-2 badge bg-primary">
                {new Date(date).toLocaleDateString()}
                <Button
                  variant="link"
                  size="sm"
                  className="text-white p-0 ms-1"
                  onClick={() => removeDate(date)}
                >
                  ×
                </Button>
              </span>
            ))}
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="venues">
        <Form.Label>Venues</Form.Label>
        <Form.Select
          multiple
          value={venues}
          onChange={(e) =>
            setVenues(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {allVenues.map((venue, index) => (
            <option key={index} value={venue.name}>
              {venue.name}
            </option>
          ))}
        </Form.Select>
        <Form.Text className="text-muted">
          Hold Ctrl/Cmd to select multiple venues
        </Form.Text>
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button
          variant="primary"
          onClick={handleFilterClick}
          style={{
            backgroundColor: "black",
            color: "#FAFAED",
            borderColor: "black",
          }}
        >
          Filter
        </Button>
        <Button
          variant="secondary"
          onClick={handleResetClick}
          style={{
            backgroundColor: "gray",
            color: "white",
            borderColor: "gray",
          }}
        >
          Reset
        </Button>
      </div>
    </Form>
  );
};

export default ConcertFilter;
