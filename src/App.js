import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

function Graph({ graphData }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData) return;

    // Parse nodes and links from graphData
    const nodes = Array.from(new Set(graphData.flatMap(d => [d.source, d.target])))
      .map(id => ({ id }));
    const links = graphData.map(({ source, target, weight }) => ({ source, target, weight }));

    const svg = d3.select(svgRef.current)
      .attr("width", 600)
      .attr("height", 400);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(300, 200))
      .force("collide", d3.forceCollide(30)); // Prevent overlapping

    // Draw edges (links)
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2); // Set a uniform stroke width

    // Draw edge weights
    const edgeLabels = svg.append("g")
      .attr("class", "edge-labels")
      .selectAll("text")
      .data(links)
      .enter().append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("fill", "#333")
      .text(d => d.weight);

    // Draw nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Add bold, larger labels for nodes
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("dy", 3)
      .attr("font-family", "sans-serif")
      .attr("font-size", 16)  // Larger font size
      .attr("font-weight", "bold") // Make it bold
      .attr("fill", "#000") // Darker color for visibility
      .text(d => d.id);

    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      // Position edge weight labels at the midpoint of each edge
      edgeLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x + 12)
        .attr("y", d => d.y + 3);
    });

    // Cleanup function to remove previous SVG content on unmount
    return () => svg.selectAll("*").remove();
  }, [graphData]);

  return <svg ref={svgRef}></svg>;
}

function App() {
  const [graphResult, setGraphResult] = useState([
    // Default example graph data
    { source: 0, target: 1, weight: 2 },
    { source: 0, target: 2, weight: 1 },
    { source: 1, target: 3, weight: 2 },
    { source: 1, target: 4, weight: 3 },
    { source: 2, target: 4, weight: 6 },
    { source: 2, target: 5, weight: 2 },
    { source: 3, target: 5, weight: 7 },
    { source: 4, target: 5, weight: 1 }
  ]);

  useEffect(() => {
    // Fetch graph data from the Flask server
    fetch('http://127.0.0.1:5000/api/graph_result')
      .then((response) => response.json())
      .then((data) => setGraphResult(data.graph_result || graphResult)) // Set to API data or default
      .catch((error) => {
        console.error('Error fetching data:', error);
        // Keep the default data on error
      });
  }, []);

  const formatGraphResult = (result) => {
    if (!result || !Array.isArray(result)) return "Loading...";
    return result.map((item) => {
      if (typeof item === 'object' && item.source !== undefined) {
        return `[${item.source} -(${item.weight})-> ${item.target}]`;
      }
      return item;
    }).join(", ");
  };

  return (
    <div>
      <h1>Witaj na mojej testowej stronie!</h1>
      <p>To jest moja pierwsza aplikacja React uruchomiona w VS Code.</p>
      <p>Wynik grafu: {graphResult ? formatGraphResult(graphResult) : "Loading..."}</p>
      <Graph graphData={graphResult} />
    </div>
  );
}

export default App;
