import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  const [city, setCity] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!city.trim()) return;

    onSearch(city.trim());

    setCity("");
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search city"
        className="search-bar__input"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <button
        type="submit"
        className="search-bar__button"
        aria-label="Search"
      >
        <FaSearch />
      </button>
    </form>
  );
}

export default SearchBar;