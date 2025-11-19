import * as React from "react";

/**
 * Context for providing the currently loaded map ID to note editor components
 */
export const MapIdContext = React.createContext<string | null>(null);

/**
 * Hook to get the current map ID
 */
export const useCurrentMapId = (): string | null => {
  const mapId = React.useContext(MapIdContext);
  return mapId;
};

export interface MapIdProviderProps {
  mapId: string | null;
  children: React.ReactNode;
}

/**
 * Provider for the map ID context
 */
export const MapIdProvider: React.FC<MapIdProviderProps> = ({
  mapId,
  children,
}) => {
  return (
    <MapIdContext.Provider value={mapId}>{children}</MapIdContext.Provider>
  );
};
