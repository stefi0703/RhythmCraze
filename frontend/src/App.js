import logo from "./logo.svg";
import "./App.css";
import Login from "./components/Login";
import CustomNavbar from "./components/CustomNavbar";
import RegisterForm from "./components/RegisterForm";
import Home from "./components/Home";
import ConcertList from "./components/ConcertList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ArtistList from "./components/ArtistList";
import VenueList from "./components/VenueList";
import ApiSearch from "./components/ApiSearch";
import SearchResultPage from "./components/SearchResultPage";
import TicketPurchasePage from "./components/TicketPurchasePage";
import MyAccount from "./components/MyAccount";
import Cart from "./components/Cart";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/concerts" element={<ConcertList />} />
        <Route path="/artists" element={<ArtistList />} />
        <Route path="/venues" element={<VenueList />} />
        <Route path="/apiSearch" element={<ApiSearch />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/concert/:id" element={<TicketPurchasePage />} />
        <Route
          path="/search-results/:term"
          element={<SearchResultPage />}
        />{" "}
        {/* Add route for SearchResultPage */}
      </Routes>
    </Router>
  );
}

export default App;
