import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import ErrorAlert from "../layout/ErrorAlert";
import { createTable } from "../utils/api"; 

function NewTable() {
  const initialFormState = {
      table_name: '',
      capacity: 1,
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [tableError, setTableError] = useState(null);
  const history = useHistory();

  const handleChange = ({ target }) => {
      setFormData({
          ...formData,
          [target.name]: target.name === 'capacity' ? Number(target.value) : target.value,
      });
  };

  const handleSubmit = async (event) => {
      event.preventDefault();
      const abortController = new AbortController();
      try {
          await createTable(formData, abortController.signal);
          history.push('/dashboard'); // Redirect to dashboard after creating table
      } catch (error) {
          setTableError(error);
      }
      return () => abortController.abort();
  };

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
                      minLength="2" // Ensuring table name has at least 2 characters
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
                      min="1" // Ensuring capacity is at least 1
                      onChange={handleChange}
                      value={formData.capacity}
                      required
                  />
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => history.goBack()}>Cancel</button>
          </form>
      </div>
  );
}

export default NewTable;
