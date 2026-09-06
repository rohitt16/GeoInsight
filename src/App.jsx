import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  LayersControl,
  Popup,
  LayerGroup,
} from "react-leaflet";

import {
  Map,
  Satellite,
  Search,
  Leaf,
  CloudRain,
  Droplets,
  Waves,
  Sparkles,
  Database,
  Activity,
  CheckCircle2,
  LoaderCircle,
  MapPinned,
  CalendarDays,
  ChevronDown,
  Layers3,
  RefreshCcw,
  Server,
  ShieldCheck,
  Info,
  BarChart3,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = "http://localhost:8000";

const DEMO_DATA = {
  district: "Kamrup",
  state: "Assam",
  month: "2026-06",
  vegetation: {
    average_ndvi: 0.58,
  },
  rainfall: {
    value_mm: 421,
    metric: "Average rainfall",
  },
  surface_water: {
    coverage_percent: 4.7,
    area_km2: 37.2,
  },
};

const kamrupDemoBoundary = [
  [26.33, 91.3],
  [26.43, 91.5],
  [26.39, 91.82],
  [26.3, 92.05],
  [26.1, 92.08],
  [25.96, 91.9],
  [25.92, 91.58],
  [26.02, 91.34],
  [26.18, 91.24],
];

const loadingSteps = [
  "Loading district boundary",
  "Processing Sentinel-2 imagery",
  "Calculating NDVI",
  "Processing CHIRPS rainfall",
  "Analyzing surface water",
  "Generating GeoInsight",
];

function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  className = "",
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`metric-card ${className}`}
    >
      <div className="metric-top">
        <div>
          <p className="metric-title">{title}</p>

          <div className="metric-value-row">
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="metric-value"
            >
              {value}
            </motion.span>

            {unit && <span className="metric-unit">{unit}</span>}
          </div>

          <p className="metric-subtitle">{subtitle}</p>
        </div>

        <motion.div
          whileHover={{ rotate: 10, scale: 1.08 }}
          className="metric-icon"
        >
          <Icon size={24} />
        </motion.div>
      </div>

      <div className="metric-progress">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "70%" }}
          transition={{ duration: 1.1, delay: delay + 0.2 }}
          className="metric-progress-fill"
        />
      </div>
    </motion.div>
  );
}

function LoadingPanel({ currentStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="loading-panel"
    >
      <div className="loading-header">
        <LoaderCircle className="spin" size={22} />

        <div>
          <h3>Geospatial analysis in progress</h3>
          <p>Processing environmental datasets...</p>
        </div>
      </div>

      <div className="loading-grid">
        {loadingSteps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={step}
              className={`loading-step ${
                active ? "active" : done ? "done" : ""
              }`}
            >
              {done ? (
                <CheckCircle2 size={19} />
              ) : active ? (
                <LoaderCircle size={19} className="spin" />
              ) : (
                <span className="empty-circle" />
              )}

              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function App() {
  const [district, setDistrict] = useState("kamrup");
  const [month, setMonth] = useState("2026-06");

  const [data, setData] = useState(DEMO_DATA);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [apiStatus, setApiStatus] = useState("demo");
  const [error, setError] = useState("");

  async function analyzeDistrict() {
    setLoading(true);
    setError("");
    setCurrentStep(0);

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          return prev;
        }

        return prev + 1;
      });
    }, 450);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/environment?district=${district}&month=${month}`
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const result = await response.json();

      clearInterval(timer);

      setCurrentStep(loadingSteps.length);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setData(result);
      setApiStatus("online");
    } catch (err) {
      clearInterval(timer);

      setCurrentStep(loadingSteps.length);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setData(DEMO_DATA);
      setApiStatus("demo");

      setError(
        "Backend is not connected. Demo data is being shown for frontend testing."
      );
    } finally {
      setLoading(false);
    }
  }

  const ndvi = data?.vegetation?.average_ndvi ?? "--";
  const rainfall = data?.rainfall?.value_mm ?? "--";
  const waterCoverage = data?.surface_water?.coverage_percent ?? "--";
  const waterArea = data?.surface_water?.area_km2 ?? "--";

  return (
    <div className="app">

      <motion.header
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="header"
      >
        <div className="header-inner">
          <div className="brand">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.08 }}
              className="brand-icon"
            >
              <Map size={25} />
            </motion.div>

            <div>
              <h1>GeoInsight</h1>
              <p>Geospatial Intelligence Platform</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="satellite-badge">
              <Satellite size={17} />
              <span>Satellite Intelligence</span>
            </div>

            <div className="status-badge">
              <span
                className={`status-dot ${
                  apiStatus === "online" ? "online" : "demo"
                }`}
              />

              <span>
                {apiStatus === "online" ? "API Online" : "Demo Mode"}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container">

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hero"
        >
          <div className="hero-text">
            <div className="hero-badge">
              <Activity size={15} />
              Environmental Intelligence
            </div>

            <h2>
              Understand a district through{" "}
              <span>satellite data.</span>
            </h2>

            <p>
              Convert Sentinel-2, CHIRPS and surface-water datasets
              into simple environmental indicators and interactive
              geospatial intelligence.
            </p>

            <div className="dataset-tags">
              <span>Sentinel-2</span>
              <span>CHIRPS</span>
              <span>JRC Water</span>
              <span>geoBoundaries</span>
            </div>
          </div>

          <div className="hero-visual">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="map-pin"
            >
              <MapPinned size={55} />
            </motion.div>

            <div className="hero-location">
              <strong>Kamrup, Assam</strong>
              <span>26.14° N • 91.74° E</span>
            </div>
          </div>
        </motion.section>

        <section className="search-panel">
          <div className="search-heading">
            <div>
              <h3>Analyze Environmental Conditions</h3>
              <p>Select the target district and reporting month.</p>
            </div>

            <div className="ready-badge">
              <Database size={16} />
              Geospatial datasets ready
            </div>
          </div>

          <div className="search-grid">
            <div>
              <label>
                <MapPinned size={15} />
                District
              </label>

              <div className="select-wrapper">
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="kamrup">
                    Kamrup, Assam
                  </option>
                </select>

                <ChevronDown size={17} />
              </div>
            </div>

            <div>
              <label>
                <CalendarDays size={15} />
                Month
              </label>

              <div className="select-wrapper">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="2026-06">
                    June 2026
                  </option>

                  <option value="2026-05">
                    May 2026
                  </option>

                  <option value="2026-04">
                    April 2026
                  </option>

                  <option value="2025-06">
                    June 2025
                  </option>
                </select>

                <ChevronDown size={17} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={analyzeDistrict}
              disabled={loading}
              className="analyze-button"
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={19} />
                  Analyze District
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {loading && (
              <LoadingPanel currentStep={currentStep} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="error-box"
              >
                <Info size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="metrics-section">
          <div className="section-title">
            <div>
              <span>Environmental Indicators</span>
              <h3>Kamrup • June 2026</h3>
            </div>

            <div className="latest">
              <RefreshCcw size={14} />
              Latest analysis
            </div>
          </div>

          <div className="metrics-grid">
            <MetricCard
              title="Average NDVI"
              value={ndvi}
              subtitle="Vegetation health index"
              icon={Leaf}
              className="green"
              delay={0.1}
            />

            <MetricCard
              title="Average Rainfall"
              value={rainfall}
              unit="mm"
              subtitle="CHIRPS monthly rainfall"
              icon={CloudRain}
              className="blue"
              delay={0.18}
            />

            <MetricCard
              title="Water Coverage"
              value={waterCoverage}
              unit="%"
              subtitle="Percentage of district area"
              icon={Droplets}
              className="cyan"
              delay={0.26}
            />

            <MetricCard
              title="Surface Water"
              value={waterArea}
              unit="km²"
              subtitle="Estimated water-covered area"
              icon={Waves}
              className="sky"
              delay={0.34}
            />
          </div>
        </section>

        <section className="map-layout">

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="map-card"
          >
            <div className="map-header">
              <div>
                <div className="map-title">
                  <Layers3 size={20} />
                  <h3>Interactive Geospatial Map</h3>
                </div>

                <p>
                  Explore environmental layers for Kamrup, Assam
                </p>
              </div>

              <div className="map-tags">
                <span>NDVI</span>
                <span>WATER</span>
                <span>BOUNDARY</span>
              </div>
            </div>

            <div className="map-container">
              <MapContainer
                center={[26.14, 91.73]}
                zoom={9}
                scrollWheelZoom={true}
              >
                <LayersControl position="topright">

                  <LayersControl.BaseLayer
                    checked
                    name="OpenStreetMap"
                  >
                    <TileLayer
                      attribution="© OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.Overlay
                    checked
                    name="District Boundary"
                  >
                    <Polygon
                      positions={kamrupDemoBoundary}
                      pathOptions={{
                        color: "#7c3aed",
                        weight: 3,
                        fillColor: "#8b5cf6",
                        fillOpacity: 0.08,
                      }}
                    >
                      <Popup>
                        <strong>Kamrup District</strong>
                        <br />
                        Assam, India
                      </Popup>
                    </Polygon>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay
                    checked
                    name="Vegetation / NDVI"
                  >
                    <LayerGroup>
                      <Circle
                        center={[26.18, 91.59]}
                        radius={14000}
                        pathOptions={{
                          color: "#15803d",
                          fillColor: "#22c55e",
                          fillOpacity: 0.25,
                        }}
                      />

                      <Circle
                        center={[26.27, 91.83]}
                        radius={11000}
                        pathOptions={{
                          color: "#166534",
                          fillColor: "#16a34a",
                          fillOpacity: 0.32,
                        }}
                      />

                      <Circle
                        center={[26.03, 91.77]}
                        radius={12000}
                        pathOptions={{
                          color: "#4d7c0f",
                          fillColor: "#84cc16",
                          fillOpacity: 0.28,
                        }}
                      />
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay
                    checked
                    name="Surface Water"
                  >
                    <LayerGroup>
                      <Circle
                        center={[26.12, 91.7]}
                        radius={5000}
                        pathOptions={{
                          color: "#0369a1",
                          fillColor: "#0ea5e9",
                          fillOpacity: 0.38,
                        }}
                      />

                      <Circle
                        center={[26.22, 91.95]}
                        radius={4200}
                        pathOptions={{
                          color: "#0284c7",
                          fillColor: "#38bdf8",
                          fillOpacity: 0.4,
                        }}
                      />
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay name="Rainfall">
                    <Circle
                      center={[26.19, 91.72]}
                      radius={28000}
                      pathOptions={{
                        color: "#2563eb",
                        fillColor: "#60a5fa",
                        fillOpacity: 0.12,
                      }}
                    />
                  </LayersControl.Overlay>

                </LayersControl>
              </MapContainer>
            </div>

            <div className="map-legend">
              <strong>Legend</strong>

              <span>
                <i className="legend-green" />
                Vegetation
              </span>

              <span>
                <i className="legend-blue" />
                Surface Water
              </span>

              <span>
                <i className="legend-purple" />
                District Boundary
              </span>
            </div>
          </motion.div>

          <div className="side-column">

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ y: -4 }}
              className="insight-card"
            >
              <div className="insight-header">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  className="insight-icon"
                >
                  <Sparkles size={21} />
                </motion.div>

                <div>
                  <h3>Environmental Insight</h3>
                  <p>Data-grounded summary</p>
                </div>
              </div>

              <motion.p
                key={`${ndvi}-${rainfall}-${waterCoverage}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="insight-text"
              >
                Kamrup recorded an average NDVI of{" "}
                <strong>{ndvi}</strong>, average rainfall of{" "}
                <strong>{rainfall} mm</strong>, and
                surface-water coverage of{" "}
                <strong>{waterCoverage}%</strong> during June
                2026.
              </motion.p>

              <div className="insight-footer">
                <ShieldCheck size={16} />
                Insight uses calculated indicators only.
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              className="summary-card"
            >
              <div className="summary-title">
                <BarChart3 size={20} />
                <h3>Analysis Summary</h3>
              </div>

              <div className="summary-row">
                <span>District</span>
                <strong>Kamrup</strong>
              </div>

              <div className="summary-row">
                <span>State</span>
                <strong>Assam</strong>
              </div>

              <div className="summary-row">
                <span>Reporting month</span>
                <strong>June 2026</strong>
              </div>

              <div className="summary-row">
                <span>Rainfall metric</span>
                <strong>Average</strong>
              </div>
            </motion.div>

          </div>
        </section>

        <section className="sources-section">
          <div className="sources-title">
            <span>Data Infrastructure</span>
            <h3>Geospatial Data Sources</h3>
          </div>

          <div className="sources-grid">

            <div className="source-card">
              <MapPinned />
              <div>
                <h4>geoBoundaries</h4>
                <p>
                  Administrative district boundary for spatial
                  clipping.
                </p>
              </div>
            </div>

            <div className="source-card">
              <Satellite />
              <div>
                <h4>Sentinel-2</h4>
                <p>
                  Satellite imagery used for NDVI calculation.
                </p>
              </div>
            </div>

            <div className="source-card">
              <CloudRain />
              <div>
                <h4>CHIRPS</h4>
                <p>
                  Rainfall dataset used for precipitation
                  analysis.
                </p>
              </div>
            </div>

            <div className="source-card">
              <Waves />
              <div>
                <h4>JRC Surface Water</h4>
                <p>
                  Surface-water data used for coverage analysis.
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Map size={18} />

            <div>
              <strong>GeoInsight</strong>
              <span>Geospatial Intelligence Platform</span>
            </div>
          </div>

          <div className="footer-info">
            <Server size={14} />
            REST API • Kamrup, Assam • Hackathon Prototype
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;