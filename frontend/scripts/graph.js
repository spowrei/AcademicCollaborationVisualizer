const canvas = document.getElementById("graph-canvas");
const ctx = canvas.getContext("2d");

// Canvas boyutlarını ayarla
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Grafik verisi (Başlangıçta boş)
let graphData = {
    nodes: [],
    edges: []
};

// Zoom özellikleri
let scale = 1;
let translateX = 0;
let translateY = 0;

// Backend'den graf verilerini çek ve grafiği çiz
async function loadGraphData() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/graph");
        if (!response.ok) {
            throw new Error("Graf verileri yüklenemedi.");
        }
        graphData = await response.json();
        drawGraph();
    } catch (error) {
        console.error(error);
    }
}

// Düğümler ve kenarları çiz
function drawGraph() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Uygun ölçek ve çeviri işlemleri
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    // Kenarları çiz
    graphData.edges.forEach(edge => {
        const fromNode = graphData.nodes.find(node => node.id === edge.from);
        const toNode = graphData.nodes.find(node => node.id === edge.to);
        if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Düğümleri çiz
    graphData.nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "#3498db";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.x, node.y);
    });

    ctx.restore();
}

// Düğüm tıklama kontrolü
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - translateX) / scale;
    const y = (event.clientY - rect.top - translateY) / scale;

    graphData.nodes.forEach(node => {
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (distance < 20) {
            alert(`Clicked on ${node.label}`);
        }
    });
});

// Zoom in ve zoom out işlemleri
canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const zoomFactor = 0.1;
    if (event.deltaY < 0) {
        scale *= 1 + zoomFactor; // Zoom in
    } else {
        scale *= 1 - zoomFactor; // Zoom out
    }
    drawGraph();
});

// "Show Sorted Collaborators" butonu için olay dinleyici
document.getElementById("show-sorted-collaborators-btn").addEventListener("click", () => {
    const authorId = parseInt(document.getElementById("author-id").value, 10);

    if (isNaN(authorId)) {
        alert("Please enter a valid author ID.");
        return;
    }

    sortCollaboratorsByWeight(authorId);
});

// Kuyruk sıralama fonksiyonu
function sortCollaboratorsByWeight(authorId) {
    const neighbors = graphData.edges
        .filter(edge => edge.from === authorId || edge.to === authorId)
        .map(edge => {
            const neighborId = edge.from === authorId ? edge.to : edge.from;
            const weight = edge.weight || 1; // Ağırlık varsayılan olarak 1
            return { id: neighborId, weight };
        })
        .sort((a, b) => b.weight - a.weight); // Ağırlığa göre sıralama

    // Kuyruğu canlı olarak göster
    const queueContainer = document.getElementById("queue-container");
    queueContainer.innerHTML = ""; // Mevcut içeriği temizle
    neighbors.forEach(neighbor => {
        const div = document.createElement("div");
        div.textContent = `Author ${neighbor.id}: Weight ${neighbor.weight}`;
        queueContainer.appendChild(div);
    });
}

// Graf verilerini yükle ve çiz
loadGraphData();
