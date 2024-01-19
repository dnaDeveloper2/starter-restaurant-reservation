import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from "react-router-dom";
import { today, next, previous } from "../utils/date-time"; // Assuming you have utility functions for calculating next and previous dates

function Dashboard() {
  const location = useLocation();
  const history = useHistory();

  // Parse the date from the URL query parameter or use today's date as default
  const searchParams = new URLSearchParams(location.search);
  const initialDate = searchParams.get("date") || today();

  const [date, setDate] = useState(initialDate);
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);

    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    return () => abortController.abort();
  }

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setDate(newDate);
    updateUrl(newDate);
  };

  const updateUrl = (newDate) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("date", newDate);
    history.push({
      pathname: location.pathname,
      search: newSearchParams.toString(),
    });
  };

  const handleNextDay = () => {
    const nextDay = next(date);
    setDate(nextDay);
    updateUrl(nextDay);
  };

  const handlePrevDay = () => {
    const prevDay = previous(date);
    setDate(prevDay);
    updateUrl(prevDay);
  };

  const handleToday = () => {
    const todayDate = today();
    setDate(todayDate);
    updateUrl(todayDate);
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={handleDateChange}
        />
        <button onClick={handlePrevDay}>Previous</button>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNextDay}>Next</button>
      </div>
      <ErrorAlert error={reservationsError} />
      {reservations.length > 0 ? (
      <div>
        <h2>Reservations</h2>
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.reservation_id}>
              <strong>Reservation ID:</strong> {reservation.reservation_id}<br />
              <strong>Name:</strong> {reservation.first_name} {reservation.last_name}<br />
              <strong>Mobile Number:</strong> {reservation.mobile_number}<br />
              <strong>Date:</strong> {reservation.reservation_date}<br />
              <strong>Time:</strong> {reservation.reservation_time}<br />
              <strong>People:</strong> {reservation.people}<br />
              <strong>Created At:</strong> {reservation.created_at}<br />
              <strong>Updated At:</strong> {reservation.updated_at}
              <hr />
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p>No reservations found for the selected date.</p>
    )}
    </main>
  );
}

export default Dashboard;
