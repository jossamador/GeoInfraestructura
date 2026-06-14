import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polygon, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LocationRecord, ZoneRecord, InfrastructureRecord } from "../api";
import "leaflet-draw";

const defaultCenter: [number, number] = [19.4326, -99.1332];

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const infrastructureIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "infra-marker"
});

L.Marker.prototype.options.icon = icon;

type DraftLocation = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

type Props = {
  locations: LocationRecord[];
  infrastructures: InfrastructureRecord[];
  zones: ZoneRecord[];
  draftLocation: DraftLocation | null;
  onDraftLocationChange: (next: DraftLocation | null) => void;
  onSaveDraftLocation: () => void;
  onUpdateLocation: (id: string, data: { name: string; description: string; longitude: number; latitude: number }) => void;
  onDeleteLocation: (id: string) => void;
  onDeleteZone: (id: string) => void;
  onZoneDraft: (points: Array<{ lat: number; lng: number }>) => void;
};

const MapClickHandler = ({
  onMapClick,
  isDrawing
}: {
  onMapClick: (lat: number, lng: number) => void;
  isDrawing: boolean;
}) => {
  useMapEvents({
    click(event) {
      if (isDrawing) {
        return;
      }
      onMapClick(event.latlng.lat, event.latlng.lng);
    }
  });

  return null;
};

const DrawController = ({
  onZoneDraft,
  onDrawingStateChange
}: {
  onZoneDraft: (points: Array<{ lat: number; lng: number }>) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems
      },
      draw: {
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        rectangle: false
      }
    });

    const handleCreated = (event: L.LeafletEvent) => {
      const created = event as L.DrawEvents.Created;

      if (created.layerType === "polygon") {
        const polygon = created.layer as L.Polygon;
        const latLngs = polygon.getLatLngs()[0] as Array<{ lat: number; lng: number }>;
        onZoneDraft(latLngs.map(point => ({ lat: point.lat, lng: point.lng })));
      }

      onDrawingStateChange(false);

      drawnItems.addLayer(created.layer);
    };

    const handleDrawStart = () => {
      onDrawingStateChange(true);
    };

    const handleDrawStop = () => {
      onDrawingStateChange(false);
    };

    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DRAWSTART, handleDrawStart);
    map.on(L.Draw.Event.DRAWSTOP, handleDrawStop);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DRAWSTART, handleDrawStart);
      map.off(L.Draw.Event.DRAWSTOP, handleDrawStop);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      onDrawingStateChange(false);
    };
  }, [map, onZoneDraft, onDrawingStateChange]);

  return null;
};

const PopupEditor = ({
  location,
  onSave,
  onDelete
}: {
  location: LocationRecord;
  onSave: (data: { name: string; description: string; longitude: number; latitude: number }) => void;
  onDelete: () => void;
}) => {
  const [name, setName] = useState(location.name);
  const [description, setDescription] = useState(location.description);

  useEffect(() => {
    setName(location.name);
    setDescription(location.description);
  }, [location.name, location.description]);

  return (
    <div className="popup-card">
      <label>
        Nombre
        <input value={name} onChange={event => setName(event.target.value)} />
      </label>
      <label>
        Descripción
        <textarea value={description} onChange={event => setDescription(event.target.value)} />
      </label>
      <div className="popup-actions">
        <button onClick={() => onSave({ name, description, longitude: location.longitude, latitude: location.latitude })}>Guardar</button>
        <button className="danger" onClick={onDelete}>Eliminar</button>
      </div>
    </div>
  );
};

const DraftLocationPopup = ({
  draftLocation,
  onSave,
  onCancel,
  onChange
}: {
  draftLocation: DraftLocation;
  onSave: () => void;
  onCancel: () => void;
  onChange: (next: DraftLocation) => void;
}) => {
  return (
    <div className="popup-card">
      <label>
        Nombre
        <input value={draftLocation.name} onChange={event => onChange({ ...draftLocation, name: event.target.value })} />
      </label>
      <label>
        Descripción
        <textarea value={draftLocation.description} onChange={event => onChange({ ...draftLocation, description: event.target.value })} />
      </label>
      <div className="popup-actions">
        <button onClick={onSave}>Guardar punto</button>
        <button className="ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

export const MapEditor = ({
  locations,
  infrastructures,
  zones,
  draftLocation,
  onDraftLocationChange,
  onSaveDraftLocation,
  onUpdateLocation,
  onDeleteLocation,
  onDeleteZone,
  onZoneDraft
}: Props) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = mapboxToken
    ? "Map data &copy; OpenStreetMap contributors, Imagery © Mapbox"
    : "&copy; OpenStreetMap contributors";

  const polygonLayers = useMemo(() => zones.map(zone => zone.points.map(point => [point.lat, point.lng] as [number, number])), [zones]);

  return (
    <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom className="map-shell">
      <TileLayer url={tileUrl} attribution={attribution} />
      <MapClickHandler isDrawing={isDrawing} onMapClick={(latitude, longitude) => onDraftLocationChange({ name: "", description: "", latitude, longitude })} />
      <DrawController onZoneDraft={onZoneDraft} onDrawingStateChange={setIsDrawing} />

      {locations.map(location => (
        <Marker key={location._id} position={[location.latitude, location.longitude]}>
          <Popup>
            <PopupEditor
              location={location}
              onSave={data => onUpdateLocation(location._id, data)}
              onDelete={() => onDeleteLocation(location._id)}
            />
          </Popup>
        </Marker>
      ))}

      {draftLocation && (
        <Marker position={[draftLocation.latitude, draftLocation.longitude]}>
          <Popup>
            <DraftLocationPopup
              draftLocation={draftLocation}
              onChange={onDraftLocationChange}
              onSave={onSaveDraftLocation}
              onCancel={() => onDraftLocationChange(null)}
            />
          </Popup>
        </Marker>
      )}

      {infrastructures.map(infra => {
        const locationName = infra.location && typeof infra.location === "object" ? (infra.location as LocationRecord).name : "Ubicacion desconocida";
        return (
          <Marker key={`infra-${infra._id}`} position={[infra.location && typeof infra.location === "object" ? (infra.location as LocationRecord).latitude : 19.4326, infra.location && typeof infra.location === "object" ? (infra.location as LocationRecord).longitude : -99.1332]} icon={infrastructureIcon}>
            <Popup>
              <div className="popup-card">
                <strong>🏗️ {infra.name}</strong>
                <p>{infra.description}</p>
                <small>{infra.category} · {infra.condition}</small>
                <small>Ubicacion: {locationName}</small>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {zones.map((zone, index) => (
        <Polygon key={zone._id} positions={polygonLayers[index]} pathOptions={{ color: "#0ea5e9", fillOpacity: 0.2 }}>
          <Popup>
            <div className="popup-card">
              <strong>{zone.name}</strong>
              <p>{zone.description}</p>
              <button className="danger" onClick={() => onDeleteZone(zone._id)}>Eliminar zona</button>
            </div>
          </Popup>
        </Polygon>
      ))}
    </MapContainer>
  );
};
