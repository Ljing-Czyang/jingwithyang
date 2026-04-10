class TravelMap {
    constructor() {
        this.map = null;
        this.currentTrip = null;
        this.currentDayIndex = 0;
        this.currentPointIndex = 0;
        this.markers = [];
        this.polylines = [];
        this.arrowMarkers = [];
        this.isPlaying = false;
        this.animationTimer = null;
        this.container = null;
    }

    show() {
        if (!this.container) {
            this.init();
        }
        this.container.classList.add('active');
        setTimeout(() => {
            if (!this.map) {
                this.initMap();
            } else {
                this.map.invalidateSize();
            }
            this.loadTrip(TRAVELS_DATA.trips[0].id);
        }, 100);
    }

    hide() {
        this.container.classList.remove('active');
        this.stopAnimation();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'travel-map-container';
        this.container.innerHTML = `
            <div class="sidebar-overlay" id="sidebar-overlay" onclick="travelMap.toggleSidebar()"></div>
            <div class="travel-map-header">
                <h2>🗺️ 旅行足迹</h2>
                <button class="travel-map-close" onclick="travelMap.hide()">✕</button>
            </div>
            <div class="travel-map-body">
                <div class="travel-map-sidebar" id="trip-sidebar">
                    <div class="trip-selector" id="trip-list"></div>
                    <div class="day-timeline" id="day-timeline"></div>
                </div>
                <div id="travel-map"></div>
                <div class="map-controls">
                    <button class="map-control-btn" id="btn-play" onclick="travelMap.toggleAnimation()" title="播放路线动画">▶</button>
                    <button class="map-control-btn" id="btn-reset" onclick="travelMap.resetView()" title="重置视图">🎯</button>
                    <button class="map-control-btn sidebar-toggle" onclick="travelMap.toggleSidebar()">☰</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.container);
        this.renderTripList();
    }

    initMap() {
        this.map = L.map('travel-map', {
            zoomControl: true,
            attributionControl: false,
            preferCanvas: true
        }).setView([32.0608, 118.7969], 12);

        L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            maxZoom: 18,
            subdomains: '1234',
            attribution: ''
        }).addTo(this.map);
    }

    renderTripList() {
        const listEl = document.getElementById('trip-list');
        listEl.innerHTML = TRAVELS_DATA.trips.map(trip => `
            <div class="trip-card ${this.currentTrip === trip.id ? 'active' : ''}" 
                 style="--trip-color: ${trip.color}"
                 onclick="travelMap.loadTrip('${trip.id}')">
                <span class="trip-icon">${trip.icon}</span>
                <div class="trip-info">
                    <h4>${trip.title}</h4>
                    <p>${trip.subtitle} · ${trip.days.length}天</p>
                </div>
            </div>
        `).join('');
    }

    loadTrip(tripId) {
        this.currentTrip = tripId;
        const trip = TRAVELS_DATA.trips.find(t => t.id === tripId);
        if (!trip) return;

        this.clearMap();
        this.renderTripList();
        this.renderDayTimeline(trip);
        
        this.map.setView(trip.center, trip.zoom);

        if (trip.days.length > 0) {
            this.showDay(0);
        }
    }

    renderDayTimeline(trip) {
        const timelineEl = document.getElementById('day-timeline');
        timelineEl.innerHTML = `
            <div class="day-timeline-title">行程时间轴</div>
            ${trip.days.map((day, index) => `
                <div class="day-item ${index === this.currentDayIndex ? 'active' : ''}" 
                     style="--trip-color: ${trip.color}"
                     onclick="travelMap.showDay(${index})">
                    <div class="day-date">${day.date}</div>
                    <div class="day-title">${day.dayLabel} · ${day.title}</div>
                    <div class="route-points">
                        ${day.route.map((point, pIndex) => `
                            <div class="route-point ${index === this.currentDayIndex && pIndex === this.currentPointIndex ? 'active' : ''}"
                                 onclick="event.stopPropagation(); travelMap.focusPoint(${index}, ${pIndex})">
                                <span class="route-point-icon">${point.icon}</span>
                                <div class="route-point-info">
                                    <div class="route-point-name">${point.name}</div>
                                    <div class="route-point-time">${point.time}</div>
                                </div>
                                <span class="route-point-transport transport-${point.transport}">${point.transportLabel}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    showDay(dayIndex) {
        this.currentDayIndex = dayIndex;
        this.currentPointIndex = 0;
        const trip = TRAVELS_DATA.trips.find(t => t.id === this.currentTrip);
        if (!trip || !trip.days[dayIndex]) return;

        this.clearMap();
        this.renderDayTimeline(trip);
        this.renderRoute(trip.days[dayIndex], trip.color);
    }

    renderRoute(dayData, color) {
        const points = dayData.route;
        if (points.length < 2) return;

        const latLngs = points.map(p => [p.lat, p.lng]);

        const polyline = L.polyline(latLngs, {
            color: color,
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
            className: 'animated-path'
        }).addTo(this.map);

        this.polylines.push(polyline);

        this.addArrowMarkers(latLngs, color);

        points.forEach((point, index) => {
            const isStart = index === 0;
            const isEnd = index === points.length - 1;
            
            const markerIcon = L.divIcon({
                className: '',
                html: `<div class="custom-marker ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}">
                         <span>${point.icon}</span>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });

            const marker = L.marker([point.lat, point.lng], { icon: markerIcon })
                .addTo(this.map)
                .bindPopup(this.createPopupContent(point), {
                    maxWidth: 250,
                    className: 'custom-popup'
                });

            marker.on('click', () => {
                this.focusPoint(this.currentDayIndex, index);
            });

            this.markers.push({ marker, point, index });
        });

        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }

    addArrowMarkers(latLngs, color) {
        for (let i = 0; i < latLngs.length - 1; i++) {
            const start = latLngs[i];
            const end = latLngs[i + 1];
            const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
            
            const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;

            const arrowIcon = L.divIcon({
                className: '',
                html: `<svg width="20" height="20" viewBox="0 0 20 20" 
                             style="transform: rotate(${angle}deg)">
                          <path d="M10 0 L20 10 L14 10 L14 20 L6 20 L6 10 L0 10 Z" 
                                fill="${color}" opacity="0.8"/>
                       </svg>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const arrowMarker = L.marker(mid, { icon: arrowIcon, interactive: false })
                .addTo(this.map);
            
            this.arrowMarkers.push(arrowMarker);
        }
    }

    createPopupContent(point) {
        return `
            <div class="popup-content">
                <div class="popup-title">
                    <span>${point.icon}</span>
                    ${point.name}
                </div>
                <div class="popup-detail"><strong>时间：</strong>${point.time}</div>
                <div class="popup-detail"><strong>交通：</strong>${point.transportLabel}</div>
                <div class="popup-detail"><strong>备注：</strong>${point.description}</div>
                <span class="transport-badge transport-${point.transport}">${point.transportLabel}</span>
            </div>
        `;
    }

    focusPoint(dayIndex, pointIndex) {
        this.currentDayIndex = dayIndex;
        this.currentPointIndex = pointIndex;
        
        const trip = TRAVELS_DATA.trips.find(t => t.id === this.currentTrip);
        if (!trip || !trip.days[dayIndex]) return;

        const point = trip.days[dayIndex].route[pointIndex];
        if (!point) return;

        this.renderDayTimeline(trip);

        this.map.flyTo([point.lat, point.lng], 15, {
            duration: 0.8
        });

        const targetMarker = this.markers.find(m => m.index === pointIndex);
        if (targetMarker) {
            targetMarker.marker.openPopup();
        }
    }

    toggleAnimation() {
        if (this.isPlaying) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }

    startAnimation() {
        const trip = TRAVELS_DATA.trips.find(t => t.id === this.currentTrip);
        if (!trip || !trip.days[this.currentDayIndex]) return;

        this.isPlaying = true;
        document.getElementById('btn-play').classList.add('playing');
        document.getElementById('btn-play').innerHTML = '⏸';

        const dayData = trip.days[this.currentDayIndex];
        let step = 0;
        const totalSteps = dayData.route.length;

        const animate = () => {
            if (step >= totalSteps || !this.isPlaying) {
                this.stopAnimation();
                return;
            }

            this.focusPoint(this.currentDayIndex, step);
            step++;
            this.animationTimer = setTimeout(animate, 2000);
        };

        animate();
    }

    stopAnimation() {
        this.isPlaying = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
        const btn = document.getElementById('btn-play');
        if (btn) {
            btn.classList.remove('playing');
            btn.innerHTML = '▶';
        }
    }

    resetView() {
        const trip = TRAVELS_DATA.trips.find(t => t.id === this.currentTrip);
        if (trip) {
            this.map.flyTo(trip.center, trip.zoom, { duration: 0.8 });
        }
        this.stopAnimation();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('trip-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    }

    clearMap() {
        this.markers.forEach(m => m.marker.remove());
        this.polylines.forEach(p => p.remove());
        this.arrowMarkers.forEach(a => a.remove());
        this.markers = [];
        this.polylines = [];
        this.arrowMarkers = [];
        this.stopAnimation();
    }
}

const travelMap = new TravelMap();
