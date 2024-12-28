// API çağrısı yap ve işbirlikçi yazarları al
async function fetchNeighbors(authorId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/neighbors/${authorId}`);
        if (!response.ok) {
            throw new Error(`Error fetching neighbors: ${response.status}`);
        }
        const data = await response.json();
        return data.neighbors;
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch neighbors. Please check the API or the author ID.");
        return [];
    }
}

// Yeni düğümleri ve kenarları grafiğe ekle
function updateGraphWithNeighbors(authorId, neighbors) {
    // Düğüm ve kenarları kontrol ederek ekle
    neighbors.forEach(neighborId => {
        // Eğer düğüm zaten grafikte yoksa ekle
        if (!graphData.nodes.some(node => node.id === neighborId)) {
            graphData.nodes.push({
                id: neighborId,
                x: Math.random() * canvas.width, // Rastgele konum
                y: Math.random() * canvas.height,
                label: `Author ${neighborId}`,
            });
        }

        // Kenar ekle (mevcut değilse)
        if (!graphData.edges.some(edge => 
            (edge.from === authorId && edge.to === neighborId) ||
            (edge.from === neighborId && edge.to === authorId)
        )) {
            graphData.edges.push({ from: authorId, to: neighborId });
        }
    });

    // Grafiği yeniden çiz
    drawGraph();
}

// Kontrol panelindeki "Show Neighbors" butonu için olay dinleyici
document.getElementById("show-neighbors-btn").addEventListener("click", async () => {
    const authorIdInput = document.getElementById("author-id").value;
    const authorId = parseInt(authorIdInput, 10);

    if (isNaN(authorId)) {
        alert("Please enter a valid author ID.");
        return;
    }

    // API'den komşuları al
    const neighbors = await fetchNeighbors(authorId);

    // Grafiği güncelle
    updateGraphWithNeighbors(authorId, neighbors);
});

async function fetchShortestPath(startId, endId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/shortest-path?start_id=${startId}&end_id=${endId}`);
        if (!response.ok) {
            throw new Error(`Error fetching shortest path: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch shortest path. Please check the API or the IDs.");
        return null;
    }
}

// En kısa yolu grafikte göster
function highlightShortestPath(path) {
    if (!path || path.length < 2) {
        alert("No path found.");
        return;
    }

    graphData.edges.forEach(edge => {
        const isInPath = path.some((node, index) => 
            (node === edge.from && path[index + 1] === edge.to) ||
            (node === edge.to && path[index + 1] === edge.from)
        );
        if (isInPath) {
            edge.highlight = true; // Kenarı işaretle
        }
    });

    drawGraph();
}

// "Find Shortest Path" butonu için olay dinleyici
document.getElementById("shortest-path-btn").addEventListener("click", async () => {
    const startId = parseInt(document.getElementById("start-author").value, 10);
    const endId = parseInt(document.getElementById("end-author").value, 10);

    if (isNaN(startId) || isNaN(endId)) {
        alert("Please enter valid author IDs.");
        return;
    }

    const result = await fetchShortestPath(startId, endId);
    if (result) {
        highlightShortestPath(result.path);
    }
});
