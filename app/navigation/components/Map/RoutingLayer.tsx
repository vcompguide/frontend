"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L, { LatLng } from "leaflet";
import { RouteData, RoutePoint } from "@/types";

interface RoutingLayerProps {
  waypoints: RoutePoint[];
  onRouteCalculated?: (route: RouteData) => void;
}

// Color palette for waypoints
const WAYPOINT_COLORS = [
  { main: "#10B981", light: "#D1FAE5", label: "A" }, // Green for start
  { main: "#EF4444", light: "#FEE2E2", label: "B" }, // Red for end
  { main: "#3B82F6", light: "#DBEAFE", label: "" },  // Blue
  { main: "#F59E0B", light: "#FEF3C7", label: "" },  // Amber
  { main: "#8B5CF6", light: "#EDE9FE", label: "" },  // Purple
  { main: "#EC4899", light: "#FCE7F3", label: "" },  // Pink
  { main: "#06B6D4", light: "#CFFAFE", label: "" },  // Cyan
  { main: "#84CC16", light: "#ECFCCB", label: "" },  // Lime
  { main: "#F97316", light: "#FFEDD5", label: "" },  // Orange
  { main: "#6366F1", light: "#E0E7FF", label: "" },  // Indigo
];

const getWaypointColor = (index: number, totalWaypoints: number) => {
  if (index === 0) return WAYPOINT_COLORS[0]; // Always green for start
  if (index === totalWaypoints - 1) return WAYPOINT_COLORS[1]; // Always red for end
  // Cycle through remaining colors for middle waypoints
  const colorIndex = 2 + ((index - 1) % (WAYPOINT_COLORS.length - 2));
  return WAYPOINT_COLORS[colorIndex];
};

export default function RoutingLayer({ waypoints, onRouteCalculated }: RoutingLayerProps) {
  const map = useMap();
  const routeLinesRef = useRef<L.Polyline[]>([]);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Clear existing route and markers before fetching new route
    routeLinesRef.current.forEach((line) => {
      map.removeLayer(line);
    });
    routeLinesRef.current = [];
    
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    const fetchRoute = async () => {
      if (!waypoints || waypoints.length < 2) {
        // Clear route data if waypoints are insufficient
        if (onRouteCalculated) {
          onRouteCalculated(null as any);
        }
        return;
      }

      // Check if all waypoints have valid names
      const allValid = waypoints.every(wp => wp.name && wp.name.trim() !== '');
      if (!allValid) {
        return;
      }

      try {
        // Build coordinates string for OSRM API
        const coordinates = waypoints
          .map((wp) => `${wp.latlng.lng},${wp.latlng.lat}`)
          .join(";");

        // OSRM API call with multiple waypoints
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`
        );
        
        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const allCoordinates: [number, number][] = route.geometry.coordinates.map(
            (coord: number[]) => [coord[1], coord[0]] as [number, number]
          );

          // Draw route lines with different colors for each leg
          if (route.legs && route.legs.length > 0) {
            route.legs.forEach((leg: any, legIndex: number) => {
              // Build coordinates from this leg's steps
              const legCoordinates: [number, number][] = [];
              
              if (leg.steps && leg.steps.length > 0) {
                leg.steps.forEach((step: any) => {
                  if (step.geometry && step.geometry.coordinates) {
                    // Each step has its own geometry with coordinates
                    step.geometry.coordinates.forEach((coord: number[]) => {
                      const latLng: [number, number] = [coord[1], coord[0]];
                      // Avoid duplicate points
                      if (legCoordinates.length === 0 || 
                          legCoordinates[legCoordinates.length - 1][0] !== latLng[0] ||
                          legCoordinates[legCoordinates.length - 1][1] !== latLng[1]) {
                        legCoordinates.push(latLng);
                      }
                    });
                  }
                });
              }
              
              // Get color for the destination waypoint of this leg
              const destinationColor = getWaypointColor(legIndex + 1, waypoints.length);
              
              // Create polyline for this leg with enhanced effects
              if (legCoordinates.length > 1) {
                // Background shadow line for depth effect
                const shadowLine = L.polyline(legCoordinates, {
                  color: "#000000",
                  weight: 8,
                  opacity: 0.2,
                  lineJoin: "round",
                  lineCap: "round",
                }).addTo(map);
                routeLinesRef.current.push(shadowLine);

                // Main colored route line with gradient-like effect
                const polyline = L.polyline(legCoordinates, {
                  color: destinationColor.main,
                  weight: 6,
                  opacity: 0.9,
                  lineJoin: "round",
                  lineCap: "round",
                }).addTo(map);
                routeLinesRef.current.push(polyline);

                // Inner highlight line for 3D effect
                const highlightLine = L.polyline(legCoordinates, {
                  color: "#FFFFFF",
                  weight: 2,
                  opacity: 0.4,
                  lineJoin: "round",
                  lineCap: "round",
                  dashArray: "0, 8, 8",
                }).addTo(map);
                routeLinesRef.current.push(highlightLine);
              }
            });
          } else {
            // Fallback: single colored line if legs data is not available with enhanced effects
            const shadowLine = L.polyline(allCoordinates, {
              color: "#000000",
              weight: 8,
              opacity: 0.2,
              lineJoin: "round",
              lineCap: "round",
            }).addTo(map);
            routeLinesRef.current.push(shadowLine);

            const polyline = L.polyline(allCoordinates, {
              color: "#3B82F6",
              weight: 6,
              opacity: 0.9,
              lineJoin: "round",
              lineCap: "round",
            }).addTo(map);
            routeLinesRef.current.push(polyline);

            const highlightLine = L.polyline(allCoordinates, {
              color: "#FFFFFF",
              weight: 2,
              opacity: 0.4,
              lineJoin: "round",
              lineCap: "round",
              dashArray: "0, 8, 8",
            }).addTo(map);
            routeLinesRef.current.push(highlightLine);
          }

          // Create markers for all waypoints with different colors
          waypoints.forEach((waypoint, index) => {
            const isStart = index === 0;
            const isEnd = index === waypoints.length - 1;
            const color = getWaypointColor(index, waypoints.length);
            
            let markerIcon: L.DivIcon;
            let label = "";

            if (isStart) {
              label = "A";
            } else if (isEnd) {
              label = "B";
            } else {
              label = String(index);
            }

            markerIcon = L.divIcon({
              className: "custom-route-marker",
              html: `
                <div style="position: relative; width: ${isStart || isEnd ? 30 : 28}px; height: ${isStart || isEnd ? 40 : 38}px;">
                  <svg width="${isStart || isEnd ? 30 : 28}" height="${isStart || isEnd ? 40 : 38}" viewBox="0 0 ${isStart || isEnd ? 30 : 28} ${isStart || isEnd ? 40 : 38}" xmlns="http://www.w3.org/2000/svg">
                    <path d="M${isStart || isEnd ? 15 : 14} 0C${isStart || isEnd ? 9.477 : 8.477} 0 ${isStart || isEnd ? 5 : 4} 4.477 ${isStart || isEnd ? 5 : 4} 10c0 ${isStart || isEnd ? 6.213 : 5.991} 10 ${isStart || isEnd ? 30 : 28} 10 ${isStart || isEnd ? 30 : 28}s10-${isStart || isEnd ? 23.787 : 22.009} 10-${isStart || isEnd ? 30 : 28}c0-5.523-4.477-10-10-10z" 
                      fill="${color.main}"/>
                    <circle cx="${isStart || isEnd ? 15 : 14}" cy="10" r="${isStart || isEnd ? 4 : 6}" fill="white"/>
                    <text x="${isStart || isEnd ? 15 : 14}" y="${isStart || isEnd ? 13 : 14}" text-anchor="middle" font-size="${isStart || isEnd ? 10 : 9}" fill="${color.main}" font-weight="bold">${label}</text>
                  </svg>
                </div>
              `,
              iconSize: [isStart || isEnd ? 30 : 28, isStart || isEnd ? 40 : 38],
              iconAnchor: [isStart || isEnd ? 15 : 14, isStart || isEnd ? 40 : 38],
            });

            const marker = L.marker(waypoint.latlng, { icon: markerIcon })
              .bindPopup(waypoint.name)
              .addTo(map);
            markersRef.current.push(marker);
          });

          // Fit bounds to show entire route
          if (routeLinesRef.current.length > 0) {
            const bounds = L.latLngBounds([]);
            routeLinesRef.current.forEach(line => {
              bounds.extend(line.getBounds());
            });
            map.fitBounds(bounds, { padding: [50, 50] });
          }

          // Extract instructions from OSRM steps
          const instructions = route.legs[0].steps.map((step: any, index: number) => {
            const maneuver = step.maneuver;
            const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : '';
            const streetName = step.name || '';
            const distance = step.distance ? ` for ${(step.distance / 1000).toFixed(2)} km` : '';
            
            // Generate instruction based on maneuver type
            let instruction = '';
            switch (maneuver.type) {
              case 'depart':
                instruction = `Head${modifier}${streetName ? ' on ' + streetName : ''}`;
                break;
              case 'turn':
                instruction = `Turn${modifier}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'merge':
                instruction = `Merge${modifier}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'on ramp':
                instruction = `Take the ramp${modifier}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'off ramp':
                instruction = `Take the exit${modifier}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'fork':
                instruction = `At the fork, keep${modifier}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'end of road':
                instruction = `At the end of the road, turn${modifier}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'continue':
                instruction = `Continue${modifier}${streetName ? ' on ' + streetName : ''}`;
                break;
              case 'roundabout':
              case 'rotary':
                const exit = maneuver.exit ? `, take exit ${maneuver.exit}` : '';
                instruction = `Enter the roundabout${exit}${streetName ? ' onto ' + streetName : ''}`;
                break;
              case 'arrive':
                instruction = 'Arrive at your destination';
                break;
              default:
                instruction = `${maneuver.type}${modifier}${streetName ? ' on ' + streetName : ''}`;
            }
            
            return instruction + distance;
          });

          // Call callback with route data
          if (onRouteCalculated) {
            onRouteCalculated({
              coordinates: waypoints.map(wp => [wp.latlng.lng, wp.latlng.lat] as [number, number]),
              distance: route.distance,
              duration: route.duration,
              instructions: instructions,
              legs: route.legs,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();

    // Cleanup function - will run when waypoints change or component unmounts
    return () => {
      routeLinesRef.current.forEach((line) => {
        map.removeLayer(line);
      });
      routeLinesRef.current = [];
      
      markersRef.current.forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    };
  }, [waypoints, map, onRouteCalculated]);

  return null;
}
