import React, { useState } from "react";
import { searchReservations } from "../utils/api";
import ReservationCard from "./ReservationCard";
import ErrorAlert from "../layout/ErrorAlert";

function Search() {
    // State hooks for managing search input, reservations list, and error message

  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchError, setSearchError] = useState(null);

    // Function to handle search operation

  const handleSearch = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setSearchError(null);
    try {
      // Fetch reservations based on the mobile number

      const foundReservations = await searchReservations(
        mobileNumber,
        abortController.signal
      );
      setReservations(foundReservations);
    } catch (error) {
      setSearchError(error);
    }
    return () => abortController.abort();
  };
  // Render the search form and results

  return (
    <div>
      <h1>Search Reservations</h1>
      <form onSubmit={handleSearch}>
        <input
          name="mobile_number"
          type="tel"
          onChange={({ target }) => setMobileNumber(target.value)}
          value={mobileNumber}
          placeholder="Enter a customer's phone number"
        />
        <button type="submit">Find</button>
      </form>
      <ErrorAlert error={searchError} />
      {reservations.length > 0 ? (
        reservations.map((reservation) => (
          <ReservationCard
            key={reservation.reservation_id}
            reservation={reservation}
          />
        ))
      ) : searchError ? (
        <p>Error occurred: {searchError.message}</p>
      ) : (
        <p>No reservations found</p>
      )}
    </div>
  );
}

export default Search;
