/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
// Helper function to fetch data from the API
async function fetchData(url, options = {}) {
    const response = await fetch(url, options);
    if (response.status === 204) {
        return null;
    }
    const payload = await response.json();
    if (payload.error) {
        return Promise.reject({ message: payload.error });
    }
    return payload.data;
}

// Create a new reservation
export async function createReservation(reservation, signal) {
    const url = new URL(`${API_BASE_URL}/reservations`);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: reservation }),
        signal,
    };
    return fetchData(url, options);
}

// Update an existing reservation
export async function updateReservation(reservation, signal) {
    const url = new URL(`${API_BASE_URL}/reservations/${reservation.reservation_id}`);
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: reservation }),
        signal,
    };
    return fetchData(url, options);
}

// Search for reservations by phone number
export async function searchReservations(mobileNumber, signal) {
    const url = new URL(`${API_BASE_URL}/reservations?mobile_number=${mobileNumber}`);
    const options = {
        method: 'GET',
        signal,
    };
    return fetchData(url, options);
}

// List reservations for a specific date
export async function listReservations({ date }, signal) {
    const url = new URL(`${API_BASE_URL}/reservations?date=${date}`);
    const options = {
        method: 'GET',
        signal,
    };
    return fetchData(url, options);
}

// List all tables
export async function listTables(signal) {
    const url = new URL(`${API_BASE_URL}/tables`);
    const options = {
        method: 'GET',
        signal,
    };
    return fetchData(url, options);
}

// Create a new table
export async function createTable(table, signal) {
    const url = new URL(`${API_BASE_URL}/tables`);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: table }),
        signal,
    };
    return fetchData(url, options);
}

// Seat a reservation at a table
export async function seatTable(tableId, reservationId, signal) {
    const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { reservation_id: reservationId } }), // Correctly format the request body
        signal,
    };
    return fetchData(url, options);
}

// Finish an occupied table
export async function finishTable(tableId, signal) {
    const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`);
    const options = {
        method: 'DELETE',
        signal,
    };
    return fetchData(url, options);
}

// Get a specific reservation
export async function readReservation(reservationId, signal) {
    const url = new URL(`${API_BASE_URL}/reservations/${reservationId}`);
    const options = {
        method: 'GET',
        signal,
    };
    return fetchData(url, options);
}

// Set the status of a reservation
export async function setReservationStatus(reservationId, status, signal) {
    const url = new URL(`${API_BASE_URL}/reservations/${reservationId}/status`);
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { status } }),
        signal,
    };
    return fetchData(url, options);
}

export async function updateReservationStatus(reservationId, statusUpdate, signal) {
    const url = `${API_BASE_URL}/reservations/${reservationId}/status`;
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: statusUpdate }),
        signal,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);  // Log the error response from the server
        throw new Error('Network response was not ok.');
    }
    return await response.json();
}