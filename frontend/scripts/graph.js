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

// Zoom ve pan (kaydırma) özellikleri
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

// Backend'den graf verilerini çek ve grafiği çiz
async function loadGraphData() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/graph");
        if (!response.ok) {
            throw new Error("Graf verileri yüklenemedi.");
        }
        graphData = await response.json();

        setNodeStyles();
        drawGraph();
    } catch (error) {
        console.error("Hata:", error);
    }
}

// Düğüm boyutlarını ve renklerini hesapla
function setNodeStyles() {
    const articleCounts = graphData.nodes.map(node => node.articleCount);
    if (articleCounts.length === 0) {
        console.warn("Makale sayıları boş.");
        return;
    }

    const averageCount = articleCounts.reduce((a, b) => a + b, 0) / articleCounts.length;

    graphData.nodes.forEach(node => {
        if (node.articleCount >= averageCount * 1.2) {
            node.size = 45; // Büyük düğüm boyutu
            node.color = "#2c3e50"; // Koyu renk
        } 
		else if (node.articleCount >= averageCount * 0.8)
		{
			node.size = 30;
			node.color ="#8fc8c3"
		}
		else {
            node.size = 15; // Küçük düğüm boyutu
            node.color = "#95a5a6"; // Açık renk
        }
    });
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
        ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
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
        if (distance < node.size) {
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

// Fare sürükleme (pan) olayları
canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left - translateX;
    startY = event.clientY - rect.top - translateY;
});

canvas.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const currentX = event.clientX - rect.left;
        const currentY = event.clientY - rect.top;

        translateX = currentX - startX;
        translateY = currentY - startY;

        drawGraph();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
});

// Graf verilerini yükle ve çiz
loadGraphData();
