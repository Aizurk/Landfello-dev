import { useState, type MouseEvent } from "react";
import { Crosshair, MapPin, Pencil, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ACCRA = { lat: 5.6037, lng: -0.187 };

export interface BoundaryPoint {
  lat: number;
  lng: number;
}

export interface MapPlaceholderValue {
  lat: number;
  lng: number;
  hideExactLocation: boolean;
  boundaryPoints: BoundaryPoint[];
}

export interface MapPlaceholderProps {
  lat: number;
  lng: number;
  hideExactLocation: boolean;
  boundaryPoints: BoundaryPoint[];
  onChange: (patch: Partial<MapPlaceholderValue>) => void;
  className?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function MapPlaceholder({
  lat,
  lng,
  hideExactLocation,
  boundaryPoints,
  onChange,
  className,
}: MapPlaceholderProps) {
  const [search, setSearch] = useState("");
  const [dropPin, setDropPin] = useState(true);
  const [satellite, setSatellite] = useState(false);
  const [drawBoundary, setDrawBoundary] = useState(false);

  const handleMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!dropPin && !drawBoundary) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Relative offset from center (±0.05° ≈ ~5km near Accra)
    const nextLat = clamp(lat + (0.5 - y) * 0.1, -90, 90);
    const nextLng = clamp(lng + (x - 0.5) * 0.1, -180, 180);

    if (drawBoundary) {
      onChange({
        boundaryPoints: [...boundaryPoints, { lat: nextLat, lng: nextLng }],
      });
      return;
    }

    onChange({ lat: nextLat, lng: nextLng });
  };

  return (
    <div
      className={cn(
        "space-y-4 rounded-3xl border border-emerald-900/10 bg-white p-4 sm:p-5",
        className
      )}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-emerald-950" htmlFor="map-search">
          Search location
        </label>
        <Input
          id="map-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search area, landmark, or address…"
          className="rounded-2xl"
        />
        {search.trim() ? (
          <p className="text-xs text-emerald-950/55">
            Showing results near “{search.trim()}” (demo map — pin stays interactive).
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={() => onChange({ lat: ACCRA.lat, lng: ACCRA.lng })}
        >
          <Crosshair className="mr-2 h-4 w-4" />
          Use current location
        </Button>
        <Button
          type="button"
          variant={dropPin ? "default" : "outline"}
          className="rounded-2xl"
          onClick={() => {
            setDropPin((v) => !v);
            if (!dropPin) setDrawBoundary(false);
          }}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Drop pin
        </Button>
        <Button
          type="button"
          variant={satellite ? "default" : "outline"}
          className="rounded-2xl"
          onClick={() => setSatellite((v) => !v)}
        >
          <Satellite className="mr-2 h-4 w-4" />
          Satellite
        </Button>
        <Button
          type="button"
          variant={drawBoundary ? "default" : "outline"}
          className="rounded-2xl"
          onClick={() => {
            setDrawBoundary((v) => !v);
            if (!drawBoundary) setDropPin(false);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Draw boundary
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-emerald-950/70" htmlFor="map-lat">
            Latitude
          </label>
          <Input
            id="map-lat"
            type="number"
            step="any"
            value={Number.isFinite(lat) ? lat : ""}
            onChange={(e) => onChange({ lat: Number(e.target.value) })}
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-emerald-950/70" htmlFor="map-lng">
            Longitude
          </label>
          <Input
            id="map-lng"
            type="number"
            step="any"
            value={Number.isFinite(lng) ? lng : ""}
            onChange={(e) => onChange({ lng: Number(e.target.value) })}
            className="rounded-2xl"
          />
        </div>
      </div>

      <div
        role="application"
        aria-label="Map placeholder"
        onClick={handleMapClick}
        className={cn(
          "relative h-56 w-full cursor-crosshair overflow-hidden rounded-3xl ring-1 ring-emerald-900/10 sm:h-72",
          satellite
            ? "bg-[radial-gradient(circle_at_30%_20%,#4a5d3a_0%,#2f3d28_35%,#1a2618_70%,#0f1810_100%)]"
            : "bg-[linear-gradient(135deg,#d4c4a8_0%,#b8a07a_25%,#8f9a6e_50%,#6b8f71_75%,#4a7c59_100%)]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[18%] top-[22%] h-16 w-24 rounded-full bg-emerald-900/20 blur-xl" />
          <div className="absolute bottom-[18%] right-[14%] h-20 w-28 rounded-full bg-amber-900/25 blur-2xl" />
          <div className="absolute left-1/2 top-1/3 h-px w-2/3 -translate-x-1/2 bg-white/25" />
          <div className="absolute left-1/3 top-1/4 h-2/3 w-px bg-white/20" />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin
            className={cn(
              "h-8 w-8 drop-shadow-md",
              hideExactLocation ? "text-emerald-900/40" : "text-emerald-950"
            )}
            fill="currentColor"
          />
        </div>

        {boundaryPoints.map((point, index) => {
          const x = 50 + ((point.lng - lng) / 0.1) * 100;
          const y = 50 - ((point.lat - lat) / 0.1) * 100;
          return (
            <span
              key={`${point.lat}-${point.lng}-${index}`}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 ring-2 ring-white"
              style={{
                left: `${clamp(x, 4, 96)}%`,
                top: `${clamp(y, 4, 96)}%`,
              }}
            />
          );
        })}

        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-emerald-950 shadow-sm">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-emerald-950/60">
          Boundary points:{" "}
          <span className="font-semibold text-emerald-950">{boundaryPoints.length}</span>
          {drawBoundary ? " — tap the map to add points" : null}
        </p>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-950">
          <Checkbox
            checked={hideExactLocation}
            onCheckedChange={(checked) =>
              onChange({ hideExactLocation: checked === true })
            }
          />
          Hide exact location publicly
        </label>
      </div>
    </div>
  );
}
