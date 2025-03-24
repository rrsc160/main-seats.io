

import { useEffect, useState, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { fetchHoldToken, bookSeats } from "../services/SeatsService";
import "../style/style.css";
const SelectedSeats = lazy(() => import("./SelectedSeats"));

const SEATS_CONFIG = {
  Publicworkspacekey: "57069033-6fc3-4e57-8ebc-c4f54d3d742e",
  Secretworkspacekey: "8cd678c5-d6d5-43f1-b377-255951f6405f",
  eventkey: "e979330a-5c0c-429e-8689-cf54ec6aceff",
};

const SeatsChart = () => {
  const [holdToken, setHoldToken] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [theme, setTheme] = useState("day");
  const chartRef = useRef(null);

  useEffect(() => {
    const initializeChart = async () => {
      try {
        const token = await fetchHoldToken(SEATS_CONFIG.Secretworkspacekey);
        setHoldToken(token);
        await loadSeatsIoScript();
        renderChart(token);
      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    };

    if (!holdToken) {
      initializeChart();
    }
  }, [holdToken]);

  const loadSeatsIoScript = () => {
    return new Promise((resolve, reject) => {
      if (window.seatsio) return resolve();

      const script = document.createElement("script");
      script.src = "https://cdn-eu.seatsio.net/chart.js";
      script.async = true;
      script.onload = resolve;
      
      script.onerror = () => reject(new Error("Failed to load Seats.io script"));
      document.body.appendChild(script);
    });
  };

  const renderChart = useCallback((token) => {
    if (chartRef.current || !window.seatsio) return;

    chartRef.current = new window.seatsio.SeatingChart({
      publicKey: SEATS_CONFIG.Publicworkspacekey,
      event: SEATS_CONFIG.eventkey,
      holdToken: token,
      divId: "chart-container",
      pricing: [
        { category: 1, price: 30 },
        { category: 2, price: 40 },
        { category: 3, price: 50 },
      ],
      priceFormatter: (price) => `$${price}`,
      session: "manual",
      onObjectSelected: (object) => {
        if (object.status === "reservedByToken" || object.status === "free") {
          setSelectedSeats((prev) => [...prev, { id: object.id, label: object.label || "N/A" }]);
        }
      },
      onObjectDeselected: (object) => {
        setSelectedSeats((prev) => prev.filter((seat) => seat.id !== object.id));
      },
    });
    chartRef.current.render();
  }, []);

  const memoizedSelectedSeats = useMemo(() => selectedSeats, [selectedSeats]);

  const handleBookSeats = async () => {
    if (memoizedSelectedSeats.length === 0) {
      alert("No seats selected for booking.");
      return;
    }

    try {
      await bookSeats(SEATS_CONFIG.Secretworkspacekey, SEATS_CONFIG.eventkey, memoizedSelectedSeats);
      setAlertMessage("Seats successfully booked!");
      setSelectedSeats([]);
    } catch (error) {
      console.error("Error booking seats:", error);
      setAlertMessage("An error occurred while booking the seats.");
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <div className={`seats-chart-container ${theme}`}>

      {alertMessage && (
        <div className="alert-container">
          <div className="alert-message">{alertMessage}</div>
        </div>
      )}


      <div className="seats-chart-wrapper">
        <div className="chart-box"> 
          <div id="chart-container"></div>
        </div>
        <Suspense fallback={<div>Loading Selected Seats...</div>}>
          <SelectedSeats selectedSeats={memoizedSelectedSeats} onBookSeats={handleBookSeats} />
        </Suspense>
      </div>
    </div>
  );
};

export default SeatsChart;
