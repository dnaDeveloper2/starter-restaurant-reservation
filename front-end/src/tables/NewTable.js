import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/api";

function NewTable() {
    // Define initial state for the form

  const initialFormState = {
    table_name: "",
    capacity: 1,
  };

    // State hooks for form data and handling errors

  const [formData, setFormData] = useState({ ...initialFormState });
  const [tableError, setTableError] = useState(null);
  const history = useHistory();

    // Function to handle form input changes

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "capacity" ? Number(target.value) : target.value,
    });
  };

    // Function to handle form submission

  const handleSubmit = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    try {
      await createTable(formData, abortController.signal);
      history.push("/dashboard");
    } catch (error) {
      setTableError(error);
    }
    return () => abortController.abort();
  };

    // Render the form for creating a new table

  return (
    <div>
      <h1>Create New Table</h1>
      <ErrorAlert error={tableError} />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="table_name">Table Name:</label>
          <input
            id="table_name"
            name="table_name"
            type="text"
            minLength="2"
            onChange={handleChange}
            value={formData.table_name}
            required
          />
        </div>
        <div>
          <label htmlFor="capacity">Capacity:</label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            onChange={handleChange}
            value={formData.capacity}
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

export default NewTable;
