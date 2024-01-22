// SeatReservation.js
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { listTables, seatReservation } from "../utils/api";

function SeatReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      const tablesData = await listTables();
      setTables(tablesData);
    } catch (error) {
      console.log(tables)
      setError(error.message || "Failed to fetch tables");
    }
  }

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      await seatReservation(reservation_id, selectedTable);
      history.push("/dashboard");
    } catch (error) {
      console.log(selectedTable)
      setError(error.message || "Failed to seat reservation");
    }
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <div>
      <h2>Seat Reservation</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="table">Select Table:</label>
        <select
          id="table"
          name="table_id"
          value={selectedTable}
          onChange={handleTableChange}
          required
        >
          <option value="" disabled>
            Select a table
          </option>
          {tables.map((table) => (
            <option key={table.table_id} value={table.table_id}>
              {`${table.table_name} - ${table.capacity}`}
            </option>
          ))}
        </select>
        <div>
          <button type="submit">Submit</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default SeatReservation;
