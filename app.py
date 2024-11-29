from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing to allow React frontend to communicate with Flask backend

@app.route('/increment', methods=['POST'])
def calculate_increment():
    data = request.json
    try:
        number = int(data.get('number'))

        result = number + 1
        return jsonify({'result': result})
    except ValueError:
        return jsonify({'error': 'Invalid input. Please enter a valid number.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
