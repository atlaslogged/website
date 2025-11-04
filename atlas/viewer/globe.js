// Location Intelligence Globe Viewer
class GlobeViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.globe = null;
        this.countries = {};
        this.airports = {};
        this.boundaries = null;
        this.regions = null;

        this.meshes = {
            countryBoundaries: [],
            regionBoundaries: [],
            airports: [],
            capitals: []
        };

        this.settings = {
            showCountryBoundaries: true,
            showRegionBoundaries: true,
            showAirports: true,
            showCapitals: true,
            autoRotate: false
        };

        this.init();
    }

    async init() {
        this.setupScene();
        this.createGlobe();
        await this.loadData();
        this.setupEventListeners();
        this.animate();
        document.getElementById('loading').style.display = 'none';
    }

    setupScene() {
        const canvas = document.getElementById('globe');
        const container = document.getElementById('container');

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 300;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.08;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.6;
        this.controls.minDistance = 120;
        this.controls.maxDistance = 500;
        this.controls.enablePan = false;  // Disable panning for cleaner interaction

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        // Handle resize
        window.addEventListener('resize', () => {
            const container = document.getElementById('container');
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    createGlobe() {
        // Globe sphere
        const geometry = new THREE.SphereGeometry(100, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2233ff,
            emissive: 0x112244,
            specular: 0x333333,
            shininess: 15,
            transparent: true,
            opacity: 0.8
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Add atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(102, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x3344ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glow);
    }

    async loadData() {
        try {
            // Load unified countries database
            const countriesResponse = await fetch('../resources/countries_v2.json');
            const countriesData = await countriesResponse.json();
            this.countries = countriesData.entities;

            // Load country boundaries GeoJSON
            const boundariesResponse = await fetch('../resources/countries_50m.geojson');
            this.boundaries = await boundariesResponse.json();

            // Load regional boundaries GeoJSON
            const regionsResponse = await fetch('../resources/regions_10m.geojson');
            this.regions = await regionsResponse.json();

            // Load airports
            const airportsResponse = await fetch('../resources/airports_iata.json');
            const airportsData = await airportsResponse.json();
            this.airports = airportsData.airports;

            console.log(`Loaded ${Object.keys(this.countries).length} countries`);
            console.log(`Loaded ${this.boundaries.features.length} country boundaries`);
            console.log(`Loaded ${this.regions.features.length} regional boundaries`);
            console.log(`Loaded ${Object.keys(this.airports).length} airports`);

            // Render data on globe
            this.renderCountryBoundaries();
            this.renderRegionBoundaries();
            this.renderAirports();
            this.renderCapitals();
            this.updateStats();

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    renderCountryBoundaries() {
        console.log('Rendering country boundaries...');

        for (const feature of this.boundaries.features) {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
                continue;
            }

            const coordinates = feature.geometry.type === 'Polygon'
                ? [feature.geometry.coordinates]
                : feature.geometry.coordinates;

            for (const polygon of coordinates) {
                for (const ring of polygon) {
                    if (ring.length < 3) continue;

                    const points = ring.map(([lon, lat]) => this.latLonToVector3(lat, lon, 100.3));

                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x00ffff,  // Cyan for countries
                        transparent: true,
                        opacity: 0.95,
                        linewidth: 2
                    });

                    const line = new THREE.Line(geometry, material);
                    line.userData = { type: 'country-boundary', properties: feature.properties };
                    this.meshes.countryBoundaries.push(line);
                    this.globe.add(line);
                }
            }
        }

        console.log(`Rendered ${this.meshes.countryBoundaries.length} country boundary lines`);
    }

    renderRegionBoundaries() {
        console.log('Rendering regional boundaries...');

        for (const feature of this.regions.features) {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
                continue;
            }

            const coordinates = feature.geometry.type === 'Polygon'
                ? [feature.geometry.coordinates]
                : feature.geometry.coordinates;

            for (const polygon of coordinates) {
                for (const ring of polygon) {
                    if (ring.length < 3) continue;

                    const points = ring.map(([lon, lat]) => this.latLonToVector3(lat, lon, 100.2));

                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x00ff00,  // Green for regions/territories
                        transparent: true,
                        opacity: 0.6,
                        linewidth: 1
                    });

                    const line = new THREE.Line(geometry, material);
                    line.userData = { type: 'region-boundary', properties: feature.properties };
                    this.meshes.regionBoundaries.push(line);
                    this.globe.add(line);
                }
            }
        }

        console.log(`Rendered ${this.meshes.regionBoundaries.length} regional boundary lines`);
    }

    renderAirports() {
        console.log('Rendering airports...');

        let count = 0;
        for (const [icao, airport] of Object.entries(this.airports)) {
            if (!airport.lat || !airport.lon) continue;

            const position = this.latLonToVector3(airport.lat, airport.lon, 100.5);

            const geometry = new THREE.SphereGeometry(0.4, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 1.0
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            mesh.userData = { type: 'airport', airport };

            this.meshes.airports.push(mesh);
            this.globe.add(mesh);
            count++;
        }

        console.log(`Rendered ${count} airports`);
    }

    renderCapitals() {
        console.log('Rendering capitals...');

        let count = 0;
        for (const [code, country] of Object.entries(this.countries)) {
            const capital = country.government?.capital;
            if (!capital?.coordinates) continue;

            const { lat, lon } = capital.coordinates;
            if (!lat || !lon) continue;

            const position = this.latLonToVector3(lat, lon, 100.8);

            const geometry = new THREE.SphereGeometry(0.6, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff00ff,  // Bright magenta for capitals
                transparent: true,
                opacity: 1.0
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            mesh.userData = { type: 'capital', country, capital: capital.name };

            this.meshes.capitals.push(mesh);
            this.globe.add(mesh);
            count++;
        }

        console.log(`Rendered ${count} capitals`);
    }

    latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    setupEventListeners() {
        const canvas = document.getElementById('globe');
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            // Check all meshes
            const allMeshes = [
                ...this.meshes.countryBoundaries,
                ...this.meshes.regionBoundaries,
                ...this.meshes.airports,
                ...this.meshes.capitals
            ];

            const intersects = raycaster.intersectObjects(allMeshes);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                this.handleClick(object);
            }
        });
    }

    handleClick(object) {
        const userData = object.userData;

        if (userData.type === 'country-boundary') {
            const iso = (userData.properties.iso_a2 || '').replace(/\x00/g, '').trim();
            if (iso && this.countries[iso]) {
                this.showCountryInfo(iso);
            }
        } else if (userData.type === 'region-boundary') {
            const iso = (userData.properties.iso_a2 || '').replace(/\x00/g, '').trim();
            const regionCode = (userData.properties.iso_3166_2 || '').replace(/\x00/g, '').trim();
            console.log(`Clicked region: ${regionCode} (${userData.properties.name.replace(/\x00/g, '').trim()})`);
            // Try to show parent country info
            if (iso && this.countries[iso]) {
                this.showCountryInfo(iso);
            }
        } else if (userData.type === 'airport') {
            this.showAirportInfo(userData.airport);
        } else if (userData.type === 'capital') {
            this.showCountryInfo(userData.country.code, userData.capital);
        }
    }

    showCountryInfo(isoCode, highlightCapital = null) {
        const country = this.countries[isoCode];
        if (!country) return;

        const panel = document.getElementById('infoPanel');

        // Helper to format numbers
        const fmt = (num) => num ? num.toLocaleString() : 'N/A';

        // Population
        const pop = country.people?.population?.total;
        const popStr = fmt(pop);

        // Capital
        const capitalName = country.government?.capital?.name || 'N/A';
        const capitalStyle = highlightCapital ? 'background: rgba(255, 0, 255, 0.3); padding: 2px 6px; border-radius: 4px; font-weight: bold;' : '';

        // Area
        const area = country.geography?.area;
        const totalArea = area?.total_sq_km ? `${fmt(area.total_sq_km)} km²` : 'N/A';
        const landArea = area?.land_sq_km ? `${fmt(area.land_sq_km)} km²` : null;

        // Terrain and elevation
        const terrain = country.geography?.terrain || 'N/A';
        const elevation = country.geography?.elevation;
        const highPoint = elevation?.highest_point ? `${elevation.highest_point.name} (${fmt(elevation.highest_point.elevation_m)}m)` : null;
        const lowPoint = elevation?.lowest_point ? `${elevation.lowest_point.name} (${fmt(elevation.lowest_point.elevation_m)}m)` : null;

        // Economy
        const gdp = country.economy?.gdp?.value ? `$${fmt(country.economy.gdp.value)}` : null;
        const gdpPerCapita = country.economy?.gdp_per_capita?.value ? `$${fmt(country.economy.gdp_per_capita.value)}` : null;
        const currency = country.economy?.currency?.name || null;

        // Religions
        const religions = country.people?.religions || null;
        const nationality = country.people?.nationality || null;

        // Regions section
        let regionsHTML = '';
        if (country.regions && country.regions.length > 0) {
            regionsHTML = `
                <div class="section">
                    <div class="section-title">Subdivisions (${country.regions.length})</div>
                    <div class="regions-grid">
                        ${country.regions.map(r => `
                            <div class="region-chip">
                                <span>${r.flag}</span>
                                <span>${r.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Airports section
        let airportsHTML = '';
        if (country.airports && country.airports.length > 0) {
            airportsHTML = `
                <div class="section">
                    <div class="section-title">Major Airports (${country.airports.length})</div>
                    <div class="airports-list">
                        ${country.airports.map(a => `
                            <div class="airport-chip" title="${a.name}">${a.iata}</div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="country-header">
                <div class="country-flag">${country.flag}</div>
                <div class="country-name">
                    <h2>${country.name}</h2>
                    <div class="country-code">${country.code} • ${country.iso_a3}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Geography</div>
                <div class="data-row">
                    <div class="data-label">Continent</div>
                    <div class="data-value">${country.geography?.continent || 'N/A'}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Region</div>
                    <div class="data-value">${country.geography?.region || 'N/A'}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Subregion</div>
                    <div class="data-value">${country.geography?.subregion || 'N/A'}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Total Area</div>
                    <div class="data-value">${totalArea}</div>
                </div>
                ${landArea ? `<div class="data-row">
                    <div class="data-label">Land Area</div>
                    <div class="data-value">${landArea}</div>
                </div>` : ''}
                <div class="data-row">
                    <div class="data-label">Climate</div>
                    <div class="data-value">${country.geography?.climate || 'N/A'}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Terrain</div>
                    <div class="data-value">${terrain}</div>
                </div>
                ${highPoint ? `<div class="data-row">
                    <div class="data-label">Highest Point</div>
                    <div class="data-value">${highPoint}</div>
                </div>` : ''}
                ${lowPoint ? `<div class="data-row">
                    <div class="data-label">Lowest Point</div>
                    <div class="data-value">${lowPoint}</div>
                </div>` : ''}
            </div>

            <div class="section">
                <div class="section-title">People & Society</div>
                <div class="data-row">
                    <div class="data-label">Population</div>
                    <div class="data-value">${popStr}</div>
                </div>
                ${nationality ? `<div class="data-row">
                    <div class="data-label">Nationality</div>
                    <div class="data-value">${nationality}</div>
                </div>` : ''}
                <div class="data-row">
                    <div class="data-label">Languages</div>
                    <div class="data-value">${country.people?.languages || 'N/A'}</div>
                </div>
                ${religions ? `<div class="data-row">
                    <div class="data-label">Religions</div>
                    <div class="data-value">${religions}</div>
                </div>` : ''}
            </div>

            <div class="section">
                <div class="section-title">Government</div>
                <div class="data-row">
                    <div class="data-label">Capital</div>
                    <div class="data-value"><span style="${capitalStyle}">${capitalName}</span></div>
                </div>
                <div class="data-row">
                    <div class="data-label">Type</div>
                    <div class="data-value">${country.government?.type || 'N/A'}</div>
                </div>
            </div>

            ${gdp || gdpPerCapita || currency ? `
            <div class="section">
                <div class="section-title">Economy</div>
                ${gdp ? `<div class="data-row">
                    <div class="data-label">GDP</div>
                    <div class="data-value">${gdp}</div>
                </div>` : ''}
                ${gdpPerCapita ? `<div class="data-row">
                    <div class="data-label">GDP per Capita</div>
                    <div class="data-value">${gdpPerCapita}</div>
                </div>` : ''}
                ${currency ? `<div class="data-row">
                    <div class="data-label">Currency</div>
                    <div class="data-value">${currency}</div>
                </div>` : ''}
            </div>` : ''}

            ${regionsHTML}
            ${airportsHTML}
        `;

        panel.classList.add('visible');
    }

    showAirportInfo(airport) {
        const panel = document.getElementById('infoPanel');

        panel.innerHTML = `
            <div class="country-header">
                <div class="country-flag">✈️</div>
                <div class="country-name">
                    <h2>${airport.name}</h2>
                    <div class="country-code">${airport.iata} • ${airport.icao}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Location</div>
                <div class="data-row">
                    <div class="data-label">City</div>
                    <div class="data-value">${airport.city || 'N/A'}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Country</div>
                    <div class="data-value">${airport.country || 'N/A'}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Coordinates</div>
                    <div class="data-value">${airport.lat.toFixed(4)}, ${airport.lon.toFixed(4)}</div>
                </div>
                <div class="data-row">
                    <div class="data-label">Elevation</div>
                    <div class="data-value">${airport.elevation ? airport.elevation + ' m' : 'N/A'}</div>
                </div>
            </div>
        `;

        panel.classList.add('visible');
    }

    updateStats() {
        const countryCount = Object.keys(this.countries).length;
        const airportCount = Object.keys(this.airports).length;
        const regionCount = Object.values(this.countries).reduce((sum, c) => sum + (c.regions?.length || 0), 0);
        const population = Object.values(this.countries).reduce((sum, c) => {
            const pop = c.people?.population?.total;
            return sum + (pop || 0);
        }, 0);

        document.getElementById('countryCount').textContent = countryCount.toLocaleString();
        document.getElementById('airportCount').textContent = airportCount.toLocaleString();
        document.getElementById('regionCount').textContent = regionCount.toLocaleString();
        document.getElementById('populationCount').textContent = (population / 1e9).toFixed(1) + 'B';
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.settings.autoRotate) {
            this.globe.rotation.y += 0.001;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Control functions
function toggleBoundaries() {
    const btn = document.getElementById('toggleBoundaries');
    viewer.settings.showCountryBoundaries = !viewer.settings.showCountryBoundaries;
    viewer.settings.showRegionBoundaries = viewer.settings.showCountryBoundaries;

    viewer.meshes.countryBoundaries.forEach(mesh => {
        mesh.visible = viewer.settings.showCountryBoundaries;
    });
    viewer.meshes.regionBoundaries.forEach(mesh => {
        mesh.visible = viewer.settings.showRegionBoundaries;
    });

    btn.classList.toggle('active');
}

function toggleAirports() {
    const btn = document.getElementById('toggleAirports');
    viewer.settings.showAirports = !viewer.settings.showAirports;
    viewer.settings.showCapitals = viewer.settings.showAirports;

    viewer.meshes.airports.forEach(mesh => {
        mesh.visible = viewer.settings.showAirports;
    });
    viewer.meshes.capitals.forEach(mesh => {
        mesh.visible = viewer.settings.showCapitals;
    });

    btn.classList.toggle('active');
}

function toggleRotation() {
    const btn = document.getElementById('toggleRotation');
    viewer.settings.autoRotate = !viewer.settings.autoRotate;
    btn.classList.toggle('active');
}

// Initialize
let viewer;
window.addEventListener('DOMContentLoaded', () => {
    viewer = new GlobeViewer();
});
