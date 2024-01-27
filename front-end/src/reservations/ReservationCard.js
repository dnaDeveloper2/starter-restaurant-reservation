import React from 'react';
import { useHistory } from 'react-router-dom';
import { updateReservation } from '../utils/api'; // Make sure to implement this function in your API file

function ReservationCard({ reservation, loadReservations }) {
    const history = useHistory();

    const handleEdit = () => {
        history.push(`/reservations/${reservation.reservation_id}/edit`);
    };

    const handleCancel = async () => {
        if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
            const abortController = new AbortController();
            try {
                await updateReservation(reservation.reservation_id, 'cancelled', abortController.signal);
                loadReservations(); // Refresh the reservations list after canceling
            } catch (error) {
                console.error("Cancellation failed", error);
            }
            return () => abortController.abort();
        }
    };

    return (
        <div className="reservation-card">
            <div>
                <h4>{reservation.first_name} {reservation.last_name}</h4>
            </div>
            <div>
                <p>Mobile Number: {reservation.mobile_number}</p>
                <p>Date: {reservation.reservation_date}</p>
                <p>Time: {reservation.reservation_time}</p>
                <p>People: {reservation.people}</p>
                <p>Status: {reservation.status}</p>
            </div>
            <div>
                {reservation.status === 'booked' && (
                    <a href={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary">
                        Seat
                    </a>
                )}
                {/* Include other buttons/actions as needed */}
            </div>
        </div>
    );
}


export default ReservationCard;
