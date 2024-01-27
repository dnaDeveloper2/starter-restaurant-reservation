import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { listReservations, listTables, finishTable } from "../utils/api";
import ReservationCard from "../reservations/ReservationCard";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, next, today } from "../utils/date-time"; // Ensure these utility functions are implemented

function Dashboard() {
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [dashboardError, setDashboardError] = useState(null);
    const location = useLocation(); // Use useLocation hook to access the URL query
    const query = new URLSearchParams(location.search);
    const dateFromURL = query.get("date"); // Get date from URL query
    const [date, setDate] = useState(dateFromURL || today()); // Use date from URL or default to today
    const history = useHistory();

    useEffect(() => {
        loadDashboard(date);
    }, [date, location]); // Also re-run effect if location changes

    function loadDashboard(date) {
        const abortController = new AbortController();
        setDashboardError(null);
        
        listReservations({ date }, abortController.signal)
            .then(setReservations)
            .catch(setDashboardError);
        
        listTables(abortController.signal)
            .then(setTables)
            .catch(setDashboardError);
        
        return () => abortController.abort();
    }

    const handleFinish = async (tableId) => {
        if (window.confirm("Is this table ready to seat new guests? This cannot be undone.")) {
            const abortController = new AbortController();
            try {
                await finishTable(tableId, abortController.signal);
                loadDashboard(date); // Refresh the dashboard after freeing up the table
            } catch (error) {
                setDashboardError(error);
            }
            return () => abortController.abort();
        }
    };

    // Event handlers for date navigation buttons
    const handlePreviousDay = () => {
        const newDate = previous(date);
        setDate(newDate);
        history.push(`/dashboard?date=${newDate}`);
    };

    const handleNextDay = () => {
        const newDate = next(date);
        setDate(newDate);
        history.push(`/dashboard?date=${newDate}`);
    };

    const handleToday = () => {
        const newDate = today();
        setDate(newDate);
        history.push(`/dashboard?date=${newDate}`);
    };

    return (
        <main>
            <h1>Dashboard</h1>
            <ErrorAlert error={dashboardError} />
            
            <div className="date-navigation">
                <button onClick={handlePreviousDay}>Previous</button>
                <button onClick={handleToday}>Today</button>
                <button onClick={handleNextDay}>Next</button>
            </div>
            <h2>Reservations for {date}</h2>
            {reservations.map((reservation) => (
                <ReservationCard key={reservation.reservation_id} reservation={reservation} loadDashboard={() => loadDashboard(date)} />
            ))}

            <h2>Tables</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Finish</th>
                    </tr>
                </thead>
                <tbody>
                    {tables.map((table) => (
                        <tr key={table.table_id}>
                            <td>{table.table_name}</td>
                            <td>{table.capacity}</td>
                            <td data-table-id-status={table.table_id}>
                                {table.reservation_id ? 'Occupied' : 'Free'}
                            </td>
                            <td>
                                {table.reservation_id && (
                                    <button
                                        data-table-id-finish={table.table_id}
                                        onClick={() => handleFinish(table.table_id)}
                                    >
                                        Finish
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}

export default Dashboard;
