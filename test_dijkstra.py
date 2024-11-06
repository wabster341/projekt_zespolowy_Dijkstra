import pytest
from graph import Graph
from dijkstra import dijkstra

def test_dijkstra():
    graph = Graph(6, False)

    graph.add_edge(0, 1, 2)
    graph.add_edge(0, 2, 1)
    graph.add_edge(1, 3, 2)
    graph.add_edge(1, 4, 3)
    graph.add_edge(2, 4, 6)
    graph.add_edge(2, 5, 2)
    graph.add_edge(3, 5, 7)
    graph.add_edge(4, 5, 1)

    # Define the expected results as a list of tuples (i, j, (destination, path, cost))
    expected_results = [
        (0, 0, (0, [0], 0)),
        (0, 1, (1, [0, 1], 2)),
        (0, 2, (2, [0, 2], 1)),
        (0, 3, (3, [0, 1, 3], 4)),
        (0, 4, (4, [0, 2, 5, 4], 4)),
        (0, 5, (5, [0, 2, 5], 3)),
        (1, 0, (0, [1, 0], 2)),
        (1, 1, (1, [1], 0)),
        (1, 2, (2, [1, 0, 2], 3)),
        (1, 3, (3, [1, 3], 2)),
        (1, 4, (4, [1, 4], 3)),
        (1, 5, (5, [1, 4, 5], 4)),
        (2, 0, (0, [2, 0], 1)),
        (2, 1, (1, [2, 0, 1], 3)),
        (2, 2, (2, [2], 0)),
        (2, 3, (3, [2, 0, 1, 3], 5)),
        (2, 4, (4, [2, 5, 4], 3)),
        (2, 5, (5, [2, 5], 2)),
        (3, 0, (0, [3, 1, 0], 4)),
        (3, 1, (1, [3, 1], 2)),
        (3, 2, (2, [3, 1, 0, 2], 5)),
        (3, 3, (3, [3], 0)),
        (3, 4, (4, [3, 1, 4], 5)),
        (3, 5, (5, [3, 1, 4, 5], 6)),
        (4, 0, (0, [4, 5, 2, 0], 4)),
        (4, 1, (1, [4, 1], 3)),
        (4, 2, (2, [4, 5, 2], 3)),
        (4, 3, (3, [4, 1, 3], 5)),
        (4, 4, (4, [4], 0)),
        (4, 5, (5, [4, 5], 1)),
        (5, 0, (0, [5, 2, 0], 3)),
        (5, 1, (1, [5, 4, 1], 4)),
        (5, 2, (2, [5, 2], 2)),
        (5, 3, (3, [5, 4, 1, 3], 6)),
        (5, 4, (4, [5, 4], 1)),
        (5, 5, (5, [5], 0)),
    ]

    # Loop through each expected result
    for i, j, expected in expected_results:
        # Run the dijkstra function
        result = dijkstra(graph, i, j)
        
        # Assert that the result matches the expected output
        assert result == expected, f"Failed for dijkstra(graph, {i}, {j}): expected {expected}, got {result}"

