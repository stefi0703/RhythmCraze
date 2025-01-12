import React, { useState } from "react";
import { Form, FormControl, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory


const ApiSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Navigate to the search results page with search term as URL parameter
      navigate(`/search-results/${encodeURIComponent(searchTerm)}`);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  return (
    <div>
      <Form className="d-flex" onSubmit={handleSearch}>
        <FormControl
          type="search"
          placeholder="Search"
          className="me-2"
          aria-label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-success" type="submit">
          Search
        </Button>
      </Form>
    </div>
  );
};

export default ApiSearch;
