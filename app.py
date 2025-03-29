from flask import Flask, jsonify, request, send_from_directory
import os
import json

app = Flask(__name__)

# Path to the favorites JSON file
FAVORITES_FILE = os.path.join(os.path.dirname(__file__), 'data', 'favorites.json')

# Ensure the data directory exists
os.makedirs(os.path.dirname(FAVORITES_FILE), exist_ok=True)

# Load favorites from the JSON file
def load_favorites():
    if os.path.exists(FAVORITES_FILE):
        with open(FAVORITES_FILE, 'r') as file:
            return json.load(file)
    return []

# Save favorites to the JSON file
def save_favorites(favorites):
    with open(FAVORITES_FILE, 'w') as file:
        json.dump(favorites, file)

# Serve the frontend
@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/favorites')
def favorites_page():
    return send_from_directory('../frontend', 'favorites.html')

# API to get favorites
@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    favorites = load_favorites()
    return jsonify(favorites)

# API to add a favorite
@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    data = request.json
    favorites = load_favorites()
    if not any(recipe['id'] == data['id'] for recipe in favorites):
        favorites.append(data)
        save_favorites(favorites)
    return jsonify({"message": "Added to favorites!"}), 201

# API to remove a favorite
@app.route('/api/favorites/<int:recipe_id>', methods=['DELETE'])
def remove_favorite(recipe_id):
    favorites = load_favorites()
    favorites = [recipe for recipe in favorites if recipe['id'] != recipe_id]
    save_favorites(favorites)
    return jsonify({"message": "Removed from favorites!"}), 200

# Serve static files (CSS, JS, images)
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../frontend', filename)

if __name__ == '__main__':
    app.run(debug=True)