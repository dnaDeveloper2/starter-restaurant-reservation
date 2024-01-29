import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";
import "./NewReservation.css";

function NewReservation() {
    // Define initial state for the form

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };
  // State hooks for form data and handling errors

  const [formData, setFormData] = useState({ ...initialFormState });
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();

    // Function to handle form input changes

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  };

    // Function to handle form submission

  const handleSubmit = (event) => {
    event.preventDefault();
    setReservationsError(null);

    // Client-side validation
    const reservationDate = new Date(
      `${formData.reservation_date}T${formData.reservation_time}`
    );
    const today = new Date();
    if (reservationDate.getDay() === 2) {
      return setReservationsError({
        message: "The restaurant is closed on Tuesdays.",
      });
    }
    if (reservationDate < today) {
      return setReservationsError({
        message: "Reservations cannot be in the past.",
      });
    }
    if (
      formData.reservation_time < "10:30" ||
      formData.reservation_time > "21:30"
    ) {
      return setReservationsError({
        message: "Reservations must be between 10:30 AM and 9:30 PM.",
      });
    }

    const abortController = new AbortController();
    createReservation(formData, abortController.signal)
      .then(() => {
        history.push(`/dashboard?date=${formData.reservation_date}`);
      })
      .catch((error) => {
        setReservationsError(error);
        console.error("Error saving reservation:", error);
      });

    return () => abortController.abort();
  };
  
  // Render the new reservation form

  return (
    <div className="reservation-form-container">
      <h1>Create Reservation</h1>
      <ErrorAlert error={reservationsError} />
      <form onSubmit={handleSubmit} className="reservation-form">
        <div>
          <label htmlFor="first_name">First Name:</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            onChange={handleChange}
            value={formData.first_name}
            required
            className="reservation-input"
          />
        </div>
        <div>
          <label htmlFor="last_name">Last Name:</label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            onChange={handleChange}
            value={formData.last_name}
            required
          />
        </div>
        <div>
          <label htmlFor="mobile_number">Mobile Number:</label>
          <input
            id="mobile_number"
            name="mobile_number"
            type="tel"
            onChange={handleChange}
            value={formData.mobile_number}
            required
          />
        </div>
        <div>
          <label htmlFor="reservation_date">Date of Reservation:</label>
          <input
            id="reservation_date"
            name="reservation_date"
            type="date"
            onChange={handleChange}
            value={formData.reservation_date}
            required
          />
        </div>
        <div>
          <label htmlFor="reservation_time">Time of Reservation:</label>
          <input
            id="reservation_time"
            name="reservation_time"
            type="time"
            onChange={handleChange}
            value={formData.reservation_time}
            required
          />
        </div>
        <div>
          <label htmlFor="people">Number of People:</label>
          <input
            id="people"
            name="people"
            type="number"
            min="1"
            onChange={handleChange}
            value={formData.people}
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-button">
            Submit
          </button>
          <button
            type="button"
            onClick={() => history.goBack()}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewReservation;
