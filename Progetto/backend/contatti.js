const lat = 45.4685;
const lon = 9.1824;

const mappa = L.map('mappa').setView([lat, lon], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(mappa);

const iconaArancione = L.divIcon({
    html: '<div style="background:#ff7a1a;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #ff7a1a;"></div>',
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

L.marker([lat, lon], { icon: iconaArancione }).addTo(mappa)
    .bindPopup('<b>Bizarre Bites</b><br>Via Torino 45, Milano')
    .openPopup();

