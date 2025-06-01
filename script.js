// Metro Station Data
const metroStations = [
    { id: 1, name: "Central Station", lines: ["Blue", "Red"], coordinates: { lat: 12.345, lng: 77.890 } },
    { id: 2, name: "City Center", lines: ["Blue", "Green"], coordinates: { lat: 12.355, lng: 77.880 } },
    { id: 3, name: "Tech Park", lines: ["Red"], coordinates: { lat: 12.365, lng: 77.870 } },
    { id: 4, name: "Airport Express", lines: ["Airport"], coordinates: { lat: 12.375, lng: 77.860 } },
    { id: 5, name: "Sports Complex", lines: ["Green"], coordinates: { lat: 12.385, lng: 77.850 } },
    { id: 6, name: "Shopping District", lines: ["Blue", "Airport"], coordinates: { lat: 12.395, lng: 77.840 } }
];

// Fare Data (base fare + per km rate)
const fareRates = {
    single: { base: 10, perKm: 2 },
    return: { base: 18, perKm: 1.8 },
    'day-pass': { flat: 100 }
};

// Train Schedule Data
const trainSchedules = {
    "Central Station": [
        { trainNo: "BL101", destination: "Shopping District", time: "10:00", status: "On Time" },
        { trainNo: "RD102", destination: "Tech Park", time: "10:15", status: "Delayed" },
        { trainNo: "BL103", destination: "City Center", time: "10:30", status: "On Time" },
        { trainNo: "BL104", destination: "Shopping District", time: "10:45", status: "On Time" },
        { trainNo: "RD105", destination: "Tech Park", time: "11:00", status: "On Time" }
    ],
    "City Center": [
        { trainNo: "GR201", destination: "Sports Complex", time: "10:10", status: "On Time" },
        { trainNo: "BL202", destination: "Shopping District", time: "10:25", status: "On Time" },
        { trainNo: "GR203", destination: "Sports Complex", time: "10:40", status: "Delayed" },
        { trainNo: "BL204", destination: "Central Station", time: "10:55", status: "On Time" }
    ],
    "Tech Park": [
        { trainNo: "RD301", destination: "Central Station", time: "10:05", status: "On Time" },
        { trainNo: "RD302", destination: "Central Station", time: "10:35", status: "On Time" },
        { trainNo: "RD303", destination: "City Center", time: "11:05", status: "Delayed" }
    ],
    "Airport Express": [
        { trainNo: "AE401", destination: "Central Station", time: "10:00", status: "On Time" },
        { trainNo: "AE402", destination: "Shopping District", time: "10:30", status: "On Time" },
        { trainNo: "AE403", destination: "Central Station", time: "11:00", status: "On Time" }
    ],
    "Sports Complex": [
        { trainNo: "GR501", destination: "City Center", time: "10:15", status: "On Time" },
        { trainNo: "GR502", destination: "City Center", time: "10:45", status: "Delayed" },
        { trainNo: "GR503", destination: "Central Station", time: "11:15", status: "On Time" }
    ],
    "Shopping District": [
        { trainNo: "BL601", destination: "Central Station", time: "10:20", status: "On Time" },
        { trainNo: "AE602", destination: "Airport Express", time: "10:50", status: "On Time" },
        { trainNo: "BL603", destination: "City Center", time: "11:20", status: "On Time" }
    ]
};

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const tabContents = document.querySelectorAll('.tab-content');
const stationSelects = document.querySelectorAll('select[id$="-station"]');
const swapBtn = document.getElementById('swap-btn');
const planJourneyBtn = document.getElementById('plan-journey');
const calculateFareBtn = document.getElementById('calculate-fare');
const viewScheduleBtn = document.getElementById('view-schedule');
const stationSearch = document.getElementById('station-search');
const stationsGrid = document.getElementById('stations-grid');

// Initialize the app
function initializeApp() {
    populateStationSelects();
    displayStations();
    setupEventListeners();
}

// Populate station dropdowns
function populateStationSelects() {
    const stations = metroStations.map(station => {
        return `<option value="${station.id}">${station.name}</option>`;
    }).join('');

    stationSelects.forEach(select => {
        // Clear existing options except the first one
        select.innerHTML = '<option value="">Select Station</option>' + stations;
    });

    // Specifically populate fare calculator dropdowns
    const fareFromSelect = document.getElementById('fare-from');
    const fareToSelect = document.getElementById('fare-to');
    if (fareFromSelect) {
        fareFromSelect.innerHTML = '<option value="">Select Station</option>' + stations;
    }
    if (fareToSelect) {
        fareToSelect.innerHTML = '<option value="">Select Station</option>' + stations;
    }
}

// Display stations in the stations grid
function displayStations() {
    stationsGrid.innerHTML = '';
    metroStations.forEach(station => {
        const stationCard = document.createElement('div');
        stationCard.className = 'station-card';
        stationCard.innerHTML = `
            <h3>${station.name}</h3>
            <p>Lines: ${station.lines.join(', ')}</p>
            <button class="primary-btn station-schedule-btn" data-station-id="${station.id}">
                View Schedule
            </button>
        `;
        stationsGrid.appendChild(stationCard);
    });

    // Add event listeners to all station schedule buttons
    document.querySelectorAll('.station-schedule-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const stationId = e.target.dataset.stationId;
            // Switch to schedule tab
            switchTab('schedule');
            // Set the station in schedule dropdown
            const scheduleStation = document.getElementById('schedule-station');
            if (scheduleStation) {
                scheduleStation.value = stationId;
                // Trigger the schedule display
                viewStationSchedule(stationId);
            }
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = e.target.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Swap Stations
    swapBtn.addEventListener('click', () => {
        const fromStation = document.getElementById('from-station').value;
        const toStation = document.getElementById('to-station').value;
        document.getElementById('from-station').value = toStation;
        document.getElementById('to-station').value = fromStation;
    });

    // Plan Journey
    planJourneyBtn.addEventListener('click', planJourney);

    // Calculate Fare
    calculateFareBtn.addEventListener('click', calculateFare);

    // View Schedule
    if (viewScheduleBtn) {
        viewScheduleBtn.addEventListener('click', () => {
            const stationId = document.getElementById('schedule-station').value;
            if (!stationId) {
                alert('Please select a station');
                return;
            }
            viewStationSchedule(stationId);
        });
    }

    // Add change event listener for schedule station select
    const scheduleStation = document.getElementById('schedule-station');
    if (scheduleStation) {
        scheduleStation.addEventListener('change', (e) => {
            if (e.target.value) {
                viewStationSchedule(e.target.value);
            }
        });
    }

    // Station Search
    stationSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterStations(searchTerm);
    });
}

// Switch between tabs
function switchTab(tabId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.tab === tabId) {
            link.classList.add('active');
        }
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
}

// Plan Journey
function planJourney() {
    const fromStation = getStationById(document.getElementById('from-station').value);
    const toStation = getStationById(document.getElementById('to-station').value);
    
    if (!fromStation || !toStation) {
        alert('Please select both stations');
        return;
    }

    const distance = calculateDistance(fromStation.coordinates, toStation.coordinates);
    const duration = Math.round(distance * 2); // Assuming 2 minutes per km
    
    const results = document.getElementById('journey-results');
    results.innerHTML = `
        <div class="journey-result">
            <h3>Journey Details</h3>
            <p><strong>From:</strong> ${fromStation.name}</p>
            <p><strong>To:</strong> ${toStation.name}</p>
            <p><strong>Estimated Distance:</strong> ${distance.toFixed(2)} km</p>
            <p><strong>Estimated Time:</strong> ${duration} minutes</p>
            <p><strong>Fare:</strong> ₹${calculateJourneyFare(distance)}</p>
        </div>
    `;
}

// Calculate Fare
function calculateFare() {
    const fromStation = getStationById(document.getElementById('fare-from').value);
    const toStation = getStationById(document.getElementById('fare-to').value);
    const ticketType = document.getElementById('ticket-type').value;

    if (!fromStation || !toStation) {
        alert('Please select both stations');
        return;
    }

    const distance = calculateDistance(fromStation.coordinates, toStation.coordinates);
    const fare = calculateJourneyFare(distance, ticketType);

    const fareResult = document.getElementById('fare-result');
    fareResult.innerHTML = `
        <h3>Fare Details</h3>
        <p><strong>Ticket Type:</strong> ${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)}</p>
        <p><strong>Distance:</strong> ${distance.toFixed(2)} km</p>
        <p><strong>Total Fare:</strong> ₹${fare}</p>
    `;
}

// View Station Schedule
function viewStationSchedule(stationId) {
    const station = getStationById(stationId);
    if (!station) {
        alert('Please select a station');
        return;
    }

    const scheduleBody = document.getElementById('schedule-body');
    const scheduleTable = document.querySelector('.schedule-table');
    const schedule = trainSchedules[station.name] || [];

    if (schedule.length === 0) {
        scheduleBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-schedule">No schedules available for this station</td>
            </tr>
        `;
    } else {
        scheduleBody.innerHTML = schedule.map(train => `
            <tr>
                <td>${train.trainNo}</td>
                <td>${train.destination}</td>
                <td>${train.time}</td>
                <td>
                    <span class="status ${train.status.toLowerCase().replace(' ', '-')}">
                        ${train.status}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // Make sure the schedule table is visible
    if (scheduleTable) {
        scheduleTable.style.display = 'block';
    }

    // Scroll to the schedule section if we switched tabs
    const scheduleSection = document.getElementById('schedule');
    if (scheduleSection && scheduleSection.classList.contains('active')) {
        scheduleSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Filter Stations
function filterStations(searchTerm) {
    const filteredStations = metroStations.filter(station => 
        station.name.toLowerCase().includes(searchTerm) ||
        station.lines.some(line => line.toLowerCase().includes(searchTerm))
    );

    stationsGrid.innerHTML = '';
    filteredStations.forEach(station => {
        const stationCard = document.createElement('div');
        stationCard.className = 'station-card';
        stationCard.innerHTML = `
            <h3>${station.name}</h3>
            <p>Lines: ${station.lines.join(', ')}</p>
            <button class="primary-btn" onclick="viewStationSchedule(${station.id})">
                View Schedule
            </button>
        `;
        stationsGrid.appendChild(stationCard);
    });
}

// Helper Functions
function getStationById(id) {
    return metroStations.find(station => station.id === parseInt(id));
}

function calculateDistance(coord1, coord2) {
    // Simple distance calculation (can be replaced with more accurate calculation)
    const dx = coord1.lat - coord2.lat;
    const dy = coord1.lng - coord2.lng;
    return Math.sqrt(dx * dx + dy * dy) * 100; // Multiply by 100 to get reasonable distances
}

function calculateJourneyFare(distance, ticketType = 'single') {
    const rate = fareRates[ticketType];
    if (rate.flat) return rate.flat;
    return Math.round(rate.base + (distance * rate.perKm));
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp); 