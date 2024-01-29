import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables, seatTable } from "../utils/api";

function SeatReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    loadTables(abortController.signal);
    return () => abortController.abort();
  }, []);

  // Function to load available tables

  const loadTables = async (signal) => {
    try {
      const response = await listTables(signal);
      setTables(response);
    } catch (error) {
      setError(error);
    }
  };
  // Function to handle form submission

  const handleSubmit = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    try {
      await seatTable(tableId, reservation_id, abortController.signal);
      history.push("/dashboard");
    } catch (error) {
      setError(error);
    }
    return () => abortController.abort();
  };
  // Render the form for seating a reservation

  return (
    <div>
      <h1>Seat Reservation</h1>
      <ErrorAlert error={error} />

      <form onSubmit={handleSubmit}>
        <label htmlFor="table_id">Table Number:</label>
        <select
          name="table_id"
          id="table_id"
          onChange={(event) => setTableId(event.target.value)}
          value={tableId}
          required
        >
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table.table_id} value={table.table_id}>
              {table.table_name} - {table.capacity}
            </option>
          ))}
        </select>

        <button type="submit">Submit</button>
        <button type="button" onClick={() => history.goBack()}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatReservation;
