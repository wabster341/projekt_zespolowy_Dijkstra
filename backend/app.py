from flask import Flask, request, jsonify
from flask_cors import CORS
from dijkstra import process_csv, dijkstra, list_to_graph
import os

app = Flask(__name__)
CORS(app)  # Umożliwia komunikację z React frontendem (CORS)

@app.route("/inc", methods=["POST"])
def calculate_increment():
    # Sprawdzenie, czy plik jest dołączony w żądaniu
    if "file" not in request.files:
        return jsonify({"error": "Brak pliku"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Brak pliku"}), 400

    try:
        # Procesowanie pliku CSV
        edges, source, destination = process_csv(file)
        graph = list_to_graph(edges)
        end, route, route_cost = dijkstra(graph, source, destination)

        # Formatowanie odpowiedzi
        edges_response = [{"source": edge[0], "target": edge[1], "weight": edge[2]} for edge in edges]
        route_response = [{"source": route[i], "target": route[i + 1]} for i in range(len(route) - 1)]

        return jsonify({
            "edges": edges_response,
            "route": route_response,
            "route_cost": route_cost
        })

    except ValueError:
        return jsonify({"error": "Błędne dane w pliku"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Dostosowanie do Azure
    app.run(host="0.0.0.0", port=port)
