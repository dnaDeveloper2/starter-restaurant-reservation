import React from "react";
import { updateReservationStatus } from "../utils/api";

function ReservationCard({ reservation, loadReservations }) {
    // Function to handle reservation cancellation

  const handleCancel = async () => {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      try {
      // Update the reservation status to 'cancelled' using the API

        await updateReservationStatus(
          reservation.reservation_id,
          { status: "cancelled" },
          abortController.signal
        );
        loadReservations();
      } catch (error) {
        console.error("Cancellation failed", error);
      }
      return () => abortController.abort();
    }
  };
  // Format the reservation date for display

  const formattedDate = new Date(
    reservation.reservation_date
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

    // Render the reservation card with details and action buttons

  return (
    <div className="reservation-card">
      <div>
        <h4>
          {reservation.first_name} {reservation.last_name}
        </h4>
      </div>
      <div>
        <p>Mobile Number: {reservation.mobile_number}</p>
        <p>Date: {formattedDate}</p>
        <p>Time: {reservation.reservation_time}</p>
        <p>People: {reservation.people}</p>
        <p data-reservation-id-status={reservation.reservation_id}>
          Status: {reservation.status}
        </p>
      </div>
      <div>
        {reservation.status === "booked" && (
          <>
            <a
              href={`/reservations/${reservation.reservation_id}/seat`}
              className="btn btn-primary"
            >
              Seat
            </a>
            <a
              href={`/reservations/${reservation.reservation_id}/edit`}
              className="btn btn-secondary"
            >
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
