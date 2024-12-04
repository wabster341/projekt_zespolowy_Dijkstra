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
        end, route, route_cost = dijkstra(list_to_graph(edges), source, destination)
        return jsonify(
            {
                "edges": edges,
                "source": source,
                "destination": destination,
                "end": end,
                "route": route,
                "route_cost": route_cost,
            }
        )

    except ValueError:
        return jsonify({"error": "Błędne dane"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
