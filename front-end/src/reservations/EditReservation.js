import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { readReservation, updateReservation } from '../utils/api';
import ErrorAlert from '../layout/ErrorAlert';

function EditReservation() {
    const initialFormState = {
        first_name: '',
        last_name: '',
        mobile_number: '',
        reservation_date: '',
        reservation_time: '',
        people: 1,
    };

    const [formData, setFormData] = useState({ ...initialFormState });
    const [reservationError, setReservationError] = useState(null);
    const history = useHistory();
    const { reservation_id } = useParams();

    useEffect(loadReservation, [reservation_id]);

    function loadReservation() {
        const abortController = new AbortController();
        setReservationError(null);
        readReservation(reservation_id, abortController.signal)
            .then(setFormData)
            .catch(setReservationError);
        return () => abortController.abort();
    }

    const handleChange = ({ target }) => {
        setFormData({
            ...formData,
            [target.name]: target.name === 'people' ? Number(target.value) : target.value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setReservationError(null);

        // Client-side validation
        const reservationDate = new Date(`${formData.reservation_date}T${formData.reservation_time}`);
        const today = new Date();
        if (reservationDate.getDay() === 2) {
            return setReservationError({ message: "The restaurant is closed on Tuesdays." });
        }
        if (reservationDate < today) {
            return setReservationError({ message: "Reservations cannot be in the past." });
        }
        if (formData.reservation_time < "10:30" || formData.reservation_time > "21:30") {
            return setReservationError({ message: "Reservations must be between 10:30 AM and 9:30 PM." });
        }

        const abortController = new AbortController();
        updateReservation({ ...formData, reservation_id }, abortController.signal)
            .then(() => {
                history.push(`/dashboard?date=${formData.reservation_date}`);
            })
            .catch(setReservationError);
        return () => abortController.abort();
    };

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
                <button type="button" onClick={() => history.goBack()}>Cancel</button>
            </form>
        </div>
    );
}

export default EditReservation;
