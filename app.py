from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing to allow React frontend to communicate with Flask backend

@app.route('/inc', methods=['POST'])
def calculate_increment():
    # Check if the file is included in the request
    if 'file' not in request.files:
        return jsonify({'error': 'Brak pliku'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Brak pliku'}), 400
    
    try:
        # Read the CSV file using pandas
        df = pd.read_csv(file)
        # Assume the first cell of the first column contains the number
        number = int(df.iloc[0, 0])
        print(df)
        # Increment the number
        result = number + 1

        return jsonify({'number': number, 'incremented_result': result})
    
    except ValueError:
        return jsonify({'error': 'Błędne dane'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
