import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from "react-router-dom";
import { today, next, previous } from "../utils/date-time";
import "./Dashboard.css";

function Dashboard() {
  const location = useLocation();
  const history = useHistory();
  const [date, setDate] = useState(today());
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [date]);

  const handleFinishTable = (tableId) => {
    const confirmFinish = window.confirm("Is this table ready to seat new guests? This cannot be undone.");
  
    if (confirmFinish) {
      finishTable(tableId);
    }
  };
  
  const finishTable = async (tableId) => {
    const API_BASE_URL = "http://localhost:5001"
    try {
      
      // Send DELETE request to free up the table
      await fetch(`${API_BASE_URL}/tables/${tableId}/seat`, {
        method: 'DELETE',
      });
  
      // Refresh the list of tables after finishing the table
      loadDashboard();
    } catch (error) {
      console.error(error.message || 'Failed to finish table');
    }
  };

  async function loadDashboard() {
    try {
      const reservationsData = await listReservations({ date });
      setReservations(reservationsData);

      const tablesData = await listTables();
      setTables(tablesData);
    } catch (error) {
      setDashboardError(error.message || "Failed to fetch data");
    }
  }

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setDate(newDate);
  };

  const handleNextDay = () => {
    const nextDay = next(date);
    setDate(nextDay);
  };

  const handlePrevDay = () => {
    const prevDay = previous(date);
    setDate(prevDay);
  };

  const handleToday = () => {
    const todayDate = today();
    setDate(todayDate);
  };

  const getTableStatus = (tableId) => {
    const reservationAtTable = reservations.find((reservation) => reservation.table_id === tableId && reservation.status !== 'finished');
    return reservationAtTable ? "Occupied" : "Free";
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <label htmlFor="date">Select Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={handleDateChange}
        />
        <button onClick={handlePrevDay}>Previous</button>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNextDay}>Next</button>
      </div>
      <ErrorAlert error={dashboardError} />

      <div className="dashboard-grid">
        <div className="dashboard-tables">
          <h2>Tables</h2>
          <ul className="dashboard-tables-scrollable">
            {tables
              .sort((a, b) => a.table_name.localeCompare(b.table_name))
              .map((table) => {
                
                const tableStatus = getTableStatus(table.table_id);
                const isOccupied = tableStatus === "Occupied"
                return (
                  <li
                    key={table.table_id}
                    className={`dashboard-table ${
                      isOccupied ? "occupied" : "free"
                    }`}
                  >
                    <strong>Table ID:</strong> {table.table_id}
                    <br />
                    <strong>Table Name:</strong> {table.table_name}
                    <br />
                    <strong>Capacity:</strong> {table.capacity}
                    <br />
                    <strong>Status:</strong>{" "}
                    <span data-table-id-status={table.table_id}>
                      {tableStatus}
                    </span> <br />
                    {isOccupied && (
                      <>
                        <button
                        className="finish-button"
                          data-table-id-finish={table.table_id}
                          onClick={() => handleFinishTable(table.table_id)}
                        >
                          Finish
                        </button>
                        <hr />
                      </>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
         {/* Filter out finished reservations */}
         {reservations.filter(reservation => reservation.status !== 'finished').length > 0 ? (
          <div className="dashboard-reservations">
            <h2>Reservations</h2>
            <div className="reservations-scrollable">
              <ul>
              {reservations
                  .filter(reservation => reservation.status !== 'finished') // Filter out finished reservations
                  .map((reservation) => (
                  <li key={reservation.reservation_id}>
                    <br />
                    <strong>Name:</strong> {reservation.first_name}{" "}
                    {reservation.last_name}
                    <br />
                    <strong>Mobile Number:</strong> {reservation.mobile_number}
                    <br />
                    <strong>Date:</strong> {reservation.reservation_date}
                    <br />
                    <strong>Time:</strong> {reservation.reservation_time}
                    <br />
                    <strong>People:</strong> {reservation.people}
                    <br />
                    <strong>Created At:</strong> {reservation.created_at}
                    <br />
                    <strong>Updated At:</strong> {reservation.updated_at}
                    <br />
                 {/* Only show the Seat button for 'booked' reservations */}
                 {reservation.status === 'booked' && (
                      <a href={`/reservations/${reservation.reservation_id}/seat`}>Seat</a>
                    )}
                    <hr />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>No reservations found for the selected date.</p>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
