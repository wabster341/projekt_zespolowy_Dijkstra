from flask import Flask, jsonify
from flask_cors import CORS
import dijkstra  # Import your dijkstra module

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/api/graph_result', methods=['GET'])
def get_graph_result():
    graph_result = dijkstra.graph_result  # Fetch graph result from dijkstra.py
    
    # Convert tuple to list for JSON serialization
    result_as_list = list(graph_result)
    return jsonify({"graph_result": result_as_list})

if __name__ == '__main__':
    app.run(debug=True)
