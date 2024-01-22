// TableForm.jsx

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
const API_BASE_URL = "http://localhost:5001"

function TableForm() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    table_name: "",
    capacity: 1,
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validation checks for table_name and capacity
    if (formData.table_name.length < 2) {
      alert("Table name must be at least 2 characters long.");
      return;
    }
  
    if (formData.capacity < 1) {
      alert("Capacity must be at least 1 person.");
      return;
    }
  
    try {
      // Make a POST request to save the new table
      const response = await fetch(`${API_BASE_URL}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create table');
      }
  
      // After successfully saving the table, navigate to the dashboard
      history.push("/dashboard");
    } catch (error) {
      console.error(error);
      // Handle error appropriately (e.g., show an error message)
    }
  };

  const handleCancel = () => {
    // Navigate back to the previous page
    history.goBack();
  };

  return (
    <div>
      <h1>Create New Table</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="table_name">Table Name:</label>
          <input
            type="text"
            id="table_name"
            name="table_name"
            value={formData.table_name}
            onChange={handleChange}
            minLength="2"
            required
          />
        </div>
        <div>
          <label htmlFor="capacity">Capacity:</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div>
          <button type="submit">Submit</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default TableForm;
