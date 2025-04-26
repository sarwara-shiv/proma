import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { DailyReport, WorkLogType } from "../interfaces";

// Define the shape of context data
interface AppContextType {
  activeWorkLog: WorkLogType | null;
  setActiveWorkLog: (workLog: WorkLogType | null) => void;
  activeDailyReport: DailyReport | null;
  setActiveDailyReport: (dailyReport: DailyReport | null) => void;

  pageTitle: ReactNode;
  setPageTitle: (title: ReactNode) => void;
  isSidebarOpen: boolean;
  isUserAuthenticated: boolean;
  setIsUserAuthenticated: (isAuthenticated: boolean) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
}



// Create the context with default values
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const storedWorkLog = localStorage.getItem("activeWorkLog");
    const storedDailyReport = localStorage.getItem("activeDailyReport");
    const [pageTitle, setPageTitle] = useState<ReactNode>("Home");
    const [currentPage, setCurrentPage] = useState<string>("Dashboard");
    const [language, setLanguage] = useState<string>("en");
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(true);
    const [isLicenseValid, setIsLicenseValid] = useState<boolean>(true);

    const [activeWorkLog, setActiveWorkLog] = useState<WorkLogType | null>(
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
    <AppContext.Provider value={{ 
      activeWorkLog, 
      setActiveWorkLog, 
      activeDailyReport, 
      setActiveDailyReport, 
      pageTitle,
      setPageTitle,
      isUserAuthenticated,
      setIsUserAuthenticated,
      isSidebarOpen,
      setIsSidebarOpen,
      currentPage,
      setCurrentPage,
      language,
      setLanguage,
      
      }}>
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
