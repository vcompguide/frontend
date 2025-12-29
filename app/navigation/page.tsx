"use client";

import { Sdk, RouteRequestDtoModeEnum } from "@/src/backend/RESTful/BackendRESTfulSDK";
import { LatLng } from "leaflet";
import type { LatLng as LatLngType } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { FaMap, FaRoute } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { uuidv7 } from "uuidv7";
import { useRouter } from "next/navigation";
import { ChatBox } from "./chat";
import { DashboardScreen } from "./DashboardScreen";
import { FilterBox, type POIResult } from "./FilterBox";
import { NotificationProvider } from "./NotificationContext";
import { type PlannerCard, RouteViewer } from "./RouteViewer";
import { type Plan, type SavedRoute, SavedRoutesScreen } from "./SavedRoutesScreen";
import { SearchBox, type SearchResultMarker } from "./SearchBox";
import { SettingsScreen } from "./SettingsScreen";
import { fetchAddress } from "./MapContextMenu";
import { AuthProvider, useAuth } from "./AuthContext";
import { AuthScreen } from "./AuthScreen";
import { type FavoriteLocation, FavoritesScreen } from "./FavoritesScreen";
import Link from "next/link";
const LeafletMap = dynamic(() => import("./map").then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse" />,
});

function NavigationContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [onLocationPicked, setOnLocationPicked] = useState<(p: LatLng) => void>(() => { });
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [plannerCards, setPlannerCards] = useState<PlannerCard[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<SearchResultMarker[]>([]);
  const [pois, setPois] = useState<POIResult[]>([]);
  const [pathPoints, setPathPoints] = useState<LatLng[]>([]);
  const [routeDistance, setRouteDistance] = useState<string>("0 km");
  const [routeDuration, setRouteDuration] = useState<string>("0 min");
  const [segmentDistances, setSegmentDistances] = useState<{ [key: string]: number }>({}); // Map of "fromId-toId" -> distance in meters
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [poiMarkers, setPOIMarkers] = useState<SearchResultMarker[]>([]);
  const [selectedPOIType, setSelectedPOIType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Debug: Log user state
  useEffect(() => {
    console.log('User state changed:', user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('User has valid ID:', !!user.id && user.id !== '');
    }
  }, [user]);

  // Load saved routes from backend on mount
  useEffect(() => {
    const loadSavedRoutes = async () => {
      if (!user) {
        console.log('Load routes: No user logged in');
        return;
      }
      
      const userId = process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY;
      if (!userId) {
        console.log('Load routes: NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY not configured');
        return;
      }
      
      setIsLoadingRoutes(true);
      console.log('Loading saved routes with key:', userId);
      
      try {
        const api = new Sdk({
          baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
          securityWorker: async () => ({
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
            },
          }),
        });

        const response = await api.savedRoute.savedRouteControllerGetSavedRoutesByUserId(
          userId,
          { userId: userId }
        );
        
        console.log('Load routes response:', response.data);
        
        if (response.data?.route) {
          const routes: SavedRoute[] = response.data.route.map(r => ({
            id: r.id,
            name: r.name,
            distance: r.distance,
            duration: r.duration,
            color: r.color,
            waypointsList: r.waypointsList.map(w => ({
              id: w.id,
              title: w.title,
              description: w.description,
              location: w.location ? [w.location.x, w.location.y] as [number, number] : undefined,
              color: w.color,
              finished: w.finished ?? false,
              startTime: w.startTime ?? Date.now(),
            })),
          }));
          
          setSavedRoutes(routes);
          console.log('Loaded', routes.length, 'saved routes from backend');
        } else {
          console.log('No routes found in response');
        }
      } catch (error) {
        console.error('Failed to load saved routes from backend:', error);
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    loadSavedRoutes();
  }, [user]);

  // Save routes to backend whenever they change
  useEffect(() => {
    // Skip saving if we're currently loading routes or if there's no user
    if (isLoadingRoutes || !user) {
      console.log('Save routes: Skipped (loading:', isLoadingRoutes, ', user:', !!user, ')');
      return;
    }
    
    const userId = process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY;
    if (!userId) {
      console.log('Save routes: NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY not configured');
      return;
    }
    
    const saveRoutesToBackend = async () => {
      if (savedRoutes.length === 0) {
        console.log('Save routes: No routes to save');
        return;
      }
      
      console.log('Preparing to save', savedRoutes.length, 'routes with key:', userId);
      console.log('Routes to save:', JSON.stringify(savedRoutes, null, 2));
      
      try {
        const api = new Sdk({
          baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
          securityWorker: async () => ({
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
            },
          }),
        });

        const routesToSave = savedRoutes.map(route => ({
          id: route.id,
          name: route.name,
          distance: route.distance,
          duration: route.duration,
          color: route.color,
          waypointsList: route.waypointsList.map(w => ({
            id: w.id,
            title: w.title,
            description: w.description,
            location: w.location ? { x: w.location[0], y: w.location[1] } : undefined,
            color: w.color,
            finished: w.finished,
            startTime: w.startTime,
          })),
        }));

        await api.savedRoute.savedRouteControllerCreateSavedRoute({
          userId: userId,
          route: routesToSave,
        });
        
        console.log('Successfully saved', savedRoutes.length, 'routes to backend');
      } catch (error) {
        console.error('Failed to save routes to backend:', error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveRoutesToBackend, 1000);
    return () => clearTimeout(timeoutId);
  }, [savedRoutes, user, isLoadingRoutes]);

  // Load favorites from backend on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        console.log('Load favorites: No user logged in');
        return;
      }
      
      const userId = process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY;
      if (!userId) {
        console.log('Load favorites: NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY not configured');
        return;
      }
      
      setIsLoadingFavorites(true);
      console.log('Loading favorites with key:', userId);
      
      try {
        const api = new Sdk({
          baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
          securityWorker: async () => ({
            headers: {
              Authorization: `Bearer ${userId}`,
            },
          }),
        });

        const response = await api.favorites.favoriteControllerGetFavoriteIds(
          userId,
          { userId: userId }
        );
        
        console.log('Load favorites response:', response.data);
        
        if (response.data?.placeIds && Array.isArray(response.data.placeIds)) {
          let placeIdsArray = response.data.placeIds;
          
          // If the backend stored comma-separated JSON objects as a single string,
          // we need to split it first
          if (placeIdsArray.length === 1 && placeIdsArray[0].includes('},{')) {
            console.log('Splitting comma-separated favorites string');
            // Split by '}, ' and add back the closing braces
            placeIdsArray = placeIdsArray[0].split('}, ').map((str, idx, arr) => {
              // Add back closing brace for all but the last element
              return idx < arr.length - 1 ? str + '}' : str;
            });
            console.log('Split into', placeIdsArray.length, 'parts');
          }
          
          // Parse each placeId string as a JSON object
          const loadedFavorites: FavoriteLocation[] = placeIdsArray
            .map((placeIdStr: string) => {
              try {
                const trimmed = placeIdStr.trim();
                console.log('Parsing favorite string:', trimmed.substring(0, 50) + '...');
                return JSON.parse(trimmed) as FavoriteLocation;
              } catch (error) {
                console.error('Failed to parse favorite:', placeIdStr, error);
                return null;
              }
            })
            .filter((fav): fav is FavoriteLocation => fav !== null);
          
          setFavorites(loadedFavorites);
          console.log('Loaded', loadedFavorites.length, 'favorites:', loadedFavorites);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [user]);

  // Save favorites to backend when they change
  useEffect(() => {
    if (isLoadingFavorites) return;
    if (!user) return;
    
    const saveFavorites = async () => {
      const userId = process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY;
      if (!userId) return;
      
      try {
        const api = new Sdk({
          baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
          securityWorker: async () => ({
            headers: {
              Authorization: `Bearer ${userId}`,
            },
          }),
        });

        // Convert favorites to JSON strings for the API
        const placeIdsString = favorites
          .map(fav => JSON.stringify(fav))
          .join(', ');
        
        console.log('Saving favorites as string:', placeIdsString.substring(0, 100) + '...');
        console.log('Saving', favorites.length, 'favorites');
        
        await api.favorites.favoriteControllerUpdateFavorites({
          userId: userId,
          placeIds: placeIdsString,
        });
        
        console.log('Successfully saved', favorites.length, 'favorites to backend');
      } catch (error) {
        console.error('Failed to save favorites to backend:', error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveFavorites, 1000);
    return () => clearTimeout(timeoutId);
  }, [favorites, user, isLoadingFavorites]);

  const calculatePathFromCards = useCallback(async (cards: PlannerCard[]): Promise<{ waypoints: LatLngType[], distance: string, duration: string }> => {
    // 1. Filter and format the data
    const cardsWithPositions = cards.filter(card => card.position);
    const formattedPositions = cardsWithPositions.map(card => ({
      lat: card.position!.lat,
      lon: card.position!.lng
    }));

    // 2. Guard clause: Don't fetch if there aren't enough points
    if (formattedPositions.length < 2) return { waypoints: [], distance: "0 km", duration: "0 min" };
    
    try {
      const api = new Sdk({
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        securityWorker: async () => ({
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
          },
        }),
      });

      const response = await api.routing.routingControllerGetRoute({
        waypoints: formattedPositions,
        mode: RouteRequestDtoModeEnum.Driving,
      });

      // Extract route data
      const routeData = response.data;

      // 5. Extract and convert coordinates from API response
      // API returns coordinates as [lng, lat] in geometry.coordinates
      // We need to convert to Leaflet LatLng objects (lat, lng order)
      if (!routeData.success || !routeData.data?.geometry) {
        console.error("Invalid route data structure:", routeData);
        return { waypoints: [], distance: "0 km", duration: "0 min" };
      }

      const coordinates: number[][] = (routeData.data.geometry as any).coordinates || [];
      const waypoints: LatLngType[] = coordinates.map((coord: number[]) => {
        const [lng, lat] = coord;
        return new LatLng(lat, lng);
      });

      // Update total distance and duration
      const distanceKm = (routeData.data.distance / 1000).toFixed(1);
      const durationMin = Math.round(routeData.data.duration / 60);
      const distanceStr = `${distanceKm} km`;
      const durationStr = `${durationMin} min`;
      setRouteDistance(distanceStr);
      setRouteDuration(durationStr);

      // Calculate segment distances between consecutive waypoints
      if ((routeData.data as any).legs && Array.isArray((routeData.data as any).legs)) {
        const segments: { [key: string]: number } = {};
        (routeData.data as any).legs.forEach((leg: any, index: number) => {
          if (index < cardsWithPositions.length - 1) {
            const fromId = cardsWithPositions[index].id;
            const toId = cardsWithPositions[index + 1].id;
            segments[`${fromId}-${toId}`] = leg.distance; // distance in meters
          }
        });
        setSegmentDistances(segments);
      }

      console.log(`Route calculated: ${waypoints.length} points, ${distanceKm}km, ${durationMin}min`);
      return { waypoints, distance: distanceStr, duration: durationStr };

    } catch (error) {
      console.error("Failed to calculate path:", error);
      return { waypoints: [], distance: "0 km", duration: "0 min" }; // Return empty path on failure
    }
  }, []);

  const handleCardsChange = useCallback(async (cards: PlannerCard[]) => {
    setPlannerCards(cards);

    const result = await calculatePathFromCards(cards);
    setPathPoints(result.waypoints);

    if (!activeRouteId) return;
    setSavedRoutes(prev => prev.map(route => {
      if (route.id === activeRouteId) {
        return {
          ...route,
          distance: result.distance,
          duration: result.duration,
          waypointsList: cards.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            location: c.position ? [c.position.lat, c.position.lng] as [number, number] : undefined,
            color: c.color,
            finished: c.finished,
            startTime: c.startTime,
          }) as Plan)
        };
      }
      return route;
    }));
  }, [activeRouteId, calculatePathFromCards]);

  const handleImportRoute = async (route: SavedRoute) => {
    // Load the new route without clearing first to prevent map reset
    const cards: PlannerCard[] = route.waypointsList.map((w) => {
      let position: LatLng | undefined;
      if (w.location && Array.isArray(w.location) && w.location.length === 2) {
        position = { lat: w.location[0], lng: w.location[1] } as LatLng;
      }
      return {
        id: w.id,
        title: w.title,
        description: w.description || "",
        position,
        color: w.color,
        tags: [],
        finished: w.finished,
        startTime: w.startTime,
      };
    });

    // Set map center: if route has waypoints, center on first waypoint; otherwise use default
    if (route.waypointsList.length > 0 && route.waypointsList[0].location) {
      const [lat, lng] = route.waypointsList[0].location;
      setMapCenter({ lat, lng });
    } else {
      setMapCenter({ lat: 10.7725, lng: 106.6980 }); // Default Paris center
    }

    setActiveRouteId(route.id);
    setPlannerCards(cards);
    
    // Calculate and load path for the imported route
    const result = await calculatePathFromCards(cards);
    setPathPoints(result.waypoints);
    
    setViewerOpen(true);
    setActiveTab("Map View");
  };

  const COLOR_OPTIONS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];


  const handleCreateNewRoute = () => {
    // Create a new empty route in saved routes
    // Cycle through colors based on the current number of routes
    const colorIndex = savedRoutes.length % COLOR_OPTIONS.length;
    const newRoute: SavedRoute = {
      id: uuidv7(),
      name: `New Route ${savedRoutes.length + 1}`,
      distance: "0 km",
      duration: "0 min",
      waypointsList: [],
      color: COLOR_OPTIONS[colorIndex],
    };

    // Add to saved routes
    const updatedRoutes = [...savedRoutes, newRoute];
    setSavedRoutes(updatedRoutes);

    // Import it into route viewer
    handleImportRoute(newRoute);
  };

  const handlePickLocation = useCallback((callback: (p: LatLng) => void) => {
    setIsPickingLocation(true);
    setOnLocationPicked(() => (p: LatLng) => {
      callback(p);
      setIsPickingLocation(false);
    });
  }, []);

  const handleCreateNewPlan = async () => {
    // Cycle through colors based on the current number of plans
    const colorIndex = plannerCards.length % COLOR_OPTIONS.length;
    const newCard: PlannerCard = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Plan ${plannerCards.length + 1}`,
      description: "A new card",
      color: COLOR_OPTIONS[colorIndex],
      tags: [],
      finished: false,
      startTime: Date.now(),
    };
    
    let routeId = activeRouteId;
    if (!routeId) {
      const colorIndex = savedRoutes.length % COLOR_OPTIONS.length;
      const newRoute: SavedRoute = {
        id: uuidv7(),
        name: `New Route ${savedRoutes.length + 1}`,
        distance: "0 km",
        duration: "0 min",
        waypointsList: [],
        color: COLOR_OPTIONS[colorIndex],
      }

      const updatedRoutes = [...savedRoutes, newRoute];
      setSavedRoutes(updatedRoutes);
      setActiveRouteId(newRoute.id);
      routeId = newRoute.id;
    }
    
    const updatedCards = [...plannerCards, newCard];
    setPlannerCards(updatedCards);
    
    // Calculate route and update distances
    const result = await calculatePathFromCards(updatedCards);
    setPathPoints(result.waypoints);
    
    // Update savedRoutes with the new card
    setSavedRoutes(prev => prev.map(route => {
      if (route.id === routeId) {
        return {
          ...route,
          distance: result.distance,
          duration: result.duration,
          waypointsList: updatedCards.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            location: c.position ? [c.position.lat, c.position.lng] as [number, number] : undefined,
            color: c.color,
            finished: c.finished,
            startTime: c.startTime,
          }) as Plan)
        };
      }
      return route;
    }));
  };

  const handleAddPlanFromMap = useCallback(async (position: LatLng) => {
    let routeId = activeRouteId;
    if (!routeId) {
      const colorIndex = savedRoutes.length % COLOR_OPTIONS.length;
      const newRoute: SavedRoute = {
        id: uuidv7(),
        name: `New Route ${savedRoutes.length + 1}`,
        distance: "0 km",
        duration: "0 min",
        waypointsList: [],
        color: COLOR_OPTIONS[colorIndex],
      };

      const updatedRoutes = [...savedRoutes, newRoute];
      setSavedRoutes(updatedRoutes);
      setActiveRouteId(newRoute.id);
      routeId = newRoute.id;
      if (!viewerOpen) {
        setViewerOpen(true);
      }
      if (activeTab != "Map View") {
        setActiveTab("Map View");
        setMapCenter({ lat: position.lat, lng: position.lng });
      }
    }

    const colorIndex = plannerCards.length % COLOR_OPTIONS.length;
    const cardId = uuidv7();
    const newCard: PlannerCard = {
      id: cardId,
      title: `Plan ${plannerCards.length + 1}`,
      description: "Loading address...",
      color: COLOR_OPTIONS[colorIndex],
      tags: [],
      position: position,
      finished: false,
      startTime: Date.now(),
    };

    // Add card immediately without waiting for address
    const updatedCards = [...plannerCards, newCard];
    setPlannerCards(updatedCards);
    
    // Update savedRoutes directly with routeId
    const updateRouteWithCards = async (cards: PlannerCard[]) => {
      // Calculate route and update distances
      const result = await calculatePathFromCards(cards);
      setPathPoints(result.waypoints);
      
      setSavedRoutes(prev => prev.map(route => {
        if (route.id === routeId) {
          return {
            ...route,
            distance: result.distance,
            duration: result.duration,
            waypointsList: cards.map(c => ({
              id: c.id,
              title: c.title,
              description: c.description,
              location: c.position ? [c.position.lat, c.position.lng] as [number, number] : undefined,
              color: c.color,
              finished: c.finished,
              startTime: c.startTime,
            }) as Plan)
          };
        }
        return route;
      }));
    };
    
    updateRouteWithCards(updatedCards);

    // Fetch address asynchronously and update the card
    fetchAddress(position.lat, position.lng).then(address => {
      setPlannerCards(prevCards => {
        const cardIndex = prevCards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return prevCards;

        const updated = [...prevCards];
        updated[cardIndex] = { ...updated[cardIndex], description: address };
        updateRouteWithCards(updated);
        return updated;
      });
    });

    // Open route viewer if closed and switch to map view
    if (!viewerOpen) {
      setViewerOpen(true);
    }
  }, [plannerCards, viewerOpen, activeRouteId, savedRoutes]);

  const handleAddUserLocationPlan = useCallback(() => {
    if (!userLocation) return;
    handleAddPlanFromMap(userLocation);
  }, [userLocation, handleAddPlanFromMap]);

  const handleLocationSelect = useCallback((location: { lat: number; lng: number; name: string }) => {
    // Center map on selected location
    setMapCenter({ lat: location.lat, lng: location.lng });
    // Switch to map view if not already there
    if (activeTab !== "Map View") {
      setActiveTab("Map View");
    }
  }, [activeTab]);

  const handleSearchResultsChange = useCallback((results: SearchResultMarker[]) => {
    console.log('Page received search results:', results);
    setSearchResults(results);
  }, []);

  const handlePOIsFound = useCallback((results: POIResult[]) => {
    console.log('Page received POI results:', results);
    setPois(results);
  }, []);

  // Favorites handlers
  const handleAddToFavorites = useCallback(async (position: LatLng, name?: string) => {
    const address = await fetchAddress(position.lat, position.lng);
    const favoriteNumber = favorites.length + 1;
    const newFavorite: FavoriteLocation = {
      id: uuidv7(),
      name: name || `Favourite ${favoriteNumber}`,
      address: address,
      lat: position.lat,
      lng: position.lng,
    };
    setFavorites(prev => [...prev, newFavorite]);
    console.log('Added to favorites:', newFavorite);
  }, [favorites.length]);

  const handleRemoveFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  }, []);

  const handleCloneFavoriteToPlan = useCallback(async (favorite: FavoriteLocation) => {
    // Cycle through colors based on the current number of plans
    const colorIndex = plannerCards.length % COLOR_OPTIONS.length;
    
    const newCard: PlannerCard = {
      id: uuidv7(),
      title: favorite.name,
      description: favorite.address,
      color: COLOR_OPTIONS[colorIndex],
      tags: [],
      position: new LatLng(favorite.lat, favorite.lng),
      finished: false,
      startTime: Date.now(),
    };
    
    const updatedCards = [...plannerCards, newCard];
    setPlannerCards(updatedCards);
    
    // Trigger distance evaluation for the updated cards
    try {
      const result = await calculatePathFromCards(updatedCards);
      setPathPoints(result.waypoints);
      
      // Update the active route with new distance and duration
      if (activeRouteId) {
        setSavedRoutes(prev =>
          prev.map(r =>
            r.id === activeRouteId
              ? {
                  ...r,
                  distance: result.distance,
                  duration: result.duration,
                  waypointsList: updatedCards.map(c => ({
                    lat: c.position!.lat,
                    lng: c.position!.lng,
                    title: c.title,
                    description: c.description || '',
                    tags: c.tags || [],
                    color: c.color,
                    finished: c.finished,
                    id: c.id,
                    startTime: c.startTime,
                  })),
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Failed to calculate path after cloning favorite:', error);
    }
    
    // Open route viewer if closed
    if (!viewerOpen) {
      setViewerOpen(true);
    }
    
    console.log('Cloned favorite to plan:', favorite.name);
  }, [plannerCards, viewerOpen, calculatePathFromCards, activeRouteId]);

  const handleReorderFavorites = useCallback((fromIndex: number, toIndex: number) => {
    setFavorites(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  const fetchPOIsByType = useCallback(async (type: string) => {
    console.log('Fetching POIs by tag:', type);
    
    try {
      const api = new Sdk({
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        securityWorker: async () => ({
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
          },
        }),
      });

      // Use the place API to get places by tags
      const response = await api.place.placeControllerGetPlacesByTags({
        tags: type,
      });

      console.log('POI response:', response.data);

      // Convert to POIResult format for proper POI marker rendering
      if (response.data && response.data.places) {
        const places = response.data.places;
        console.log('Found', places.length, 'places with tag:', type);
        
        const poiResults: POIResult[] = places.map((place, index) => ({
          id: `${type}-${index}-${place.name}`,
          name: place.name,
          lat: place.location.x,  // x is latitude (e.g., 10.77...)
          lng: place.location.y,  // y is longitude (e.g., 106.69...)
          type: type,
          address: place.tags?.join(', ') || type,
        }));
        
        console.log('Setting POIs:', poiResults);
        setPois(poiResults);
        setSelectedPOIType(type);
      } else {
        console.log('No places found in response');
        setPois([]);
        setSelectedPOIType(type);
      }
    } catch (error) {
      console.error('Failed to fetch POIs:', error);
      setPois([]);
    }
  }, []);

  const clearPOIs = useCallback(() => {
    setPOIMarkers([]);
    setPois([]);
    setSelectedPOIType(null);
  }, []);

  const handleClearPath = useCallback(() => {
    setPathPoints([]);
    setRouteDistance("0 km");
    setRouteDuration("0 min");
    setSegmentDistances({});
  }, []);

  const activeRoute = savedRoutes.find(r => r.id === activeRouteId);

  return (
    <NotificationProvider>
      <div
        className="relative flex flex-row w-full h-screen bg-[#0f1110] overflow-hidden font-sans text-gray-200"
        onContextMenu={(e) => { e.preventDefault(); }}
        role="application"
      >
        <RouteViewer
          isOpen={viewerOpen}
          onToggle={() => setViewerOpen(!viewerOpen)}
          onPickLocation={handlePickLocation}
          onCardsChange={handleCardsChange}
          initialCards={plannerCards}
          activeRouteName={activeRoute?.name}
          onCreateNewRoute={handleCreateNewRoute}
          onCreateNewPlan={handleCreateNewPlan}
          userLocation={userLocation}
          onAddUserLocationPlan={handleAddUserLocationPlan}
          segmentDistances={segmentDistances}
          onClearPath={handleClearPath}
        />

        <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 p-6 flex flex-col">
          <Link 
            href="/"
            className="mb-8 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <FaMap className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-bold text-white">ViCons</h1>
          </Link>

          <nav className="flex flex-col gap-2 flex-1">
            <SidebarItem icon={<MdDashboard />} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
            <SidebarItem icon={<FaMap />} label="Map View" active={activeTab === "Map View"} onClick={() => setActiveTab("Map View")} />
            <SidebarItem icon={<FaRoute />} label="Saved Routes" active={activeTab === "Saved"} onClick={() => setActiveTab("Saved")} />
            <SidebarItem icon={<span>⭐</span>} label="Favorites" active={activeTab === "Favorites"} onClick={() => setActiveTab("Favorites")} />

            {/* POI Filters Section */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">City-wide POIs</p>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'museum' ? clearPOIs() : fetchPOIsByType('museum')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'museum'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  🏛️ Museums
                </button>
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'history' ? clearPOIs() : fetchPOIsByType('history')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'history'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  📜 History
                </button>
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'park' ? clearPOIs() : fetchPOIsByType('park')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'park'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  🌳 Parks
                </button>
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'nature' ? clearPOIs() : fetchPOIsByType('nature')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'nature'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  🌿 Nature
                </button>
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'landmark' ? clearPOIs() : fetchPOIsByType('landmark')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'landmark'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  🗺️ Landmarks
                </button>
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'tourism' ? clearPOIs() : fetchPOIsByType('tourism')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'tourism'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  🎫 Tourism
                </button>
                <button
                  type="button"
                  onClick={() => selectedPOIType === 'zoo' ? clearPOIs() : fetchPOIsByType('zoo')}
                  className={`text-xs px-3 py-2 rounded-lg text-left transition font-medium ${
                    selectedPOIType === 'zoo'
                      ? 'bg-emerald-500/30 text-emerald-300 border-l-2 border-emerald-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  🦁 Zoos
                </button>
              </div>
            </div>

            {activeRoute && (
              <div className="mt-8 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Active Route</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRouteId(null);
                      setPlannerCards([]);
                      setPathPoints([]);
                      setRouteDistance("0 km");
                      setRouteDuration("0 min");
                      setSegmentDistances({});
                    }}
                    className="text-xs px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition"
                    title="Unload current route"
                  >
                    Unload
                  </button>
                </div>
                <p className="text-sm text-white font-medium truncate">{activeRoute.name}</p>
              </div>
            )}
          </nav>

          <button type="button" className="mt-auto pt-6 border-t border-gray-800 flex items-center gap-3" onClick={() => setActiveTab("Settings")}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="size-10 rounded-full object-cover" />
            ) : (
              <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name || "User"}</p>
            </div>
          </button>
        </aside>

        <main className="relative flex-1 h-full overflow-hidden">
          {activeTab === "Dashboard" && <DashboardScreen planCards={plannerCards} savedRoutes={savedRoutes} onNavigate={setActiveTab} />}
          {activeTab === "Saved" && <SavedRoutesScreen initialRoutes={savedRoutes} onRoutesChange={setSavedRoutes} onImportToPlanner={handleImportRoute} />}
          {activeTab === "Favorites" && (
            <FavoritesScreen
              favorites={favorites}
              onRemove={handleRemoveFavorite}
              onCloneToPlan={handleCloneFavoriteToPlan}
              onReorder={handleReorderFavorites}
            />
          )}
          {activeTab === "Settings" && <SettingsScreen />}

          {activeTab === "Map View" && (
            <>
              <div className="absolute inset-0 z-0">
                <LeafletMap
                  isPickingCardLocation={isPickingLocation}
                  onCardLocationPicked={onLocationPicked}
                  planCards={plannerCards}
                  centerLocation={mapCenter}
                  searchResults={searchResults}
                  pois={pois}
                  favorites={favorites}
                  onAddPlanFromMap={handleAddPlanFromMap}
                  onAddToFavorites={handleAddToFavorites}
                  onUserLocationChange={setUserLocation}
                  pathPoints={pathPoints}
                />
              </div>
              <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between pointer-events-none">
                <div className="pointer-events-auto">
                  <SearchBox
                    onLocationSelect={handleLocationSelect}
                    onSearchResultsChange={handleSearchResultsChange}
                  />
                </div>
                <div className="pointer-events-auto">
                  <FilterBox
                    userLocation={userLocation}
                    plannerCards={plannerCards}
                    onPOIsFound={handlePOIsFound}
                  />
                </div>
              </div>
              <ChatBox />
            </>
          )}
        </main>
      </div>
    </NotificationProvider>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${active ? "bg-emerald-500/10 text-emerald-500" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      {icon} <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

function AuthWrapper() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#0f1110] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-emerald-500 mb-4 animate-pulse">
            <FaMap className="text-white" size={32} />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <NavigationContent />;
}
