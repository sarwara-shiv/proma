import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { DailyReport, WorkLog } from "@/interfaces";

// Define the shape of context data
interface AppContextType {
  activeWorkLog: WorkLog | null;
  setActiveWorkLog: (workLog: WorkLog | null) => void;
  activeDailyReport: DailyReport | null;
  setActiveDailyReport: (dailyReport: DailyReport | null) => void;
}

// Create the context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const storedWorkLog = localStorage.getItem("activeWorkLog");
    const storedDailyReport = localStorage.getItem("activeDailyReport");

    const [activeWorkLog, setActiveWorkLog] = useState<WorkLog | null>(
        storedWorkLog ? JSON.parse(storedWorkLog) : null
    );
        const [activeDailyReport, setActiveDailyReport] = useState<DailyReport | null>(
        storedDailyReport ? JSON.parse(storedDailyReport) : null
    );
    useEffect(() => {
    if (activeWorkLog) {
        localStorage.setItem("activeWorkLog", JSON.stringify(activeWorkLog));
    } else {
        localStorage.removeItem("activeWorkLog");
    }
    }, [activeWorkLog]);
    useEffect(() => {
        if (activeDailyReport) {
          localStorage.setItem("activeDailyReport", JSON.stringify(activeDailyReport));
        } else {
          localStorage.removeItem("activeDailyReport");
        }
      }, [activeDailyReport]);

  return (
    <AppContext.Provider value={{ activeWorkLog, setActiveWorkLog, activeDailyReport, setActiveDailyReport }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for easy access to context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
