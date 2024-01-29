import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { readReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function EditReservation() {
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
  const [reservationError, setReservationError] = useState(null);
  const history = useHistory();
  const { reservation_id } = useParams();

    // useEffect hook to fetch reservation data when the component mounts or reservation_id changes

  useEffect(() => {
    const abortController = new AbortController();
    setReservationError(null);
    readReservation(reservation_id, abortController.signal)
      .then((fetchedReservation) => {
        const formattedTime = fetchedReservation.reservation_time
          .split(":")
          .slice(0, 2)
          .join(":");
        setFormData({
          ...fetchedReservation,
          reservation_date: fetchedReservation.reservation_date.slice(0, 10), // Adjust the slice as needed to match "YYYY-MM-DD" format
          reservation_time: formattedTime, // Maintain the original time format (without seconds)
          people: Number(fetchedReservation.people), // Ensure `people` is a number
        });
      })
      .catch(setReservationError);
    return () => abortController.abort();
  }, [reservation_id]);

    // Function to handle form input changes

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  };

    // Function to handle form submission

  const handleSubmit = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setReservationError(null);

    try {
      await updateReservation(
        { ...formData, reservation_id },
        abortController.signal
      );
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setReservationError(error);
    } finally {
      console.log(formData);
      abortController.abort();
    }
  };

    // Render the edit reservation form

  return (
    <div>
      <h1>Edit Reservation</h1>
      <ErrorAlert error={reservationError} />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first_name">First Name:</label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            onChange={handleChange}
            value={formData.first_name}
            required
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
        <button type="submit">Submit</button>
        <button type="button" onClick={() => history.goBack()}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default EditReservation;
