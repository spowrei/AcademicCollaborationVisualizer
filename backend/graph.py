class Graph:
    def __init__(self):
        # Adjacency list ile grafı tutuyoruz
        self.adjacency_list = {}
        self.edge_weights = {}

    def add_node(self, node_id):
        """Graf'a yeni bir düğüm ekle."""
        if node_id not in self.adjacency_list:
            self.adjacency_list[node_id] = []

    def add_edge(self, node1, node2, weight=1):
        """İki düğüm arasında kenar ekle ve ağırlık belirt."""
        # Düğümleri ekle (eğer yoksa)
        self.add_node(node1)
        self.add_node(node2)

        # Kenar ekle (çift yönlü)
        self.adjacency_list[node1].append(node2)
        self.adjacency_list[node2].append(node1)

        # Kenar ağırlığını kaydet
        self.edge_weights[(node1, node2)] = weight
        self.edge_weights[(node2, node1)] = weight

    def remove_node(self, node_id):
        """Bir düğümü ve ona bağlı tüm kenarları kaldır."""
        if node_id in self.adjacency_list:
            # Bağlı tüm kenarları kaldır
            for neighbor in self.adjacency_list[node_id]:
                self.adjacency_list[neighbor].remove(node_id)
                self.edge_weights.pop((node_id, neighbor), None)
                self.edge_weights.pop((neighbor, node_id), None)
            
            # Düğümü kaldır
            del self.adjacency_list[node_id]

    def remove_edge(self, node1, node2):
        """İki düğüm arasındaki kenarı kaldır."""
        if node2 in self.adjacency_list.get(node1, []):
            self.adjacency_list[node1].remove(node2)
            self.adjacency_list[node2].remove(node1)

            # Kenar ağırlığını kaldır
            self.edge_weights.pop((node1, node2), None)
            self.edge_weights.pop((node2, node1), None)

    def get_neighbors(self, node_id):
        """Bir düğümün komşularını döndür."""
        return self.adjacency_list.get(node_id, [])

    def get_edge_weight(self, node1, node2):
        """İki düğüm arasındaki kenar ağırlığını döndür."""
        return self.edge_weights.get((node1, node2), None)

    def get_nodes(self):
        """Tüm düğümleri döndür."""
        return list(self.adjacency_list.keys())

    def get_edges(self):
        """Tüm kenarları döndür."""
        edges = []
        for (node1, node2), weight in self.edge_weights.items():
            if (node2, node1, weight) not in edges:  # Çift yönlü kenarları tekrarlama
                edges.append((node1, node2, weight))
        return edges

    def display(self):
        """Grafı adjacency list formatında yazdır."""
        for node, neighbors in self.adjacency_list.items():
            print(f"{node} -> {neighbors}")


import heapq

def dijkstra(graph, start_node, end_node):
    """Dijkstra algoritması ile en kısa yolu bul."""
    # En kısa mesafeleri tutan sözlük
    shortest_distances = {node: float('inf') for node in graph.adjacency_list}
    shortest_distances[start_node] = 0

    # Öncelik kuyruğu (min-heap)
    priority_queue = [(0, start_node)]  # (mesafe, düğüm)
    previous_nodes = {}  # Önceki düğümleri tutmak için

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        # Eğer hedef düğüme ulaşıldıysa
        if current_node == end_node:
            path = []
            while current_node:
                path.insert(0, current_node)
                current_node = previous_nodes.get(current_node)
            return path, shortest_distances[end_node]

        # Komşuları kontrol et
        for neighbor in graph.get_neighbors(current_node):
            distance = graph.get_edge_weight(current_node, neighbor)
            new_distance = current_distance + distance

            # Daha kısa bir yol bulunduysa güncelle
            if new_distance < shortest_distances[neighbor]:
                shortest_distances[neighbor] = new_distance
                previous_nodes[neighbor] = current_node
                heapq.heappush(priority_queue, (new_distance, neighbor))

    return None, float('inf')  # Eğer yol bulunamazsa
