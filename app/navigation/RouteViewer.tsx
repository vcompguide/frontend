import React from "react";
import { Sdk } from "@/src/backend/RESTful/BackendRESTfulSDK";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LatLng } from "leaflet";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaLocationArrow,
  FaPlus,
  FaRedo,
  FaRoute,
  FaSpinner,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi";

const LeafletMap = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0f1110] animate-pulse" />,
});

export interface PlannerCard {
  id: string;
  title: string;
  description: string;
  color: string;
  tags: string[];
  position?: LatLng;
  finished?: boolean;
}

interface RouteViewerProps {
  isOpen: boolean;
  onToggle: () => void;
  onPickLocation?: (callback: (position: LatLng) => void) => void;
  onCardsChange?: (cards: PlannerCard[]) => void;
  initialCards?: PlannerCard[];
  activeRouteName?: string;
  onCreateNewRoute?: () => void;
  onCreateNewPlan?: () => void;
  userLocation?: LatLng | null;
  onAddUserLocationPlan?: () => void;
  segmentDistances?: { [key: string]: number };
  onClearPath?: () => void;
}

export function RouteViewer({
  isOpen,
  onToggle,
  onCardsChange,
  initialCards = [],
  activeRouteName,
  onCreateNewRoute,
  onCreateNewPlan,
  onPickLocation,
  userLocation,
  onAddUserLocationPlan,
  segmentDistances = {},
  onClearPath,
}: RouteViewerProps) {
  const [cards, setCards] = useState<PlannerCard[]>(initialCards);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showClearWarning, setShowClearWarning] = useState(false);
  const [cardHeights, setCardHeights] = useState<{ [key: string]: number }>({});
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setCards(initialCards);

    // Clear path when route is unloaded or has < 2 positioned cards
    const cardsWithPosition = initialCards.filter(card => card.position);
    if (cardsWithPosition.length < 2) {
      onClearPath?.();
    }
  }, [initialCards, onClearPath]);

  // Measure card heights whenever cards or their content changes
  useEffect(() => {
    const measureHeights = () => {
      const heights: { [key: string]: number } = {};
      cards.forEach((card) => {
        const element = cardRefs.current[card.id];
        if (element) {
          heights[card.id] = element.offsetHeight;
        }
      });
      setCardHeights(heights);
    };

    // Measure immediately
    measureHeights();

    // Also measure after a short delay to catch any async rendering
    const timer = setTimeout(measureHeights, 100);
    return () => clearTimeout(timer);
  }, [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((item) => item.id === active.id);
      const newIndex = cards.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(cards, oldIndex, newIndex);
      setCards(newOrder);
      onCardsChange?.(newOrder);

      // Check if we need to clear path
      const positionedCards = newOrder.filter(card => card.position);
      if (positionedCards.length < 2) {
        onClearPath?.();
      }
    }
  };

  const handleCreateNewPlan = () => {
    if (onCreateNewPlan) {
      onCreateNewPlan();
    }
  };

  const handleClearAll = () => {
    setCards([]);
    onCardsChange?.([]);
    onClearPath?.();
    setShowClearWarning(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-30 bg-emerald-500 text-white p-3 rounded-r-lg transition-all duration-300 ${isOpen ? "left-80" : "left-0"}`}
      >
        {isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
      </button>

      <aside
        className={`fixed left-0 top-0 h-screen w-80 bg-[#1e1e1e]/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">Route Viewer</h2>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onCreateNewRoute?.()}
                  className="bg-blue-500 hover:bg-blue-600 p-2 rounded-lg text-white transition"
                  title="Create New Route"
                >
                  <FaRoute size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewPlan}
                  className="bg-emerald-500 hover:bg-emerald-600 p-2 rounded-lg text-white transition"
                  title="Create New Plan"
                >
                  <FaPlus size={14} />
                </button>
                <button
                  type="button"
                  onClick={onAddUserLocationPlan}
                  disabled={!userLocation}
                  className="bg-blue-400 hover:bg-blue-500 p-2 rounded-lg text-white transition disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title={userLocation ? "Add My Location as Plan" : "Location not available"}
                >
                  <FaLocationArrow size={14} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <p className="text-xs text-emerald-400 font-medium">
              {activeRouteName || "Import a route to begin"}
            </p>

            {cards.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearWarning(true)}
                className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg text-red-400 hover:text-red-300 transition border border-red-500/30"
                title="Clear All Plans"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    No plans yet. Create one to get started!
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateNewPlan}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto transition"
                  >
                    <FaPlus size={16} /> Create New Plan
                  </button>
                </div>
              </div>
            ) : (
              <SortableContext
                items={cards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {cards.map((card, index) => {
                  // Find the previous located plan (may not be immediately before)
                  let prevLocatedIndex = -1;
                  for (let i = index - 1; i >= 0; i--) {
                    if (cards[i].position) {
                      prevLocatedIndex = i;
                      break;
                    }
                  }

                  // Check if this is the first located plan
                  let isFirstLocatedPlan = false;
                  if (card.position) {
                    isFirstLocatedPlan = !cards.slice(0, index).some(c => c.position);
                  }

                  // Calculate the number of cards between previous located and current
                  const cardsBetween = prevLocatedIndex >= 0 ? index - prevLocatedIndex - 1 : 0;

                  // Calculate total height from previous located card's center to current card's center
                  let totalHeight = 0;
                  if (prevLocatedIndex >= 0) {
                    // Full height of cards in between (including gaps)
                    for (let i = prevLocatedIndex + 1; i < index; i++) {
                      const height = cardHeights[cards[i].id] || 80;
                      totalHeight += height;
                      // Add gap spacing (space-y-3 = 0.75rem = 12px)
                      totalHeight += 12;
                    }

                    // Half of previous card (from its center to its bottom)
                    const prevHeight = cardHeights[cards[prevLocatedIndex].id] || 80;
                    totalHeight += prevHeight / 2;
                    
                    // Add gap after previous card
                    totalHeight += 12;
                    
                    // Add half of current card (from its top to its center)
                    const currentHeight = cardHeights[card.id] || 80;
                    totalHeight += currentHeight / 2;
                  }

                  return (
                    <div 
                      key={card.id} 
                      className="relative"
                      ref={(el) => { cardRefs.current[card.id] = el; }}
                    >
                      {/* Distance indicator between consecutive located cards - skip for first located plan */}
                      {prevLocatedIndex >= 0 && card.position && !isFirstLocatedPlan && (
                        <div
                          className="absolute pointer-events-none"
                          style={{
                            left: '15px',
                            top: `calc(50% - ${totalHeight}px)`,
                            width: '1px',
                            height: `${totalHeight}px`,
                            transform: 'translateX(-50%)'
                          }}
                        >
                          {/* Connecting dashed line spanning from previous circle to current circle */}
                          <div
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              borderLeft: '2px dashed rgb(16 185 129 / 0.4)'
                            }}
                          />

                          {/* Distance label - centered on the line */}
                          <div
                            className="bg-emerald-500/10 border border-emerald-500/30 rounded px-2 py-0.5 pointer-events-auto"
                            style={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <span className="text-[10px] text-emerald-400 font-medium whitespace-nowrap">
                              {(() => {
                                const segmentKey = `${cards[prevLocatedIndex].id}-${card.id}`;
                                const distanceMeters = segmentDistances[segmentKey];
                                if (distanceMeters !== undefined) {
                                  const km = (distanceMeters / 1000).toFixed(1);
                                  return `${km} km`;
                                }
                                return '—';
                              })()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Card with circle indicator */}
                      <div className="relative">
                        {/* Circle indicator for cards with location - separated from card */}
                        {card.position && (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500 z-10" />
                        )}

                        <div className="ml-12">
                          <SortableCard
                            card={card}
                            onRemove={() => {
                              const updated = cards.filter((c) => c.id !== card.id);
                              setCards(updated);
                              onCardsChange?.(updated);

                              // Check if we need to clear path
                              const positionedCards = updated.filter(c => c.position);
                              if (positionedCards.length < 2) {
                                onClearPath?.();
                              }
                            }}
                            onEdit={() => setEditingCardId(card.id)}
                            onHeightChange={() => {
                              // Trigger remeasurement when card height changes
                              const element = cardRefs.current[card.id];
                              if (element) {
                                setCardHeights(prev => ({
                                  ...prev,
                                  [card.id]: element.offsetHeight
                                }));
                              }
                            }}
                            onToggleFinished={() => {
                              const updated = cards.map((c) =>
                                c.id === card.id ? { ...c, finished: !c.finished } : c,
                              );
                              setCards(updated);
                              onCardsChange?.(updated);

                              // Check if we need to clear path
                              const positionedCards = updated.filter(c => c.position);
                              if (positionedCards.length < 2) {
                                onClearPath?.();
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </SortableContext>
            )}
          </div>
        </DndContext>
      </aside>

      {editingCardId && (
        <EditModal
          card={cards.find((c) => c.id === editingCardId) as (typeof cards)[0]}
          onClose={() => setEditingCardId(null)}
          onSave={(updated) => {
            console.log("Saving card with data:", updated);
            const list = cards.map((c) => (c.id === updated.id ? updated : c));
            setCards(list);
            onCardsChange?.(list);

            // Check if we need to clear path
            const positionedCards = list.filter(c => c.position);
            if (positionedCards.length < 2) {
              onClearPath?.();
            }

            setEditingCardId(null);
          }}
          onLocationPicked={(position) => {
            const list = cards.map((c) =>
              c.id === editingCardId ? { ...c, position } : c,
            );
            setCards(list);
            onCardsChange?.(list);

            // Check if we need to clear path
            const positionedCards = list.filter(c => c.position);
            if (positionedCards.length < 2) {
              onClearPath?.();
            }
          }}
        />
      )}

      {/* Clear All Warning Modal */}
      {showClearWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] rounded-2xl border border-red-500/30 p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <FaTrash className="text-red-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Clear All Plans?
                </h2>
                <p className="text-sm text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to remove all{" "}
              <span className="font-bold text-white">{cards.length}</span> plan
              {cards.length !== 1 ? "s" : ""} from this route? This will
              permanently delete all plan data including locations,
              descriptions, and schedules.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearWarning(false)}
                className="flex-1 bg-gray-700/30 hover:bg-gray-700/50 text-white py-3 rounded-lg font-medium transition border border-gray-600/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
              >
                <FaTrash size={14} /> Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const SortableCard = React.forwardRef<HTMLDivElement, {
  card: PlannerCard;
  onRemove: (id: string) => void;
  onEdit: (card: PlannerCard) => void;
  onToggleFinished: () => void;
  onHeightChange?: () => void;
}>(function SortableCard({
  card,
  onRemove,
  onEdit,
  onToggleFinished,
  onHeightChange,
}, ref) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [showDescription, setShowDescription] = useState(false);

  const handleFinishedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFinished();
  };

  const handleDescriptionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDescription(!showDescription);
    // Trigger height remeasurement after state update
    setTimeout(() => {
      onHeightChange?.();
    }, 0);
  };

  return (
    <div ref={ref} className={`transition-all ${card.finished ? "brightness-60" : ""}`}>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`px-4 py-2 border ${card.position ? "rounded-t-xl" : "rounded-xl"}`}
        style={{
          ...style,
          borderColor: `${card.color}40`,
          backgroundColor: `${card.color}10`,
        }}
      >
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 flex-1">
            <h3
              className={`text-sm font-bold text-white ${card.finished ? "line-through text-gray-500" : ""}`}
            >
              {card.title}
            </h3>
            {card.description && (
              <button
                type="button"
                onClick={handleDescriptionToggle}
                className="text-gray-400 hover:text-white transition"
                title={showDescription ? "Hide description" : "Show description"}
              >
                <FaChevronDown
                  size={10}
                  className={`transition-transform ${showDescription ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFinishedToggle}
              className={`text-sm px-2 py-1 rounded transition ${card.finished ? "bg-green-500/30 text-green-400" : "bg-gray-700/30 text-gray-400 hover:bg-gray-600/30"}`}
              title="Toggle finished"
            >
              {card.finished ? "✓" : "○"}
            </button>
            <button
              type="button"
              onClick={() => onEdit(card)}
              className="text-gray-400 hover:text-white"
            >
              <FaEdit size={12} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(card.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
        {showDescription && card.description && (
          <p className="text-xs text-gray-300 mb-2 mt-1 whitespace-pre-wrap">
            {card.description}
          </p>
        )}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {card.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {/* {card.position && (
            <span className="text-[10px] text-emerald-400">
              📍 Location Set
            </span>
          )} */}
        </div>
      </div>

      {/* Weather Display for Plans with Location */}
      {card.position && (
        <WeatherDisplay
          position={card.position}
          cardColor={card.color}
          planName={card.title}
          onHeightChange={onHeightChange}
        />
      )}
    </div>
  );
});

function EditModal({
  card,
  onClose,
  onSave,
  onLocationPicked,
}: {
  card: PlannerCard;
  onClose: () => void;
  onSave: (card: PlannerCard) => void;
  onLocationPicked?: (position: LatLng) => void;
}) {
  const [data, setData] = useState(card);
  const [tagInput, setTagInput] = useState("");
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | undefined>(
    card.position,
  );
  const [showNotification, setShowNotification] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("EditModal received card:", card);
    setData(card);
    setSelectedLocation(card.position);
  }, [card]);

  // Handle keyboard shortcuts for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the event originated from an input/textarea
      const target = e.target as HTMLElement;
      const isFromInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      // If Escape is pressed from an input, don't close the modal
      if (e.key === "Escape" && isFromInput) {
        return;
      }

      // Check if any input/textarea is currently focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement;

      if (!isInputFocused) {
        if (e.key === "Enter") {
          e.preventDefault();
          onSave(data);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [data, onSave, onClose]);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (selectedLocation && isPickingLocation) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation, isPickingLocation]);

  // Helper function to format timestamp to datetime-local input format
  const formatDateTimeLocal = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to parse datetime-local input to timestamp
  const parseDateTimeLocal = (value: string): number => {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-");
    const [hours, minutes] = timePart.split(":");
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
    ).getTime();
  };

  const COLOR_OPTIONS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setData({ ...data, tags: [...data.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setData({ ...data, tags: data.tags.filter((t: string) => t !== tag) });
  };

  const handleLocationPick = () => {
    setIsPickingLocation(true);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setData({ ...data, position: selectedLocation });
      onLocationPicked?.(selectedLocation);
    }
    setIsPickingLocation(false);
  };

  const handleMapClick = (position: LatLng) => {
    setSelectedLocation(position);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className={`bg-[#1e1e1e] rounded-2xl border border-white/10 flex transition-all duration-300 h-3/4 ${isPickingLocation ? "w-[80vw]" : "w-96"}`}
      >
        {/* Main Form */}
        <div className={`overflow-y-auto p-6 flex flex-col transition-all duration-300 ${isPickingLocation ? "w-96" : "w-full"}`}>
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Edit Plan</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Title Input */}
          <input
            className="w-full bg-[#2a2a2a] p-3 rounded-lg mb-4 text-white text-sm"
            placeholder="Plan title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                descriptionRef.current?.focus();
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                return;
              }
            }}
          />

          {/* Description Input */}
          <textarea
            ref={descriptionRef}
            className="w-full bg-[#2a2a2a] p-3 rounded-lg mb-4 text-white text-sm resize-none"
            placeholder="Plan description"
            rows={3}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                return;
              }
            }}
          />

          {/* Color Selection */}
          <div className="mb-4">
            <label
              htmlFor="plan-color"
              className="text-xs text-gray-400 mb-2 block"
            >
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setData({ ...data, color })}
                  className={`h-8 rounded-lg transition ${data.color === color ? "ring-2 ring-white" : ""}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label
              htmlFor="plan-tags"
              className="text-xs text-gray-400 mb-2 block"
            >
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 bg-[#2a2a2a] p-2 rounded-lg text-white text-sm"
                placeholder="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    addTag();
                    return;
                  }

                  if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    return;
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-emerald-500/20 text-emerald-400 px-3 rounded-lg text-sm"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag: string) => (
                <div
                  key={tag}
                  className="bg-white/10 text-white text-xs px-2 py-1 rounded flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Finished Toggle */}
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setData({ ...data, finished: !data.finished })}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${data.finished
                ? "bg-green-500/30 text-green-400 border border-green-500/50"
                : "bg-gray-700/30 text-gray-400 border border-gray-700/50 hover:bg-gray-600/30"
                }`}
            >
              {data.finished ? "✓ Completed" : "○ Pending"}
            </button>
            {!data.finished ?
              <span className="text-xs text-gray-400">Mark as complete</span> : <span className="text-xs text-gray-400"> Mark as pending </span>}
          </div>

          {/* Location Button */}
          <button
            type="button"
            onClick={handleLocationPick}
            className="w-full bg-blue-500/20 text-blue-400 py-3 rounded-lg mb-6 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition"
          >
            📍 {data.position ? "Change Location" : "Pick Location"}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => onSave(data)}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm hover:bg-emerald-600 transition"
          >
            Save Changes
          </button>
        </div>

        {/* Map Side Panel */}
        {isPickingLocation && (
          <div className="flex-1 bg-[#0f1110] rounded-r-2xl overflow-hidden flex flex-col transition-all duration-300">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Select Location</h3>
              <button
                type="button"
                onClick={() => setIsPickingLocation(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="flex-1 relative">
              <LocationPickerMap
                onLocationSelected={handleMapClick}
                initialPosition={selectedLocation}
              />
              {selectedLocation && (
                <div className={`absolute top-20  right-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 z-4000 text-right w-fit h-fit transition-opacity duration-500 ${showNotification ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="text-xs font-medium text-emerald-400">
                    ✓ Location Selected
                  </p>
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 z-400">
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={!selectedLocation}
                  className="flex-1 bg-emerald-500 disabled:bg-gray-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-emerald-600 transition"
                >
                  Confirm Location
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(undefined);
                    setIsPickingLocation(false);
                  }}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  location_name?: string;
}

function WeatherDisplay({
  position,
  cardColor,
  planName,
  onHeightChange,
}: {
  position: LatLng;
  cardColor: string;
  planName: string;
  onHeightChange?: () => void;
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      if (!API_KEY || true) {
        console.warn("Weather API key not configured, using mock data");
        // Return mock weather data
        setWeather({
          temp: Math.round(20 + Math.random() * 15),
          feels_like: Math.round(18 + Math.random() * 15),
          humidity: Math.round(40 + Math.random() * 40),
          description: ["clear sky", "few clouds", "scattered clouds", "partly cloudy"][Math.floor(Math.random() * 4)],
          icon: "01d",
          wind_speed: Math.round((2 + Math.random() * 8) * 10) / 10,
          location_name: planName,
        });
        setIsLoading(false);
        return;
      }

      const api = new Sdk({
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
        securityWorker: async () => ({
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY}`,
          },
        }),
      });

      const response = await api.weather.weatherControllerGetCurrentWeather({
        latitude: position.lat,
        longitude: position.lng,
        locationName: planName,
      });
      
      const data = response.data;
      console.log("Fetched weather data:", data);
      setWeather({
        temp: Math.round(data.current.temperature),
        feels_like: Math.round(data.current.feelsLike),
        humidity: data.current.humidity,
        description: data.current.description,
        icon: data.current.icon,
        wind_speed: data.current.windSpeed,
        location_name: data.location.name,
      });
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  }, [position, planName]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return (
    <div
      className="px-4 pb-4 pt-3 rounded-b-xl border-t"
      style={{
        backgroundColor: `${cardColor}08`,
        borderColor: `${cardColor}40`,
        borderWidth: "1px 1px 1px 1px",
        borderTopWidth: "2px",
      }}
    >
      <div className={`flex items-center justify-between ${isCollapsed ? "-mb-2" : "mb-1"}`}>
        <button
          type="button"
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            // Trigger height recalculation after state updates
            if (onHeightChange) {
              setTimeout(() => onHeightChange(), 0);
            }
          }}
          className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition"
          style={{ color: cardColor }}
        >
          <span className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
          ☁️ Weather at {planName}
        </button>
        <button
          type="button"
          onClick={fetchWeather}
          disabled={isLoading}
          className="hover:opacity-70 disabled:opacity-30 transition"
          style={{ color: cardColor }}
          title="Reload weather"
        >
          <FaRedo size={10} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {isLoading && (
            <div className="flex items-center justify-center py-3">
              <FaSpinner className="animate-spin text-emerald-500" size={16} />
            </div>
          )}

          {error && <div className="text-xs text-red-400 py-2">{error}</div>}

          {weather && !isLoading && !error && (
            <div className="space-y-2">
              {weather.location_name && (
                <p className="text-xs font-medium text-gray-300">
                  {weather.location_name}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Image
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.description}
                  width={40}
                  height={40}
                  className="w-10 h-10"
                  unoptimized
                />
                <div className="flex-1">
                  <p className="text-xl font-bold text-white">{weather.temp}°C</p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {weather.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <div
                  className="rounded p-1.5"
                  style={{ backgroundColor: `${cardColor}15` }}
                >
                  <div className="flex items-center gap-0.5 text-gray-400 text-[9px] mb-0.5">
                    <WiThermometer size={12} />
                    <span>Feels</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white">
                    {weather.feels_like}°C
                  </p>
                </div>
                <div
                  className="rounded p-1.5"
                  style={{ backgroundColor: `${cardColor}15` }}
                >
                  <div className="flex items-center gap-0.5 text-gray-400 text-[9px] mb-0.5">
                    <WiHumidity size={12} />
                    <span>Humid</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white">
                    {weather.humidity}%
                  </p>
                </div>
                <div
                  className="rounded p-1.5"
                  style={{ backgroundColor: `${cardColor}15` }}
                >
                  <div className="flex items-center gap-0.5 text-gray-400 text-[9px] mb-0.5">
                    <WiStrongWind size={12} />
                    <span>Wind</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white">
                    {weather.wind_speed}m/s
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LocationPickerMap({
  onLocationSelected,
  initialPosition,
}: {
  onLocationSelected: (position: LatLng) => void;
  initialPosition?: LatLng;
}) {
  const [selectedMarker, setSelectedMarker] = useState<LatLng | undefined>(initialPosition);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocationClick = (position: LatLng) => {
    setSelectedMarker(position);
    onLocationSelected(position);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const api = new Sdk({
        baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:9000",
        securityWorker: async () => ({
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LOCAL_AUTHENTICATION_KEY || "taylorswefts"}`,
          },
        }),
      });

      const response = await api.map.mapControllerSearchPlace({
        q: searchQuery,
        limit: 1,
      });

      if (response.data.data.length > 0) {
        const result = response.data.data[0];
        const position = new (require("leaflet").LatLng)(
          result.lat,
          result.lng,
        );
        handleLocationClick(position);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="w-full h-full relative">
      <LeafletMap
        isPickingCardLocation={true}
        onCardLocationPicked={handleLocationClick}
        planCards={
          selectedMarker
            ? [
              {
                id: "selected-location",
                title: "Selected Location",
                description: "",
                position: selectedMarker,
                color: "#10b981",
                tags: [],
              },
            ]
            : []
        }
        initialCenter={
          initialPosition
            ? ([initialPosition.lat, initialPosition.lng] as [number, number])
            : [10.7725, 106.698]
        }
      />
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-4 right-4 z-500"
      >
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900/95 border border-gray-700 rounded-lg p-3 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
        />
      </form>
    </div>
  );
}
