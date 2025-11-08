// app/map/page.tsx
"use client"
import dynamic from 'next/dynamic';

// This is the key:
// We are dynamically importing the map component and disabling SSR.
const Map = dynamic(
  () => import('./map'), // 1. Path to your new component
  {
    ssr: false, // 2. This tells Next.js to *only* load it on the client
  }
);

// This is the main page component
export default function MapPage() {
  // It just renders the dynamically imported map
  return <Map />;
}