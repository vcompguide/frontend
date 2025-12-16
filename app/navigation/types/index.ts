import { LatLng } from "leaflet";

export interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  icon?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface RoutePoint {
  latlng: LatLng;
  name: string;
  id: string;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  instructions?: string[];
  legs?: Array<{
    distance: number;
    duration: number;
  }>;
}
