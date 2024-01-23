import React, { useState } from "react";
import { searchReservations } from "../utils/api"; // Make sure to implement this in your api.js
import ErrorAlert from "../layout/ErrorAlert";

function SearchReservation() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const handleInputChange = (event) => {
    setMobileNumber(event.target.value);
  };

  const handleFindClick = async () => {
    try {
      const foundReservations = await searchReservations(mobileNumber);
      setReservations(foundReservations);
    } catch (error) {
      setSearchError(error.message);
    }
  };

  return (
    <main>
      <h1>Search Reservation</h1>
      <div className="search-box">
        <input
          name="mobile_number"
          placeholder="Enter a customer's phone number"
          value={mobileNumber}
          onChange={handleInputChange}
        />
        <button onClick={handleFindClick}>Find</button>
      </div>
      <ErrorAlert error={searchError} />

      {/* Reuse the reservation list display logic from Dashboard.js */}
      <div className="reservations-list">
        {reservations.length === 0 ? (
          <p>No reservations found.</p>
        ) : (
          <div className="reservations-scrollable">
            <ul>
            {reservations.map((reservation) => (
  <li key={reservation.reservation_id} className="reservation-details">
    <strong>Reservation ID:</strong> {reservation.reservation_id}
    <br />
    <strong>Name:</strong> {reservation.first_name} {reservation.last_name}
    <br />
    <strong>Mobile Number:</strong> {reservation.mobile_number}
    <br />
    <strong>Date:</strong> {reservation.reservation_date}
    <br />
    <strong>Time:</strong> {reservation.reservation_time}
    <br />
    <strong>People:</strong> {reservation.people}
    <br />
    <strong>Status:</strong> {reservation.status}
    <br />
    <strong>Created At:</strong> {reservation.created_at}
    <br />
    <strong>Updated At:</strong> {reservation.updated_at}
    <br />
    {reservation.status === 'booked' && (
      <a href={`/reservations/${reservation.reservation_id}/seat`}>Seat</a>
    )}
    <hr />
  </li>
))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

export default SearchReservation;
