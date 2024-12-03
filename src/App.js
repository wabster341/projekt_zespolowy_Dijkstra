import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import Inc from './Inc';

function Graph({ graphData, highlightedPath }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData) return;

    // Tworzenie unikalnych wierzchołków
    const nodes = Array.from(new Set(graphData.flatMap(d => [d.source, d.target])))
      .map(id => ({ id }));
    const links = graphData.map(({ source, target, weight }) => ({ source, target, weight }));

    // Czyszczenie SVG przed ponownym rysowaniem
    const svg = d3.select(svgRef.current)
      .selectAll("*")
      .remove();

    const svgElement = d3.select(svgRef.current)
      .attr("viewBox", "0 0 600 400")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("border", "1px solid black")
      .style("width", "100%")
      .style("height", "auto");

    // Inicjalizacja symulacji
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(300, 200))
      .force("collide", d3.forceCollide(30));

    // Rysowanie krawędzi
    const link = svgElement.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Rysowanie etykiet krawędzi
    const edgeLabels = svgElement.append("g")
      .attr("class", "edge-labels")
      .selectAll("text")
      .data(links)
      .enter().append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("fill", "#333")
      .attr("text-anchor", "middle")
      .attr("dy", -5) // Przesunięcie etykiet nieco w górę
      .text(d => d.weight);

    // Rysowanie wierzchołków
    const node = svgElement.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Rysowanie etykiet wierzchołków
    const labels = svgElement.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("dy", 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", 14)
      .attr("font-weight", "bold")
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .text(d => d.id);

    simulation.on("tick", () => {
      // Ograniczenie pozycji wierzchołków do granic SVG
      nodes.forEach(d => {
        d.x = Math.max(20, Math.min(580, d.x));
        d.y = Math.max(20, Math.min(370, d.y));
      });

      // Aktualizacja pozycji krawędzi
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      // Aktualizacja pozycji etykiet krawędzi
      edgeLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2 - 5); // Przesunięcie etykiet

      // Aktualizacja pozycji wierzchołków
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      // Aktualizacja pozycji etykiet wierzchołków
      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y + 20); // Przesunięcie etykiet poniżej wierzchołków
    });

    // Wyróżnianie ścieżki
    if (highlightedPath) {
      link
        .attr("stroke", d => {
          return highlightedPath.some(pathLink => (
            (pathLink.source === d.source.id && pathLink.target === d.target.id) ||
            (pathLink.source === d.target.id && pathLink.target === d.source.id)
          )) ? "#ff0000" : "#999";
        })
        .attr("stroke-width", d => {
          return highlightedPath.some(pathLink => (
            (pathLink.source === d.source.id && pathLink.target === d.target.id) ||
            (pathLink.source === d.target.id && pathLink.target === d.source.id)
          )) ? 4 : 2;
        });
    }

    // Debugowanie danych
    console.log("Nodes:", nodes);
    console.log("Links:", links);

    // Czyszczenie SVG przy odmontowaniu komponentu
    return () => {
      simulation.stop();
      svgElement.selectAll("*").remove();
    };
  }, [graphData, highlightedPath]);

  return (
    <svg ref={svgRef}></svg>
  );
}

function App() {
  const [graphResult, setGraphResult] = useState([
    { source: 0, target: 1, weight: 2 },
    { source: 0, target: 2, weight: 1 },
    { source: 1, target: 3, weight: 2 },
    { source: 1, target: 4, weight: 3 },
    { source: 2, target: 4, weight: 6 },
    { source: 2, target: 5, weight: 2 },
    { source: 3, target: 5, weight: 7 },
    { source: 4, target: 5, weight: 1 }
  ]);

  const [highlightedPath, setHighlightedPath] = useState([
    { source: 0, target: 1 },
    { source: 1, target: 4 },
    { source: 4, target: 5 }
  ]);

  // Historia grafów (nowa struktura)
  const [graphHistory, setGraphHistory] = useState([
    {
      edges: [
      { source: 0, target: 1, weight: 2 },
      { source: 0, target: 2, weight: 1 },
      { source: 1, target: 3, weight: 2 },
      { source: 1, target: 4, weight: 3 },
      { source: 2, target: 4, weight: 6 },
      { source: 2, target: 5, weight: 2 },
      { source: 3, target: 5, weight: 7 },
      { source: 4, target: 5, weight: 1 },
      { source: 5, target: 6, weight: 1 },
      { source: 6, target: 7, weight: 1 },
      { source: 7, target: 8, weight: 2 },
      { source: 8, target: 9, weight: 1 },
      { source: 6, target: 8, weight: 6 },
      { source: 7, target: 9, weight: 10 }
      ],
      shortestPath: [
        { source: 0, target: 1 },
        { source: 1, target: 4 },
        { source: 4, target: 5 },
        { source: 5, target: 6 },
        { source: 6, target: 7 },
        { source: 7, target: 8 },
        { source: 8, target: 9 },
      ]
    }
  ]);

  // Obsługa wgrywania pliku
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.graph_result) {
            setGraphResult(data.graph_result);
          } else {
            console.error("Nieprawidłowy format pliku.");
          }
        } catch (error) {
          console.error("Błąd podczas parsowania pliku:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Dodanie aktualnego grafu i najkrótszej ścieżki do historii
  const addGraphToHistory = () => {
    setGraphHistory((prevHistory) => [
      ...prevHistory,
      {
        edges: graphResult, // Krawędzie grafu (dane o wagach)
        shortestPath: highlightedPath // Najkrótsza ścieżka (bez wag)
      }
    ]);
  };

  // Ustawienie grafu i najkrótszej ścieżki z historii
  const handleGraphClick = (index) => {
    const selectedGraph = graphHistory[index];
    setGraphResult(selectedGraph.edges); // Ustaw dane o krawędziach
    setHighlightedPath(selectedGraph.shortestPath); // Ustaw najkrótszą ścieżkę
  };

  // Przełącznik menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Wybierz plik.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/inc', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setError(null);
      } else {
        setResult(null);
        setError(data.error || 'Wystąpił błąd');
      }
    } catch (err) {
      setResult(null);
      setError('Błąd połączenia z serwerem.');
    }
  };

  return (
    <div style={{ backgroundColor: "#f7f7f7", padding: "20px", position: "relative" }}>
      {/* Przycisk menu */}
      <button
        onClick={toggleMenu}
        style={{ position: "absolute", top: "20px", left: "20px", fontSize: "24px", zIndex: 10 }}
      >
        ☰
      </button>

      <h1 style={{ textAlign: "center", fontFamily: "Arial, sans-serif", marginTop: "60px" }}>
        Algorytm Dijkstra
      </h1>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "#fff",
            width: "250px",
            height: "100%",
            boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            zIndex: 5
          }}
        >
          <h3>Historia grafów</h3>
          {graphHistory.map((graph, index) => (
            <div
              key={index}
              style={{ cursor: "pointer", marginBottom: "10px" }}
              onClick={() => handleGraphClick(index)}
            >
              <p>Graf {index + 1}</p>
            </div>
          ))}
          <button onClick={toggleMenu} style={{ marginTop: "20px" }}>
            Zamknij menu
          </button>
        </div>
      )}

      {/* Główna zawartość */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          marginTop: "20px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ flex: "1 1 600px", maxWidth: "800px" }}>
          <Graph graphData={graphResult} highlightedPath={highlightedPath} />
        </div>

          {/* Increment calculation */}
          <Inc />
        <div style={{ maxWidth: "300px", marginLeft: "20px", flex: "1 1 300px" }}>
          <h2>Opis problemu:</h2>
          <p>
            Dla zadanego grafu poszukujemy najkrótszej ścieżki od punktu <b>0</b> do punktu <b>5</b>.
          </p>
          <p>
            Najkrótsza ścieżka: <b>0 → 1 → 4 → 5</b>
            <br />
            Suma wag najkrótszej ścieżki: <b>6</b>
          </p>
        </div>
      </div>



      {/* Sekcja wgrywania pliku */}
      <div style={{ padding: "20px" }}>
      <h1>Powiększanie liczby z pliku CSV</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit">Oblicz</button>
      </form>

      {result && (
        <div>
          <h2>Wynik</h2>
          <p>Początkowa liczba: {result.number}</p>
          <p>Końcowa liczba: {result.incremented_result}</p>
        </div>
      )}

      {error && (
        <div style={{ color: "red" }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p>
          <b>Wgraj swój graf</b>
        </p>
        <input type="file" accept="application/json" onChange={handleFileUpload} />
      </div>

      {/* Przycisk dodania grafu do historii */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button onClick={addGraphToHistory}>Dodaj graf do historii</button>
      </div>

      {/* Informacje o algorytmie */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <h3>O algorytmie Dijkstra</h3>
        <p>
          Algorytm Dijkstry służy do znajdowania najkrótszej ścieżki w grafie z wagami nieujemnymi.
          Działa na zasadzie stopniowego wyznaczania minimalnych kosztów dojścia do każdego
          wierzchołka.
        </p>
      </div>
    </div>
  );
}

export default App;