import React from 'react';
import { updateReservationStatus } from '../utils/api'; // Make sure to implement this function in your API file

function ReservationCard({ reservation, loadReservations }) {

    const handleCancel = async () => {
        if (window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
            const abortController = new AbortController();
            try {
                await updateReservationStatus(reservation.reservation_id, { status: 'cancelled' }, abortController.signal);
                loadReservations(); // Refresh the reservations list after canceling
            } catch (error) {
                console.error("Cancellation failed", error);
            }
            return () => abortController.abort();
        }
    };

    const formattedDate = new Date(reservation.reservation_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return (
        <div className="reservation-card">
            <div>
                <h4>{reservation.first_name} {reservation.last_name}</h4>
            </div>
            <div>
                <p>Mobile Number: {reservation.mobile_number}</p>
                <p>Date: {formattedDate}</p> {/* Use the formatted date */}
                <p>Time: {reservation.reservation_time}</p>
                <p>People: {reservation.people}</p>
                <p data-reservation-id-status={reservation.reservation_id}>
                Status: {reservation.status}
                </p>
            </div>
            <div>
                {reservation.status === 'booked' && (
                    <>
                        <a href={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary">
                            Seat
                        </a>
                        <a href={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-secondary">
                            Edit
                        </a>
                        <button
                            data-reservation-id-cancel={reservation.reservation_id}
                            onClick={handleCancel}
                            className="btn btn-danger"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ReservationCard;
