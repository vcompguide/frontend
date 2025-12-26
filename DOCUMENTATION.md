# ViComp Navigation App - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Components](#core-components)
3. [Utilities](#utilities)
4. [Data Types & Interfaces](#data-types--interfaces)
5. [Configuration](#configuration)

---

## Project Overview

**ViComp** is a Next.js-based virtual tour guide and navigation application that enables users to plan routes, search locations, view maps, and interact with an AI chatbot for travel assistance.

**Tech Stack:**

- Next.js 14+ (React Framework)
- TypeScript
- Leaflet (Map library)
- Tailwind CSS
- dnd-kit (Drag & Drop)

---

## Core Components

### 1. Layout & Root Components

#### `app/layout.tsx`

##### `RootLayout(props)`

**Purpose:** Root layout component for the entire application.

**Parameters:**

- `children: React.ReactNode` - Child components to render

**Returns:** HTML document structure with fonts and global styles

**Features:**

- Configures Google Fonts (Geist, Inter, Roboto)
- Sets up metadata for SEO
- Provides base HTML structure

---

##### `NavigationButton(props)`

**Purpose:** Reusable navigation button component.

**Parameters:**

- `Text: string` - Display text for the button
- `link: string` - URL path for navigation

**Returns:** Link component styled as a button

---

#### `app/page.tsx`

##### `Home()`

**Purpose:** Landing/homepage component for the application.

**Returns:** Marketing page with hero section, features, and footer

**Features:**

- Hero section with call-to-action
- Statistics display
- Feature cards
- Popular destinations showcase
- Footer with links

---

##### `Button(props)`

**Purpose:** Styled button component with variants.

**Parameters:**

- `children: React.ReactNode` - Button content
- `variant?: "primary" | "secondary" | "ghost" | "outline"` - Button style variant (default: "primary")
- `className?: string` - Additional CSS classes
- `icon?: React.ElementType` - Optional icon component

**Returns:** Styled button element

---

##### `StatCard(props)`

**Purpose:** Display statistic cards on homepage.

**Parameters:**

- `count: string` - Numeric value to display
- `label: string` - Description label

**Returns:** Card element with count and label

---

##### `FeatureCard(props)`

**Purpose:** Feature showcase card component.

**Parameters:**

- `icon: React.ElementType` - Icon component for the feature
- `title: string` - Feature title
- `desc: string` - Feature description

**Returns:** Card element with icon, title, and description

---

##### `DestinationCard(props)`

**Purpose:** Destination preview card.

**Parameters:**

- `image: string` - Image URL (currently unused)
- `title: string` - Destination name
- `subtitle: string` - Destination description

**Returns:** Card element for a destination

---

### 2. Navigation & Main App

#### `app/navigation/page.tsx`

##### `Page()`

**Purpose:** Main navigation application page with map, route viewer, and sidebar.

**State Management:**

- `activeTab: string` - Currently active sidebar tab
- `viewerOpen: boolean` - Route viewer panel visibility
- `isPickingLocation: boolean` - Location picker mode status
- `onLocationPicked: (p: LatLng) => void` - Callback for location selection
- `activeRouteId: string | null` - Currently active route ID
- `plannerCards: PlannerCard[]` - Array of plan cards
- `mapCenter: {lat, lng} | null` - Map center coordinates
- `searchResults: SearchResultMarker[]` - Search result markers
- `savedRoutes: SavedRoute[]` - Array of saved routes

**Key Functions:**

###### `handleCardsChange(cards: PlannerCard[])`

Updates planner cards and synchronizes with saved routes.

**Parameters:**

- `cards: PlannerCard[]` - Updated array of planner cards

---

###### `handleImportRoute(route: SavedRoute)`

Imports a saved route into the route viewer.

**Parameters:**

- `route: SavedRoute` - Route to import

**Side Effects:**

- Converts route to planner cards
- Sets map center
- Opens route viewer
- Switches to Map View

---

###### `handleCreateNewRoute()`

Creates a new empty route.

**Side Effects:**

- Generates new route with unique ID
- Adds to saved routes
- Imports into route viewer

---

###### `handlePickLocation(callback: (p: LatLng) => void)`

Enables location picking mode on the map.

**Parameters:**

- `callback: (p: LatLng) => void` - Function to call with selected location

---

###### `handleCreateNewPlan()`

Creates a new empty plan card.

**Side Effects:**

- Generates new plan with unique ID
- Adds to planner cards

---

###### `handleLocationSelect(location: {lat, lng, name})`

Centers map on selected location from search.

**Parameters:**

- `location: {lat: number, lng: number, name: string}` - Selected location

---

###### `handleSearchResultsChange(results: SearchResultMarker[])`

Updates search result markers on the map.

**Parameters:**

- `results: SearchResultMarker[]` - Array of search results

---

##### `SidebarItem(props)`

**Purpose:** Sidebar navigation item component.

**Parameters:**

- `icon: React.ReactNode` - Icon element
- `label: string` - Display label
- `active: boolean` - Active state
- `onClick: () => void` - Click handler

**Returns:** Styled sidebar button

---

##### `CircleButton(props)`

**Purpose:** Circular action button.

**Parameters:**

- `icon: React.ReactNode` - Icon element
- `onClick?: () => void` - Optional click handler

**Returns:** Circular button component

---

### 3. Map Components

#### `app/navigation/map.tsx`

##### `LeafletMap(props)`

**Purpose:** Main interactive map component using Leaflet.

**Parameters:**

- `isPickingCardLocation?: boolean` - Location picking mode (default: false)
- `onCardLocationPicked?: (position: LatLng) => void` - Location picked callback
- `onCursorMove?: (position: LatLng) => void` - Cursor move callback
- `planCards?: Array<{...}>` - Plan cards to display as markers
- `searchResults?: Array<{...}>` - Search results to display
- `centerLocation?: {lat, lng}` - Map center location
- `onMapCenterChange?: (center: {lat, lng}) => void` - Center change callback
- `initialCenter?: [number, number]` - Initial map center (default: [10.7725, 106.6980])

**Returns:** Leaflet map container with markers and controls

**Features:**

- Dark mode tiles
- User location tracking
- Plan card markers
- Search result markers
- Zoom controls
- Location centering

---

##### `createCustomMarker(color: string)`

**Purpose:** Creates a custom colored map marker icon.

**Parameters:**

- `color: string` - Hex color for the marker (default: "#3b82f6")

**Returns:** `L.Icon` - Leaflet icon instance

**Caching:** Uses `markerCache` to avoid recreating identical markers

---

##### `createSearchMarker()`

**Purpose:** Creates a marker for search results.

**Returns:** `L.Icon` - Leaflet icon instance with amber color

---

##### `MapCenterUpdater({ center })`

**Purpose:** Component to update map center position.

**Parameters:**

- `center: {lat, lng} | undefined` - Target center coordinates

**Side Effects:** Flies map to new center with animation

---

##### `MarkerSetter(props)`

**Purpose:** Handles map click events for location picking.

**Parameters:**

- `setDisplay: (isDisplayed: boolean) => void` - Display state setter
- `isPickingCardLocation: boolean` - Location picking mode
- `onCardLocationPicked: (position: LatLng) => void` - Location picked callback

**Side Effects:**

- Calls location picked callback when in picking mode
- Hides display when clicking outside picking mode

---

##### `CursorTracker(props)`

**Purpose:** Tracks cursor position on the map.

**Parameters:**

- `isPickingCardLocation: boolean` - Location picking mode
- `onCursorMove: (position: LatLng) => void` - Cursor move callback

**Side Effects:** Calls cursor move callback during location picking

---

##### `DisplayMarker(props)`

**Purpose:** Conditional marker display component.

**Parameters:**

- `displayed: boolean` - Whether to display marker
- `position: LatLng` - Marker position

**Returns:** Marker component or null

---

##### `LocateUserOnLoad(props)`

**Purpose:** Locates user on component mount.

**Parameters:**

- `locationSetter: (LatLng: LatLng) => void` - Location state setter

**Side Effects:**

- Requests geolocation permission
- Centers map on user location
- Runs once on mount

---

##### `MapResizer()`

**Purpose:** Fixes map rendering after container size changes.

**Side Effects:** Calls `map.invalidateSize()` after mount

---

##### `MapZoomController()`

**Purpose:** Custom zoom in/out controls.

**Returns:** Button group for zoom controls

**Features:**

- Zoom in button
- Zoom out button
- Dark theme styling

---

##### `UserLocationController()`

**Purpose:** Button to recenter map on user location.

**Returns:** Location button component

**Features:**

- Gets current geolocation
- Animates map to user position
- Error handling with alerts

---

#### `app/navigation/MapMarkers.tsx`

##### `markerAnimationsStyles`

**Type:** Constant string

**Purpose:** CSS animation definitions for markers.

**Contains:**

- `spin-slow` - Slow rotation animation
- `pulse-gold` - Pulsing gold effect

---

##### `adjustColorBrightness(hex: string, percent: number)`

**Purpose:** Adjusts hex color brightness.

**Parameters:**

- `hex: string` - Hex color code
- `percent: number` - Brightness adjustment percentage (-100 to 100)

**Returns:** `string` - Adjusted hex color

---

##### `createFantasyMarkerSvg(color: string)`

**Purpose:** Generates SVG string for fantasy-styled marker.

**Parameters:**

- `color: string` - Base color for marker

**Returns:** `string` - SVG markup

**Features:**

- Gradient fills
- Drop shadows
- Custom styling

---

##### `createMarkerIcon(color: string)`

**Purpose:** Creates Leaflet icon from SVG.

**Parameters:**

- `color: string` - Marker color

**Returns:** `L.Icon` - Leaflet icon instance

---

##### `userLocationIcon`

**Type:** L.DivIcon

**Purpose:** Custom icon for user's current location.

**Features:**

- Pulsing blue circle
- Inner dot
- Transparent outer ring

---

##### `highlightMarkerIcon`

**Type:** L.DivIcon

**Purpose:** Icon for highlighted/selected locations.

**Features:**

- Golden color scheme
- Spinning outer ring
- Pulsing glow effect
- Rune-like design

---

##### `getCachedCustomMarker(color: string)`

**Purpose:** Gets or creates cached marker icon.

**Parameters:**

- `color: string` - Marker color (default: "#3b82f6")

**Returns:** `L.Icon` - Cached or newly created icon

**Optimization:** Prevents recreating identical icons

---

##### `initDefaultMarker()`

**Purpose:** Initializes default marker style for all markers.

**Side Effects:** Sets default icon for all Leaflet markers

**Usage:** Should be called in useEffect on component mount

---

### 4. Route & Plan Management

#### `app/navigation/RouteViewer.tsx`

##### `RouteViewer(props)`

**Purpose:** Sidebar component for viewing and editing route plans.

**Parameters:**

- `isOpen: boolean` - Panel visibility
- `onToggle: () => void` - Toggle visibility callback
- `onPickLocation?: (callback) => void` - Location picker callback
- `onCardsChange?: (cards: PlannerCard[]) => void` - Cards change callback
- `initialCards?: PlannerCard[]` - Initial plan cards
- `activeRouteName?: string` - Currently active route name
- `onCreateNewRoute?: () => void` - New route creation callback
- `onCreateNewPlan?: () => void` - New plan creation callback

**State:**

- `cards: PlannerCard[]` - Current plan cards
- `editingCardId: string | null` - ID of card being edited

**Features:**

- Drag-and-drop card reordering
- Card creation and deletion
- Card editing modal
- Empty state message

---

##### `handleDragEnd(event: DragEndEvent)`

**Purpose:** Handles drag-and-drop reordering.

**Parameters:**

- `event: DragEndEvent` - dnd-kit drag event

**Side Effects:** Reorders cards and notifies parent

---

##### `handleCreateNewPlan()`

**Purpose:** Triggers new plan creation.

**Side Effects:** Calls parent's create new plan callback

---

##### `SortableCard(props)`

**Purpose:** Draggable card component for a plan.

**Parameters:**

- `card: PlannerCard` - Plan card data
- `onRemove: (id: string) => void` - Remove callback
- `onEdit: (card: PlannerCard) => void` - Edit callback
- `onToggleFinished: () => void` - Toggle finished status callback

**Features:**

- Sortable/draggable
- Finished state toggle
- Edit and delete buttons
- Display tags, location, time

---

##### `handleFinishedToggle(e: React.MouseEvent)`

**Purpose:** Toggles finished status of a card.

**Parameters:**

- `e: React.MouseEvent` - Click event

**Side Effects:** Prevents event propagation, calls toggle callback

---

##### `EditModal(props)`

**Purpose:** Modal for editing plan card details.

**Parameters:**

- `card: PlannerCard` - Card to edit
- `onClose: () => void` - Close modal callback
- `onSave: (card: PlannerCard) => void` - Save callback
- `onLocationPicked?: (position: LatLng) => void` - Location picked callback

**State:**

- `data: PlannerCard` - Edited card data
- `tagInput: string` - Current tag input
- `isPickingLocation: boolean` - Location picking mode
- `selectedLocation: LatLng | undefined` - Selected location

**Features:**

- Title and description editing
- Color picker
- Tag management
- Location picker with map
- Start time picker
- Finished status toggle

---

##### `formatDateTimeLocal(timestamp: number)`

**Purpose:** Converts timestamp to datetime-local input format.

**Parameters:**

- `timestamp: number` - Unix timestamp

**Returns:** `string` - Formatted datetime string (YYYY-MM-DDTHH:mm)

---

##### `parseDateTimeLocal(value: string)`

**Purpose:** Converts datetime-local input to timestamp.

**Parameters:**

- `value: string` - Datetime-local formatted string

**Returns:** `number` - Unix timestamp

---

##### `addTag()`

**Purpose:** Adds tag to current card.

**Side Effects:** Updates card tags if valid and unique

---

##### `removeTag(tag: string)`

**Purpose:** Removes tag from current card.

**Parameters:**

- `tag: string` - Tag to remove

**Side Effects:** Filters out specified tag

---

##### `handleLocationPick()`

**Purpose:** Enables location picking mode.

**Side Effects:** Sets `isPickingLocation` to true

---

##### `handleConfirmLocation()`

**Purpose:** Confirms selected location.

**Side Effects:**

- Updates card position
- Calls location picked callback
- Disables picking mode

---

##### `handleMapClick(position: LatLng)`

**Purpose:** Handles map click during location picking.

**Parameters:**

- `position: LatLng` - Clicked position

**Side Effects:** Updates selected location

---

##### `LocationPickerMap(props)`

**Purpose:** Embedded map component for location picking.

**Parameters:**

- `onLocationSelected: (position: LatLng) => void` - Location selected callback
- `initialPosition?: LatLng` - Initial map center

**State:**

- `cursorPosition: LatLng | null` - Current cursor position
- `searchQuery: string` - Search input value

**Features:**

- Interactive map
- Location search
- Cursor position display
- Click to select location

---

##### `handleSearch(e: React.FormEvent)`

**Purpose:** Searches for location using Nominatim API.

**Parameters:**

- `e: React.FormEvent` - Form submit event

**Side Effects:**

- Prevents default form submission
- Fetches geocoding results
- Selects first result

---

#### `app/navigation/SavedRoutesScreen.tsx`

##### `SavedRoutesScreen(props)`

**Purpose:** Screen for managing saved routes.

**Parameters:**

- `initialRoutes?: SavedRoute[]` - Initial routes array
- `onRoutesChange?: (routes: SavedRoute[]) => void` - Routes change callback
- `onImportToPlanner?: (route: SavedRoute) => void` - Import callback

**State:**

- `routes: SavedRoute[]` - Current routes
- `isCreating: boolean` - Creation modal visibility
- `newRouteName: string` - New route name input
- `editingRouteId: string | null` - ID of route being edited

**Features:**

- Route listing
- Route creation
- Route editing
- Route deletion
- Import to planner

---

##### `createRoute()`

**Purpose:** Creates a new empty route.

**Side Effects:**

- Generates new route with unique ID
- Adds to routes array
- Closes creation modal
- Notifies parent

---

##### `updateRoute(id: string, updates: Partial<SavedRoute>)`

**Purpose:** Updates existing route.

**Parameters:**

- `id: string` - Route ID
- `updates: Partial<SavedRoute>` - Fields to update

**Side Effects:**

- Merges updates into route
- Notifies parent
- Closes edit modal

---

### 5. Search & Location

#### `app/navigation/SearchBox.tsx`

##### `SearchBox(props)`

**Purpose:** Location search component with autocomplete.

**Parameters:**

- `onLocationSelect?: (location: {lat, lng, name}) => void` - Location select callback
- `onSearchResultsChange?: (results: SearchResultMarker[]) => void` - Results change callback

**State:**

- `query: string` - Search query
- `results: SearchResult[]` - Search results
- `isLoading: boolean` - Loading state
- `showResults: boolean` - Results dropdown visibility

**Features:**

- Debounced search (500ms)
- Nominatim API integration
- Results dropdown
- Click outside to close
- Loading indicator

---

##### `searchLocation(searchQuery: string)`

**Purpose:** Searches for locations using OpenStreetMap Nominatim API.

**Parameters:**

- `searchQuery: string` - Location query

**Side Effects:**

- Fetches search results
- Updates results state
- Calls results change callback

**API:** Nominatim OpenStreetMap API

---

##### `handleResultClick(result: SearchResult)`

**Purpose:** Handles clicking a search result.

**Parameters:**

- `result: SearchResult` - Selected result

**Side Effects:**

- Calls location select callback
- Updates query to location name
- Hides results dropdown

---

### 6. Dashboard & Stats

#### `app/navigation/DashboardScreen.tsx`

##### `DashboardScreen(props)`

**Purpose:** Dashboard overview screen.

**Parameters:**

- `planCards?: Array<{...}>` - Current plan cards
- `savedRoutes?: Array<{...}>` - Saved routes
- `onNavigate?: (tab: string) => void` - Navigation callback

**Features:**

- Statistics display
- Recent plans list
- Quick action buttons

---

##### `stats (useMemo)`

**Purpose:** Calculates statistics from data.

**Returns:** Array of stat objects with:

- `icon: React.ReactNode` - Stat icon
- `label: string` - Stat label
- `value: string` - Stat value
- `color: string` - Color theme

**Calculations:**

- Total saved routes count
- Active plans count
- Total distance (from routes)
- Total time spent (from routes)

---

### 7. Chat & AI Assistant

#### `app/navigation/chat.tsx`

##### `ChatBox()`

**Purpose:** AI assistant chatbot component.

**State:**

- `showDetail: boolean` - Chat expanded/collapsed
- `messageList: Message[]` - Chat messages
- `inputMessage: string` - Current input
- `isLoading: boolean` - API loading state
- `showClearConfirm: boolean` - Clear confirmation modal

**Features:**

- Collapsible chat interface
- Message history
- Loading states
- Clear messages functionality
- Auto-scroll to bottom

---

##### `BotMessage({ message })`

**Purpose:** Display bot message component.

**Parameters:**

- `message: string` - Message content

**Returns:** Styled bot message bubble

---

##### `UserMessage({ message })`

**Purpose:** Display user message component.

**Parameters:**

- `message: string` - Message content

**Returns:** Styled user message bubble

---

##### `LoadingMessage()`

**Purpose:** Loading indicator for bot response.

**Returns:** Animated loading message bubble

---

##### `APICallMessage(query: string)`

**Purpose:** Simulates AI API call.

**Parameters:**

- `query: string` - User question

**Returns:** `Promise<Message>` - Bot response message

**Current Implementation:** 3-second delay simulation

---

##### `handleUserMessage(message: string)`

**Purpose:** Handles sending user message.

**Parameters:**

- `message: string` - User's message

**Side Effects:**

- Adds user message to list
- Shows loading state
- Calls API
- Adds bot response

---

##### `clearMessages()`

**Purpose:** Shows clear confirmation modal.

**Side Effects:** Sets `showClearConfirm` to true

---

##### `confirmClear()`

**Purpose:** Confirms and clears all messages.

**Side Effects:**

- Clears message list
- Closes confirmation modal

---

##### `cancelClear()`

**Purpose:** Cancels message clearing.

**Side Effects:** Closes confirmation modal

---

### 8. Settings & Preferences

#### `app/navigation/SettingsScreen.tsx`

##### `SettingsScreen()`

**Purpose:** Settings and account management screen.

**State:**

- `theme: string` - Theme preference (currently unused)
- `notifications: boolean` - Notification preference (currently unused)
- `mapLabels: boolean` - Map labels preference (currently unused)

**Features:**

- Account email display
- Password management
- Account deletion (danger zone)
- Theme settings (commented out)
- Notification settings (commented out)
- Map settings (commented out)

---

### 9. Notifications

#### `app/navigation/NotificationContext.tsx`

##### `NotificationProvider({ children })`

**Purpose:** Context provider for notification system.

**Parameters:**

- `children: React.ReactNode` - Child components

**State:**

- `notifications: Notification[]` - Active notifications

**Context Value:**

- `notifications: Notification[]` - Current notifications
- `addNotification: (notification) => void` - Add notification
- `removeNotification: (id: string) => void` - Remove notification
- `clearNotifications: () => void` - Clear all notifications

**Features:**

- Auto-dismiss after duration
- Multiple notification types
- Notification display component

---

##### `addNotification(notification: Omit<Notification, "id">)`

**Purpose:** Adds a new notification.

**Parameters:**

- `notification: Omit<Notification, "id">` - Notification data without ID

**Side Effects:**

- Generates unique ID
- Adds to notifications array
- Sets auto-dismiss timer if duration provided

---

##### `removeNotification(id: string)`

**Purpose:** Removes a notification by ID.

**Parameters:**

- `id: string` - Notification ID

**Side Effects:** Filters out notification from array

---

##### `clearNotifications()`

**Purpose:** Removes all notifications.

**Side Effects:** Clears notifications array

---

##### `useNotification()`

**Purpose:** Hook to access notification context.

**Returns:** `NotificationContextType`

**Throws:** Error if used outside NotificationProvider

---

##### `NotificationDisplay()`

**Purpose:** Renders notification toasts.

**Features:**

- Fixed bottom-right position
- Type-based styling (success, error, info, warning)
- Dismiss buttons
- Clear all button
- Slide-in animation

---

### 10. Info & Popups

#### `app/navigation/InfoBox.tsx`

##### `LocationInfoBox(props)`

**Purpose:** Display detailed information about a location.

**Parameters:**

- `location: LocationDisplayInfo | null` - Location data
- `onClose: () => void` - Close callback

**Returns:** Info card or null if no location

**Features:**

- Image header
- Rating display
- Action buttons (Add to Favorite, Directions)
- Opening hours
- Distance information
- Description
- Photo gallery preview

---

#### `app/navigation/popup.tsx`

##### `PositivePopup()`

**Purpose:** Suggested challenge popup component.

**Returns:** Popup card with challenge information

**Features:**

- "Suggested" badge
- Challenge title and description
- Accept button
- Close button

**Note:** Currently positioned absolutely, needs dynamic positioning

---

### 11. UI Components

#### `components/ui/button.tsx`

##### `Button(props)`

**Purpose:** Reusable button component with variants.

**Parameters:**

- `className?: string` - Additional classes
- `variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"` - Style variant
- `size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"` - Size variant
- `asChild?: boolean` - Render as child component (Slot)
- `...props` - Standard button props

**Returns:** Styled button element

**Variants:**

- `default` - Primary button
- `destructive` - Danger/delete button
- `outline` - Outlined button
- `secondary` - Secondary style
- `ghost` - Transparent button
- `link` - Link-styled button

**Sizes:**

- `default` - h-9 px-4 py-2
- `sm` - h-8 (small)
- `lg` - h-10 (large)
- `icon` - size-9 (square)
- `icon-sm` - size-8
- `icon-lg` - size-10

---

## Utilities

### `lib/utils.ts`

##### `cn(...inputs: ClassValue[])`

**Purpose:** Merges Tailwind CSS classes intelligently.

**Parameters:**

- `...inputs: ClassValue[]` - Class names or objects

**Returns:** `string` - Merged class string

**Uses:**

- `clsx` - For conditional class handling
- `twMerge` - For Tailwind-specific merging

**Example:**

```typescript
cn("text-red-500", "text-blue-500") // "text-blue-500"
cn("p-4", { "bg-red": isError }) // "p-4 bg-red" if isError
```

---

### `src/utils/getContrastColor.tsx`

##### `getContrastColor(hexColor: string | undefined)`

**Purpose:** Determines text color (black/white) for contrast against background.

**Parameters:**

- `hexColor: string | undefined` - Background hex color

**Returns:** `string` - Tailwind class ("text-white" or "text-black")

**Algorithm:**

1. Converts hex to RGB
2. Calculates YIQ ratio (luminance)
3. Returns class based on brightness threshold (128)

**Example:**

```typescript
getContrastColor("#000000") // "text-white"
getContrastColor("#FFFFFF") // "text-black"
```

---

### `src/utils/isScrollable.tsx`

##### `isScrollable(scrollTop: number, scrollHeight: number, clientHeight: number)`

**Purpose:** Determines if element has remaining scroll space.

**Parameters:**

- `scrollTop: number` - Current scroll position
- `scrollHeight: number` - Total scrollable height
- `clientHeight: number` - Visible height

**Returns:** `boolean` - True if more content below

**Use Case:** Infinite scroll, load more indicators

---

## Data Types & Interfaces

### Core Types

#### `PlannerCard`

```typescript
interface PlannerCard {
  id: string;                    // Unique identifier
  title: string;                 // Plan title
  description: string;           // Plan description
  priority: "low" | "medium" | "high"; // Priority level
  color: string;                 // Hex color for marker/display
  tags: string[];                // Associated tags
  position?: LatLng;             // Map coordinates
  finished?: boolean;            // Completion status
  startTime?: number;            // Planned start timestamp
  createdAt?: number;            // Creation timestamp
}
```

---

#### `SavedRoute`

```typescript
interface SavedRoute {
  id: string;                    // Unique identifier
  name: string;                  // Route name
  distance: string;              // Total distance (e.g., "5.2 km")
  duration: string;              // Total duration (e.g., "45 min")
  waypointsList: Plan[];         // List of waypoints/plans
  color: string;                 // Route color
  createdAt: string;             // Creation date string
}
```

---

#### `Plan`

```typescript
interface Plan {
  id: string;                    // Unique identifier
  title: string;                 // Waypoint title
  description: string;           // Waypoint description
  location?: [number, number];   // [lat, lng] coordinates
  color: string;                 // Marker color
  finished?: boolean;            // Completion status
  startTime?: number;            // Start timestamp
  createdAt?: number;            // Creation timestamp
}
```

---

#### `SearchResult` (Nominatim API)

```typescript
interface SearchResult {
  place_id: number;              // OpenStreetMap place ID
  display_name: string;          // Full location name
  lat: string;                   // Latitude (string)
  lon: string;                   // Longitude (string)
  type: string;                  // Location type
  icon?: string;                 // Optional icon URL
}
```

---

#### `SearchResultMarker`

```typescript
interface SearchResultMarker {
  place_id: number;              // OpenStreetMap place ID
  display_name: string;          // Full location name
  lat: number;                   // Latitude (number)
  lng: number;                   // Longitude (number)
  type: string;                  // Location type
}
```

---

#### `Message` (Chat)

```typescript
interface Message {
  id: string;                    // Unique message ID
  content: string;               // Message text
  type: string;                  // "Question" or "Answer"
}
```

---

#### `Notification`

```typescript
interface Notification {
  id: string;                    // Unique notification ID
  message: string;               // Notification text
  type: "success" | "error" | "info" | "warning"; // Type
  duration?: number;             // Auto-dismiss duration (ms)
}
```

---

#### `LocationDisplayInfo`

```typescript
interface LocationDisplayInfo {
  id: string | number;           // Location ID
  name: string;                  // Location name
  imagePath: string;             // Image URL/path
  description: string;           // Location description
  gallery: string[];             // Gallery image URLs
}
```

---

## Configuration

### Fonts

- **Geist Sans** - Primary sans-serif font
- **Geist Mono** - Monospace font
- **Inter** - Alternative sans-serif
- **Roboto** - Alternative sans-serif
- **Roboto Condensed** - Condensed variant

### Map Configuration

- **Default Center:** [10.7725, 106.6980] (Ho Chi Minh City)
- **Default Zoom:** 14
- **Tiles:** CartoDB Dark Mode
- **Icons:** Custom SVG markers with color customization

### Color Palette

- **Primary (Emerald):** #10b981
- **Accent (Green):** #00D26A
- **Background:** #0f1110, #1a1a1a, #1e1e1e
- **Text:** White, gray variations

### API Integrations

- **Nominatim (OpenStreetMap):** Geocoding and location search
  - Endpoint: `https://nominatim.openstreetmap.org/search`
  - Format: JSON
  - Rate limit: Respect usage policy

---

## Key Features Summary

### Map Features

- Interactive Leaflet-based map
- Custom colored markers for plans
- User location tracking
- Location search with autocomplete
- Multiple map layers (dark mode)
- Zoom and pan controls
- Click-to-select location picker

### Route Management

- Create and save multiple routes
- Import routes into planner
- Drag-and-drop plan reordering
- Plan completion tracking
- Time scheduling for plans
- Location assignment to plans
- Tag-based organization
- Color-coded plans and routes

### Search & Discovery

- Real-time location search
- Debounced search (500ms)
- Search result markers on map
- Location details display
- Distance and timing information

### User Interface

- Dark theme throughout
- Responsive design
- Collapsible panels
- Modal dialogs
- Toast notifications
- Loading states
- Empty states

### AI Assistant

- Chat interface
- Message history
- Loading indicators
- Clear chat functionality
- Context-aware responses (planned)

---

## Development Notes

### Performance Optimizations

1. **Marker Caching:** `markerCache` prevents recreating identical markers
2. **Debounced Search:** 500ms delay reduces API calls
3. **useMemo for Stats:** Calculations only on data change
4. **Dynamic Imports:** Map component loaded with Next.js dynamic import (SSR disabled)

### State Management

- React Context for notifications
- Local state for component-specific data
- Prop drilling for shared state (consider Redux/Zustand for scaling)

### Code Quality

- TypeScript for type safety
- ESLint configuration
- Tailwind CSS for styling
- Component modularity

### Future Improvements

1. Backend integration for persistent storage
2. Real AI chatbot integration
3. Route optimization algorithms
4. Social features (sharing routes)
5. Offline mode support
6. Mobile app version
7. Multi-language support
8. Advanced filtering and sorting
9. Export routes to GPX/KML
10. Integration with navigation apps

---

## Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Dependencies

- next
- react
- react-dom
- leaflet
- react-leaflet
- @dnd-kit/core
- @dnd-kit/sortable
- uuidv7
- tailwindcss
- typescript

---

## File Structure Summary

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   └── navigation/
│       ├── page.tsx            # Main app page
│       ├── map.tsx             # Map component
│       ├── chat.tsx            # Chat component
│       ├── DashboardScreen.tsx # Dashboard
│       ├── SearchBox.tsx       # Search component
│       ├── RouteViewer.tsx     # Route viewer
│       ├── SavedRoutesScreen.tsx # Saved routes
│       ├── SettingsScreen.tsx  # Settings
│       ├── InfoBox.tsx         # Location info
│       ├── MapMarkers.tsx      # Marker utilities
│       ├── NotificationContext.tsx # Notifications
│       └── popup.tsx           # Popup component
├── components/ui/
│   └── button.tsx              # Button component
├── lib/
│   └── utils.ts                # Utility functions
└── src/utils/
    ├── getContrastColor.tsx    # Color utility
    └── isScrollable.tsx        # Scroll utility
```

---

## Support & Contact

For questions or issues regarding this project, please contact the development team.

**Last Updated:** December 26, 2025
**Version:** 1.0.0
**Framework:** Next.js 14+
**License:** (Specify your license)
