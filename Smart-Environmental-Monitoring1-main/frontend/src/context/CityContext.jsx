import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const CityContext = createContext();

export function CityProvider({ children }) {
  const { user } = useAuth();
  const storageKey = `selectedCity:${user?.id || user?.email || "anonymous"}`;
  const loadedKey = useRef(null);
  const [selectedCity, setSelectedCity] = useState(() => {
    return "Hyderabad";
  });
  useEffect(() => {
    loadedKey.current = storageKey;
    setSelectedCity(localStorage.getItem(storageKey) || "Hyderabad");
  }, [storageKey]);
  useEffect(() => {
    if (loadedKey.current === storageKey) localStorage.setItem(storageKey, selectedCity);
  }, [selectedCity, storageKey]);
  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}