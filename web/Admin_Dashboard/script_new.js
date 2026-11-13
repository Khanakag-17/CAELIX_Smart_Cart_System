function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('expandable-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebarLinks = sidebar.querySelectorAll('a');

    // Bind main toggle if exists
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    // Try to bind cart toggle later if it becomes visible
    function bindCartToggleIfVisible() {
        const cartToggle = document.getElementById('sidebar-toggle-btn-cart');
        if (cartToggle && !cartToggle.hasAttribute('data-bound')) {
            cartToggle.setAttribute('data-bound', 'true');
            cartToggle.addEventListener('click', function (e) {
                e.stopPropagation();
                sidebar.classList.toggle('active');
            });
        }
    }

    // Bind once when monitoring section shown
    const monitoringLink = document.getElementById('monitoring-link');
    if (monitoringLink) {
        monitoringLink.addEventListener('click', () => {
            setTimeout(bindCartToggleIfVisible, 100); // wait for header to appear
        });
    }

    // Auto-close on link click
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function () {
            sidebar.classList.remove('active');
        });
    });

    // Close on outside click
    document.addEventListener('click', function (event) {
        if (
            !sidebar.contains(event.target) &&
            !toggleBtn?.contains(event.target) &&
            !document.getElementById('sidebar-toggle-btn-cart')?.contains(event.target)
        ) {
            sidebar.classList.remove('active');
        }
    });
});




document.addEventListener('DOMContentLoaded', function () {
    const dashboardLink = document.getElementById('dashboard-link');
    const monitoringLink = document.getElementById('monitoring-link');
    const inventoryLink = document.getElementById('inventory-link');
    const dashboardSection = document.getElementById('dashboard-section'); 
    const monitoringSection = document.getElementById('monitoring-section');
    const inventorySection = document.getElementById('full-inventory');
    const header = document.getElementById('main-header');    
    const cartHeader = document.getElementById('live-cart-header');
    const navBar = document.getElementById('navbar');
    const locationLink = document.getElementById('location-link');
    const trackerSection = document.getElementById('cart-tracker');

    if (dashboardLink && monitoringLink && inventoryLink && locationLink) {
        dashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
            dashboardSection.style.display = 'block';
            monitoringSection.style.display = 'none';
            inventorySection.style.display = 'none';
            header.style.display = 'flex'; // show header again
            cartHeader.style.display = 'none';
            navBar.style.display = 'block';
        });

        monitoringLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
            dashboardSection.style.display = 'none';
            monitoringSection.style.display = 'block';
            trackerSection.style.display = 'none';
            inventorySection.style.display = 'none';
            header.style.display = 'none'; // hide header
            cartHeader.style.display = 'flex';
        });

        inventoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
            header.style.display = 'flex';
            dashboardSection.style.display = 'none';
            inventorySection.style.display = 'block';
            trackerSection.style.display = 'none';
            monitoringSection.style.display = 'none';
            cartHeader.style.display = 'none';
            navBar.style.display = 'none';
        })

        locationLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToTop();
            header.style.display = 'flex';
            dashboardSection.style.display = 'none';
            inventorySection.style.display = 'none';
            trackerSection.style.display = 'block';
            monitoringSection.style.display = 'none';
            cartHeader.style.display = 'none';
            navBar.style.display = 'none';
            document.getElementById("map-cart2").style.display = "none";
            document.getElementById("map-full").style.display = "block";
            loadGeofenceMap();
        })
    }
});


document.getElementById("access-location-btn").addEventListener("click", () => {
    scrollToTop();
    document.getElementById("dashboard-section").style.display = "none";  // Replace with your main container ID
    document.getElementById("cart-tracker").style.display = "block";
    document.getElementById('navbar').style.display = "none";
    document.getElementById("map-cart2").style.display = "block";
    document.getElementById("map-full").style.display = "none";
    loadGeofencecart2Map();
});

const videoWrapper = document.getElementById('video-wrapper');

// Utility to show a message
function showVideoMessage(msg) {
    videoWrapper.innerHTML = `<p class="video-message">${msg}</p>`;
}

// Utility to show video
function showVideoStream(url) {
    videoWrapper.innerHTML = `
        <img src="${url}" onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<p class=video-message>Stream not responding</p>';" alt="Live Stream">
    `;
}


//Full Inventory Logic

// Toggle sections
document.getElementById("view-full-inventory-btn").addEventListener("click", () => {
    scrollToTop();
    document.getElementById("dashboard-section").style.display = "none";  // Replace with your main container ID
    document.getElementById("full-inventory").style.display = "block";
    document.getElementById('navbar').style.display = "none";
    loadCompleteInventory();
});

// Load all products
async function loadCompleteInventory() {
    const fullList = document.getElementById("full-inventory-list");
    fullList.innerHTML = ""; // clear

    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    snapshot.forEach((doc) => {
        const p = doc.data();
        const card = document.createElement("div");
        card.className = "inventory-card";
        card.innerHTML = `
            <h3>${p.name}</h3>
            <p>Price: ₹${p.price}</p>
            <p>Quantity: ${p.quantity}</p>
            <p>Weight: ${p.weight} ${p.weight_unit}</p>
        `;
        fullList.appendChild(card);
    });
}

document.getElementById("back-to-dashboard").addEventListener("click", () => {
    scrollToTop();
    const dashboardSection = document.getElementById("dashboard-section");
    const inventorySection = document.getElementById("full-inventory");

    dashboardSection.style.display = 'block';
    inventorySection.style.display = 'none';
    document.getElementById('navbar').style.display = 'flex'
});

document.getElementById("live-back-to-dashboard").addEventListener("click", () => {
    scrollToTop();
    const dashboardSection = document.getElementById("dashboard-section");
    const monitoringSection = document.getElementById("monitoring-section");
    const header = document.getElementById('main-header');    
    const cartHeader = document.getElementById('live-cart-header');

    dashboardSection.style.display = 'block';
    monitoringSection.style.display = 'none';
    document.getElementById('navbar').style.display = 'flex';
    header.style.display = 'flex';
    cartHeader.style.display = 'none';
    
});

document.getElementById("monitor-back-to-dashboard").addEventListener("click", () => {
    scrollToTop();
    const dashboardSection = document.getElementById("dashboard-section");
    const locationSection = document.getElementById("cart-tracker");
    const header = document.getElementById('main-header');    
    const cartHeader = document.getElementById('live-cart-header');

    dashboardSection.style.display = 'block';
    locationSection.style.display = 'none';
    document.getElementById('navbar').style.display = 'flex';
    header.style.display = 'flex';
    cartHeader.style.display = 'none';
});



// Initialize chart on window load
window.addEventListener('load', function () {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Static datasets with labels
    const chartDatasets = {
        today: {
            label: 'Sales (₹)',
            total: '14,500',
            data: [2000, 2500, 2400, 2800, 3200, 1600],
            labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM']
        },
        week: {
            label: 'Sales (₹)',
            total: '78,500',
            data: [10500, 12200, 9800, 13500, 9400, 13100],
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        month: {
            label: 'Sales (₹)',
            total: '1,50,700',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [80500, 70200, 0, 0]
        }
    };

    // Initial chart
    const salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartDatasets.today.labels,
            datasets: [{
                label: chartDatasets.today.label,
                data: chartDatasets.today.data,
                borderColor: '#4F46E5',
                borderWidth: 3,
                tension: 0.4,
                fill: {
                    target: 'origin',
                    above: 'rgba(79, 70, 229, 0.1)'
                },
                pointBackgroundColor: '#fff',
                pointRadius: 5,
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ABABAB',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#474747'
                    },
                    ticks: {
                        color: '#ABABAB'
                    }
                },
                x: {
                    grid: {
                        color: '#474747'
                    },
                    ticks: {
                        color: '#ABABAB'
                    }
                }
            }
        }
    });

    // Dropdown change event
    document.getElementById('time-period').addEventListener('change', function (e) {
        const value = e.target.value.toLowerCase().replace(/\s/g, '');
        let dataset;

        if (value.includes('today')) dataset = chartDatasets.today;
        else if (value.includes('week')) dataset = chartDatasets.week;
        else dataset = chartDatasets.month;

        // Update chart labels and data
        salesChart.data.labels = dataset.labels;
        salesChart.data.datasets[0].data = dataset.data;
        salesChart.update();

        // Update ₹value text
        document.querySelector('.chart-value').textContent = `₹ ${dataset.total}`;

        // Update trend text
        const trendSpan = document.querySelector('.chart-trend');
        if (value.includes('today')) {
            trendSpan.textContent = '+10% from yesterday';
        } else if (value.includes('week')) {
            trendSpan.textContent = '+7.8% from last week';
        } else {
            trendSpan.textContent = '+4.3% from last month';
        }
    });
});

function loadGeofenceMap() {
    // Prevent reloading if map already initialized
    if (document.getElementById('map-full')?.dataset.initialized) return;

    const geofenceCenter = [23.20250, 77.46010];
    const cart1Location = [23.20258, 77.46003];
    const cart2Location = [23.20261, 77.460413];

    const map = L.map('map-full').setView(geofenceCenter, 18);
    map.getContainer().dataset.initialized = true; // Flag to avoid multiple loads

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.circle(geofenceCenter, {
        radius: 30,
        color: '#3388ff',
        dashArray: '5, 5',
        fillColor: '#cce5ff',
        fillOpacity: 0.2
    }).addTo(map).bindPopup("🏬 Shop Premises");
    // Cart I marker (green)
    const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Cart II marker (red)
    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // Add Cart I
    L.marker(cart1Location, { icon: greenIcon }).addTo(map)
        .bindPopup("🛒 CART001<strong>🟢 Inside Premises</strong>");

        const geofenceRadius = 30; // meters
        const distanceFromCenter = map.distance(cart2Location, geofenceCenter);
        const distanceFromBoundary = distanceFromCenter - geofenceRadius;

        const status = distanceFromBoundary > 0 ? "🔴 Outside Premises" : "🟢 Inside Premises";

        // Add Cart II marker
        L.marker(cart2Location, { icon: redIcon }).addTo(map)
        .bindPopup(`
            🛒 CART002<br>
            <strong>${status}</strong><br>
            📏 ${Math.abs(distanceFromBoundary).toFixed(2)} meters ${distanceFromBoundary > 0 ? "outside" : "inside"} boundary
        `)
        .openPopup();

}

    function loadGeofencecart2Map() {
        // Prevent reloading if map already initialized
        if (document.getElementById('map-cart2')?.dataset.initialized) return;

        const geofenceCenter = [23.20250, 77.46010];
        const cart2Location = [23.20261, 77.460413];

        const map = L.map('map-cart2').setView(geofenceCenter, 18);
        map.getContainer().dataset.initialized = true; // Flag to avoid multiple loads

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.circle(geofenceCenter, {
            radius: 30,
            color: '#3388ff',
            dashArray: '5, 5',
            fillColor: '#cce5ff',
            fillOpacity: 0.2
        }).addTo(map).bindPopup("🏬 Shop Premises");

        // Cart II marker (red)
        const redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const geofenceRadius = 30; // meters
        const distanceFromCenter = map.distance(cart2Location, geofenceCenter);
        const distanceFromBoundary = distanceFromCenter - geofenceRadius;

        const status = distanceFromBoundary > 0 ? "🔴 Outside Premises" : "🟢 Inside Premises";

        // Add Cart II marker
        L.marker(cart2Location, { icon: redIcon }).addTo(map)
        .bindPopup(`
            🛒 CART002<br>
            <strong>${status}</strong><br>
            📏 ${Math.abs(distanceFromBoundary).toFixed(2)} meters ${distanceFromBoundary > 0 ? "outside" : "inside"} boundary
        `)
        .openPopup();

    }