import React, { useState } from 'react';
import axios from 'axios';

function Inc() {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/increment', {
        number: number,
      });
      setResult(response.data.result);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <h2>Powiększ liczbę</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Podaj liczbę:
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            style={{ marginLeft: "10px" }}
          />
        </label>
        <button type="submit" style={{ marginLeft: "10px" }}>Oblicz</button>
      </form>

      {result !== null && (
        <div style={{ marginTop: "10px", color: "green" }}>
          <h3>Wynik: {result}</h3>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "10px", color: "red" }}>
          <h3>{error}</h3>
        </div>
      )}
    </div>
  );
}

export default Inc;
