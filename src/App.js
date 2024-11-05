import React, { useEffect, useState } from 'react';

function App() {
  const [graphResult, setGraphResult] = useState(null);

  useEffect(() => {
    // Fetch the graph_result value from the Flask server
    fetch('http://127.0.0.1:5000/api/graph_result')
      .then((response) => response.json())
      .then((data) => setGraphResult(data.graph_result))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // Helper function to format the graph result
  const formatGraphResult = (result) => {
    if (!result || !Array.isArray(result)) return "Loading...";

    // Map through the result, checking if each item is an array and formatting accordingly
    return result.map((item) => {
      if (Array.isArray(item)) {
        return `[${item.join(", ")}]`; // Format arrays with brackets
      }
      return item; // Return non-array items as is
    }).join(", ");
  };

  return (
    <div>
      <h1>Witaj na mojej testowej stronie!</h1>
      <p>To jest moja pierwsza aplikacja React uruchomiona w VS Code.</p>
      <p>Wynik grafu: {graphResult !== null ? formatGraphResult(graphResult) : "Loading..."}</p>
    </div>
  );
}

export default App;
