import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
// import Inc from './Inc';

function Graph({ graphData, highlightedPath }) {
        const svgRef = useRef(null);

        useEffect(() => {
                if (!graphData) return;

                // Tworzenie unikalnych wierzchołków
                const nodes = Array.from(new Set(graphData.flatMap(d => [d.source, d.target])))
                        .map(id => ({ id }));
                const links = graphData.map(({ source, target, weight }) => ({ source, target, weight }));

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

        // Przełącznik menu
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
                        <h1 style={{ textAlign: "center", fontFamily: "Arial, sans-serif", marginTop: "60px" }}>
                                Algorytm Dijkstra
                        </h1>

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

                        </div>



                        {/* Sekcja wgrywania pliku */}
                        <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <p>
                                        <b>Wgraj swój graf</b>
                                </p>
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
                </div>
        );
}

export default App;
