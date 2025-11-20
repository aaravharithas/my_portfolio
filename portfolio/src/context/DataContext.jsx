import { createContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mockData from "../data/mockData.json";

export const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://myapi.pythonanywhere.com/");
        if (!res.ok) throw new Error("API error");
        const apiData = await res.json();
        setData(apiData);
      } catch (err) {
        console.warn("API failed → using mock data:", err);
        setData(mockData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading }}>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              backgroundColor: "#000",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            {/* Spinning SVG */}
            <motion.svg
              width="48px"
              height="48px"
              viewBox="0 0 48 48"
              style={{ originX: "50%", originY: "50%" }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="#eeeeee"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="#F96D00"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="100"
                strokeDashoffset="75"
              />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && children}
    </DataContext.Provider>
  );
}
