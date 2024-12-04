from flask import Flask, request, jsonify
from flask_cors import CORS
from dijkstra import process_csv, dijkstra, list_to_graph

app = Flask(__name__)
CORS(
    app
)  # Enable Cross-Origin Resource Sharing to allow React frontend to communicate with Flask backend


@app.route("/inc", methods=["POST"])
def calculate_increment():
    # Check if the file is included in the request
    if "file" not in request.files:
        return jsonify({"error": "Brak pliku"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Brak pliku"}), 400

    try:
        edges, source, destination = process_csv(file.filename)
        edges = [[edge[0], edge[1], edge[2]] for edge in edges]
        end, route, route_cost = dijkstra(list_to_graph(edges), source, destination)
        edges = [ {"source" : edge[0], "target" : edge[1], "weight" : edge[2]}
                  for edge in edges]
        route = [ {"source" : route[i], "target" : route[i+1]} for i in range(len(route)-1)]
        print(edges, route)
        return jsonify(
            {
                "edges": edges,
                "route": route,
            }
        )

    except ValueError:
        return jsonify({"error": "Błędne dane"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
