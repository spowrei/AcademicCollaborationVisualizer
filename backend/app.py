from flask import Flask, jsonify, request
from flask_cors import CORS  # CORS'ı import edin
from graph import Graph, dijkstra
from data_processing import read_excel_and_parse

# Flask uygulamasını başlat
app = Flask(__name__)

# CORS'ı etkinleştir
CORS(app)  # Bu satır, CORS başlıklarını otomatik olarak ekler

# Global graf nesnesi
graph = Graph()

# Excel'den verileri yükle
file_path = '..\\dataset.xlsx'  # Excel dosyasının doğru yolu
author_id_map, articles = read_excel_and_parse(file_path)

# Grafı oluştur
for article in articles:
    for i, author1 in enumerate(article['authors']):
        for author2 in article['authors'][i+1:]:
            graph.add_node(author1)
            graph.add_node(author2)
            graph.add_edge(author1, author2, weight=1)


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


@app.route('/api/graph', methods=['GET'])
def get_graph():
    """
    Tüm graf verilerini döndürür.
    """
    nodes = [
        {"id": node_id, "label": f"Author {node_id}", "x": index * 100 + 50, "y": index * 100 + 50}
        for index, node_id in enumerate(graph.get_nodes())
    ]
    edges = [
        {"from": edge[0], "to": edge[1], "weight": edge[2]}
        for edge in graph.get_edges()
    ]
    return jsonify({"nodes": nodes, "edges": edges}), 200


if __name__ == '__main__':
    # Flask uygulamasını başlat
    app.run(host="0.0.0.0", port=5000, debug=True)
