import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function ReservationForm() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const base_url = "http://localhost:5001";
      const formattedDate = new Date(formData.reservation_date)
        .toISOString()
        .split("T")[0];
      const formattedTime = formData.reservation_time + ":00";
      const formattedDateTime = `${formattedDate}T${formattedTime}`;

      const response = await fetch(`${base_url}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          reservation_date: formattedDateTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const reservationDate = new Date(formData.reservation_date);
      const formattedDateForRedirect = reservationDate
        .toISOString()
        .split("T")[0];
      history.push(`/dashboard?date=${formattedDateForRedirect}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
          margin: "auto",
        }}
      >
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="first_name">First Name:</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="last_name">Last Name:</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="mobile_number">Mobile Number:</label>
          <input
            type="tel"
            id="mobile_number"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="reservation_date">Date of Reservation:</label>
          <input
            type="date"
            id="reservation_date"
            name="reservation_date"
            value={formData.reservation_date}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="reservation_time">Time of Reservation:</label>
          <input
            type="time"
            id="reservation_time"
            name="reservation_time"
            value={formData.reservation_time}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="people">Number of People:</label>
          <input
            type="number"
            id="people"
            name="people"
            value={formData.people}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button type="submit">Submit</button>
          <button type="button" onClick={() => history.goBack()}>
            Cancel
          </button>
        </div>
      </form>
      <ErrorAlert error={error} />
    </div>
  );
}

export default ReservationForm;
