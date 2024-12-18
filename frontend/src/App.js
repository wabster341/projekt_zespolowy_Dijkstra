import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

// Komponent Graph - renderowanie grafu z podświetleniem ścieżki
function Graph({ graphData, highlightedPath }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData) return;

    const nodes = Array.from(new Set(graphData.flatMap(d => [d.source, d.target])))
      .map(id => ({ id }));
    const links = graphData.map(({ source, target, weight }) => ({ source, target, weight }));

    const svgElement = d3.select(svgRef.current)
      .attr("viewBox", "0 0 600 400")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("border", "1px solid black")
      .style("width", "100%")
      .style("height", "auto");

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(300, 200))
      .force("collide", d3.forceCollide(30));

    const link = svgElement.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", d => {
        const isHighlighted = highlightedPath?.some(
          path => (path.source === d.source.id && path.target === d.target.id) ||
                  (path.source === d.target.id && path.target === d.source.id)
        );
        return isHighlighted ? "red" : "#999";
      })
      .attr("stroke-width", d => highlightedPath?.some(
        path => (path.source === d.source.id && path.target === d.target.id) ||
                (path.source === d.target.id && path.target === d.source.id)
      ) ? 4 : 2);

    const edgeLabels = svgElement.append("g")
      .attr("class", "edge-labels")
      .selectAll("text")
      .data(links)
      .enter().append("text")
      .attr("font-size", 12)
      .attr("fill", "#333")
      .text(d => d.weight);

    const node = svgElement.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", "#69b3a2");

    const labels = svgElement.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .text(d => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      edgeLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 5);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y + 20);
    });

    return () => {
      simulation.stop();
      svgElement.selectAll("*").remove();
    };
  }, [graphData, highlightedPath]);

  return <svg ref={svgRef}></svg>;
}

function App() {
  const [graphResult, setGraphResult] = useState([]);
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Wybierz plik.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/inc", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setGraphResult(data.edges);
        setHighlightedPath(data.route);

        // Dodaj wynik do historii
        const newHistoryItem = {
          name: file.name,
          date: new Date().toLocaleString(),
          edges: data.edges,
          route: data.route,
        };
        setHistory(prev => [...prev, newHistoryItem]);

        setError(null);
      } else {
        setGraphResult([]);
        setHighlightedPath([]);
        setError(data.error || "Wystąpił błąd");
      }
    } catch (err) {
      setGraphResult([]);
      setHighlightedPath([]);
      setError("Błąd połączenia z serwerem.");
    }
  };

  const handleHistoryClick = (item) => {
    setGraphResult(item.edges);
    setHighlightedPath(item.route);
  };

  const handleDeleteHistory = (index) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ backgroundColor: "#f7f7f7", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Algorytm Dijkstra</h1>

      {/* Sekcja Graf */}
      <Graph graphData={graphResult} highlightedPath={highlightedPath} />

      {/* Ścieżka wyniku */}
      {highlightedPath.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Wynikowa ścieżka:</h3>
          <p style={{ fontWeight: "bold", fontSize: "18px" }}>
            {highlightedPath[0]?.source}, {highlightedPath.map(edge => edge.target).join(", ")}
          </p>
        </div>
      )}

      {/* Sekcja Wgrywania Pliku */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p><b>Wgraj swój graf</b></p>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button type="submit">Oblicz</button>
        </form>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </div>

      {/* Historia */}
      <div style={{ marginTop: "30px" }}>
        <h2>Historia</h2>
        <ul>
          {history.map((item, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <span 
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                onClick={() => handleHistoryClick(item)}
              >
                {item.name} - {item.date}
              </span>
              {" "}
              <button onClick={() => handleDeleteHistory(index)} style={{ marginLeft: "10px" }}>
                Usuń
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
