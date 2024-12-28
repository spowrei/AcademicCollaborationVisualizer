from flask import Flask, jsonify, request
from graph import Graph, dijkstra

# Flask uygulamasını başlat
app = Flask(__name__)

# Global graf nesnesi
graph = Graph()

# Örnek veri: Grafı manuel olarak doldur
graph.add_node(1)
graph.add_node(2)
graph.add_node(3)
graph.add_edge(1, 2, weight=3)
graph.add_edge(2, 3, weight=5)

@app.route('/')
def home():
    """
    Root route: API'nin çalıştığını doğrulamak için bir mesaj döndürür.
    """
    return jsonify({"message": "Flask API Çalışıyor!"}), 200

@app.route('/api/neighbors/<int:author_id>', methods=['GET'])
def get_neighbors(author_id):
    """
    Verilen yazar ID'sine göre komşu yazarları döndür.
    """
    neighbors = graph.get_neighbors(author_id)
    if not neighbors:
        return jsonify({"error": "Author not found or has no neighbors"}), 404

    response = {"author_id": author_id, "neighbors": neighbors}
    return jsonify(response), 200

@app.route('/api/shortest-path', methods=['GET'])
def shortest_path():
    """
    İki yazar arasındaki en kısa yolu hesapla.
    Parametreler: start_id, end_id
    """
    start_id = request.args.get('start_id', type=int)
    end_id = request.args.get('end_id', type=int)

    if start_id is None or end_id is None:
        return jsonify({"error": "start_id and end_id are required"}), 400

    path, total_weight = dijkstra(graph, start_id, end_id)
    if path is None:
        return jsonify({"error": "No path found"}), 404

    return jsonify({"path": path, "total_weight": total_weight}), 200

if __name__ == '__main__':
    # Flask uygulamasını başlat
    app.run(host="0.0.0.0", port=5000, debug=True)
