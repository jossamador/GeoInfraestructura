import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { api, clearToken, type InfrastructureRecord, type LocationRecord, type ReportRecord, type ZoneRecord } from "../api";
import { DEMO_TOKEN, useAuth } from "../auth";
import { MapEditor } from "../components/MapEditor";
import { Link, useNavigate } from "react-router-dom";

const demoLocations: LocationRecord[] = [
  {
    _id: "demo-loc-1",
    name: "Bajo puente central",
    description: "Zona con acumulacion recurrente de agua",
    latitude: 19.4326,
    longitude: -99.1332
  },
  {
    _id: "demo-loc-2",
    name: "Drenaje norte",
    description: "Infraestructura con mantenimiento pendiente",
    latitude: 19.4392,
    longitude: -99.1458
  }
];

const demoReports: ReportRecord[] = [
  {
    _id: "demo-report-1",
    title: "Inundacion vehicular",
    description: "El agua cubre parcialmente dos carriles durante tormentas fuertes.",
    severity: "high",
    category: "inundacion",
    status: "open",
    location: demoLocations[0],
    reporter: { id: "demo-user", name: "Invitado Demo", email: "demo@geolluvias.local", role: "viewer" }
  }
];

const demoInfrastructures: InfrastructureRecord[] = [
  {
    _id: "demo-infra-1",
    name: "Colector pluvial A-12",
    category: "drenaje",
    condition: "warning",
    description: "Tramo con azolve identificado por Proteccion Civil.",
    owner: "Servicios Urbanos",
    location: demoLocations[1]
  }
];

const demoZones: ZoneRecord[] = [
  {
    _id: "demo-zone-1",
    name: "Poligono de inundacion historica",
    description: "Area que concentra reportes al inicio de la temporada de lluvias.",
    points: [
      { lat: 19.437, lng: -99.149 },
      { lat: 19.4395, lng: -99.142 },
      { lat: 19.4335, lng: -99.1395 },
      { lat: 19.4305, lng: -99.1465 }
    ]
  }
];

type DraftLocation = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

type DraftZone = {
  name: string;
  description: string;
  points: Array<{ lat: number; lng: number }>;
};

const emptyReport = {
  title: "",
  description: "",
  severity: "medium" as ReportRecord["severity"],
  category: "inundacion",
  location: ""
};

const emptyInfrastructure = {
  name: "",
  category: "drenaje",
  condition: "warning",
  description: "",
  location: "",
  owner: "Proteccion Civil"
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const isDemoMode = token === DEMO_TOKEN;
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [infrastructures, setInfrastructures] = useState<InfrastructureRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [draftLocation, setDraftLocation] = useState<DraftLocation | null>(null);
  const [draftZone, setDraftZone] = useState<DraftZone | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchResult, setSearchResult] = useState<LocationRecord | null>(null);
  const [reportForm, setReportForm] = useState(emptyReport);
  const [reportEditId, setReportEditId] = useState<string | null>(null);
  const [infraForm, setInfraForm] = useState(emptyInfrastructure);
  const [infraEditId, setInfraEditId] = useState<string | null>(null);
  const [reportError, setReportError] = useState("");
  const [infraError, setInfraError] = useState("");
  const [zoneError, setZoneError] = useState("");
  const [tableError, setTableError] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingLocationDraft, setEditingLocationDraft] = useState({ name: "", description: "" });

  const refreshData = async () => {
    if (isDemoMode) {
      return;
    }

    const [locationsResponse, reportsResponse, infrastructuresResponse, zonesResponse] = await Promise.all([
      api.listLocations(),
      api.listReports(),
      api.listInfrastructures(),
      api.listZones()
    ]);

    setLocations(locationsResponse.locations);
    setReports(reportsResponse.reports);
    setInfrastructures(infrastructuresResponse.infrastructures);
    setZones(zonesResponse.zones);
  };

  useEffect(() => {
    if (isDemoMode) {
      setLocations(demoLocations);
      setReports(demoReports);
      setInfrastructures(demoInfrastructures);
      setZones(demoZones);
      return;
    }

    void refreshData();

    const socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000");
    socket.on("locations:changed", () => void api.listLocations().then(response => setLocations(response.locations)));

    return () => {
      socket.disconnect();
    };
  }, [isDemoMode]);

  const stats = useMemo(
    () => ({
      locations: locations.length,
      reports: reports.length,
      infrastructures: infrastructures.length,
      zones: zones.length
    }),
    [locations, reports, infrastructures, zones]
  );

  const applyDemoLocationUpdate = (id: string, data: { name: string; description: string; longitude: number; latitude: number }) => {
    const nextLocation: LocationRecord = {
      _id: id,
      name: data.name,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude
    };

    setLocations(current => current.map(location => location._id === id ? nextLocation : location));
    setReports(current => current.map(report => report.location?._id === id ? { ...report, location: nextLocation } : report));
    setInfrastructures(current => current.map(item => item.location?._id === id ? { ...item, location: nextLocation } : item));
  };

  const saveDraftLocation = async () => {
    if (!draftLocation) return;

    if (isDemoMode) {
      setLocations(current => [
        ...current,
        {
          _id: `demo-loc-${Date.now()}`,
          name: draftLocation.name || `Punto ${current.length + 1}`,
          description: draftLocation.description || "Ubicacion demo creada sin servidor",
          latitude: draftLocation.latitude,
          longitude: draftLocation.longitude
        }
      ]);
      setDraftLocation(null);
      return;
    }

    await api.createLocation({
      name: draftLocation.name || `Punto ${locations.length + 1}`,
      description: draftLocation.description || "Ubicacion reportada por el ciudadano",
      latitude: draftLocation.latitude,
      longitude: draftLocation.longitude
    });

    setDraftLocation(null);
    await refreshData();
  };

  const saveDraftZone = async () => {
    if (!draftZone) return;

    setZoneError("");

    if (!draftZone.name.trim() || !draftZone.description.trim()) {
      setZoneError("Agrega nombre y descripcion para guardar la zona.");
      return;
    }

    if (isDemoMode) {
      setZones(current => [
        ...current,
        {
          _id: `demo-zone-${Date.now()}`,
          name: draftZone.name.trim(),
          description: draftZone.description.trim(),
          points: draftZone.points
        }
      ]);
      setDraftZone(null);
      return;
    }

    try {
      await api.createZone({
        ...draftZone,
        name: draftZone.name.trim(),
        description: draftZone.description.trim()
      });
      setDraftZone(null);
      await refreshData();
    } catch (error) {
      setZoneError(error instanceof Error ? error.message : "No se pudo guardar la zona.");
    }
  };

  const cancelDraftZone = () => {
    setZoneError("");
    setDraftZone(null);
  };

  const removeZone = async (zoneId: string) => {
    setZoneError("");

    if (isDemoMode) {
      setZones(current => current.filter(zone => zone._id !== zoneId));
      return;
    }

    try {
      await api.deleteZone(zoneId);
      await refreshData();
    } catch (error) {
      setZoneError(error instanceof Error ? error.message : "No se pudo eliminar la zona.");
    }
  };

  const submitReport = async () => {
    setReportError("");

    if (!locations.length) {
      setReportError("Primero debes registrar al menos una ubicacion en el mapa.");
      return;
    }

    if (!reportForm.location) {
      setReportError("Selecciona una ubicacion para el reporte.");
      return;
    }

    if (isDemoMode) {
      const selectedLocation = locations.find(location => location._id === reportForm.location);

      if (!selectedLocation) {
        setReportError("La ubicacion demo seleccionada ya no existe.");
        return;
      }

      if (reportEditId) {
        setReports(current => current.map(report => report._id === reportEditId
          ? { ...report, ...reportForm, location: selectedLocation }
          : report));
      } else {
        setReports(current => [
          {
            _id: `demo-report-${Date.now()}`,
            title: reportForm.title,
            description: reportForm.description,
            severity: reportForm.severity,
            category: reportForm.category,
            status: "open",
            location: selectedLocation,
            reporter: user ?? { id: "demo-user", name: "Invitado Demo", email: "demo@geolluvias.local", role: "viewer" }
          },
          ...current
        ]);
      }

      setReportForm(emptyReport);
      setReportEditId(null);
      return;
    }

    try {
      if (reportEditId) {
        await api.updateReport(reportEditId, reportForm);
      } else {
        await api.createReport(reportForm);
      }

      setReportForm(emptyReport);
      setReportEditId(null);
      await refreshData();
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "No se pudo guardar el reporte.");
    }
  };

  const editReport = (report: ReportRecord) => {
    setReportEditId(report._id);
    setReportForm({
      title: report.title,
      description: report.description,
      severity: report.severity,
      category: report.category,
      location: report.location?._id ?? ""
    });
  };

  const submitInfrastructure = async () => {
    setInfraError("");

    if (!locations.length) {
      setInfraError("Primero debes registrar al menos una ubicacion en el mapa.");
      return;
    }

    if (!infraForm.location) {
      setInfraError("Selecciona una ubicacion para la infraestructura.");
      return;
    }

    if (isDemoMode) {
      const selectedLocation = locations.find(location => location._id === infraForm.location);

      if (!selectedLocation) {
        setInfraError("La ubicacion demo seleccionada ya no existe.");
        return;
      }

      if (infraEditId) {
        setInfrastructures(current => current.map(item => item._id === infraEditId
          ? { ...item, ...infraForm, location: selectedLocation }
          : item));
      } else {
        setInfrastructures(current => [
          {
            _id: `demo-infra-${Date.now()}`,
            name: infraForm.name,
            category: infraForm.category,
            condition: infraForm.condition,
            description: infraForm.description,
            owner: infraForm.owner,
            location: selectedLocation
          },
          ...current
        ]);
      }

      setInfraForm(emptyInfrastructure);
      setInfraEditId(null);
      return;
    }

    try {
      if (infraEditId) {
        await api.updateInfrastructure(infraEditId, infraForm);
      } else {
        await api.createInfrastructure(infraForm);
      }

      setInfraForm(emptyInfrastructure);
      setInfraEditId(null);
      await refreshData();
    } catch (error) {
      setInfraError(error instanceof Error ? error.message : "No se pudo guardar la infraestructura.");
    }
  };

  const editInfrastructure = (item: InfrastructureRecord) => {
    setInfraEditId(item._id);
    setInfraForm({
      name: item.name,
      category: item.category,
      condition: item.condition,
      description: item.description,
      location: item.location?._id ?? "",
      owner: item.owner
    });
  };

  const searchLocation = async () => {
    if (!searchName.trim()) return;

    if (isDemoMode) {
      const found = locations.find(location => location.name.toLowerCase().includes(searchName.trim().toLowerCase()));
      setSearchResult(found ?? null);
      return;
    }

    try {
      const result = await api.searchLocation(searchName.trim());
      setSearchResult(result.location);
    } catch {
      setSearchResult(null);
    }
  };

  const startEditLocation = (location: LocationRecord) => {
    setTableError("");
    setEditingLocationId(location._id);
    setEditingLocationDraft({ name: location.name, description: location.description });
  };

  const cancelEditLocation = () => {
    setEditingLocationId(null);
    setEditingLocationDraft({ name: "", description: "" });
  };

  const saveLocationFromTable = async (location: LocationRecord) => {
    setTableError("");

    if (!editingLocationDraft.name.trim() || !editingLocationDraft.description.trim()) {
      setTableError("Nombre y descripcion son obligatorios para editar la ubicacion.");
      return;
    }

    if (isDemoMode) {
      applyDemoLocationUpdate(location._id, {
        name: editingLocationDraft.name.trim(),
        description: editingLocationDraft.description.trim(),
        latitude: location.latitude,
        longitude: location.longitude
      });
      cancelEditLocation();
      return;
    }

    try {
      await api.updateLocation(location._id, {
        name: editingLocationDraft.name.trim(),
        description: editingLocationDraft.description.trim()
      });
      cancelEditLocation();
      await refreshData();
    } catch (error) {
      setTableError(error instanceof Error ? error.message : "No se pudo editar la ubicacion.");
    }
  };

  const deleteLocationFromTable = async (id: string) => {
    setTableError("");

    if (isDemoMode) {
      setLocations(current => current.filter(location => location._id !== id));
      setReports(current => current.filter(report => report.location?._id !== id));
      setInfrastructures(current => current.filter(item => item.location?._id !== id));
      if (editingLocationId === id) {
        cancelEditLocation();
      }
      return;
    }

    try {
      await api.deleteLocation(id);
      if (editingLocationId === id) {
        cancelEditLocation();
      }
      await refreshData();
    } catch (error) {
      setTableError(error instanceof Error ? error.message : "No se pudo eliminar la ubicacion.");
    }
  };

  const logoutAndLeave = () => {
    logout();
    clearToken();
    navigate("/auth");
  };

  return (
    <main className="dashboard-shell shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Proteccion Civil / Medio ambiente</p>
          <h2>GeoLluvias</h2>
        </div>
        <div className="topbar-actions">
          <span className="user-chip">{user?.name}</span>
          <Link className="topbar-link" to="/analytics">Analitica</Link>
          <button onClick={logoutAndLeave}>Salir</button>
        </div>
      </header>

      <section className="stats-grid">
        <article><strong>{stats.locations}</strong><span>Ubicaciones</span></article>
        <article><strong>{stats.reports}</strong><span>Reportes</span></article>
        <article><strong>{stats.infrastructures}</strong><span>Infraestructura</span></article>
        <article><strong>{stats.zones}</strong><span>Zonas trazadas</span></article>
      </section>

      {isDemoMode && (
        <section className="demo-banner panel">
          <strong>Modo demo activo</strong>
          <p>Estas viendo datos locales de ejemplo porque GitHub Pages no tiene backend. El mapa, la tabla y las vistas siguen siendo navegables.</p>
        </section>
      )}

      <section className="content-grid">
        <div className="main-column">
          <div className="panel map-panel">
            <div className="panel-head">
              <div>
                <h3>Mapa interactivo</h3>
                <p>Haz clic para crear un punto exacto o dibuja una zona para guardarla.</p>
              </div>
              <div className="search-row">
                <input value={searchName} onChange={event => setSearchName(event.target.value)} placeholder="Buscar por nombre" />
                <button onClick={searchLocation}>Buscar</button>
              </div>
            </div>

            {searchResult && (
              <div className="search-result">{searchResult.name} · {searchResult.description} · {searchResult.latitude.toFixed(4)}, {searchResult.longitude.toFixed(4)}</div>
            )}

            <MapEditor
              locations={locations}
              infrastructures={infrastructures}
              zones={zones}
              draftLocation={draftLocation}
              onDraftLocationChange={setDraftLocation}
              onSaveDraftLocation={saveDraftLocation}
              onUpdateLocation={async (id, data) => {
                if (isDemoMode) {
                  applyDemoLocationUpdate(id, data);
                  return;
                }
                await api.updateLocation(id, data);
                await refreshData();
              }}
              onDeleteLocation={async id => {
                if (isDemoMode) {
                  await deleteLocationFromTable(id);
                  return;
                }
                await api.deleteLocation(id);
                await refreshData();
              }}
              onDeleteZone={async id => {
                if (isDemoMode) {
                  await removeZone(id);
                  return;
                }
                await api.deleteZone(id);
                await refreshData();
              }}
              onZoneDraft={points => setDraftZone({ name: "", description: "", points })}
            />
          </div>

          <div className="panel form-panel">
            <h3>Trazado de zonas de riesgo</h3>
            <p>Usa el icono de poligono en el mapa para trazar una figura. Los puntos de conexion se guardan en MongoDB y la zona permanece hasta que la elimines.</p>

            {draftZone ? (
              <>
                <p><strong>Puntos detectados:</strong> {draftZone.points.length}</p>
                <label>
                  Nombre
                  <input value={draftZone.name} onChange={event => setDraftZone({ ...draftZone, name: event.target.value })} />
                </label>
                <label>
                  Descripcion
                  <textarea value={draftZone.description} onChange={event => setDraftZone({ ...draftZone, description: event.target.value })} />
                </label>
                <div className="row-actions">
                  <button className="primary" onClick={saveDraftZone}>Guardar zona</button>
                  <button className="ghost" onClick={cancelDraftZone}>Cancelar</button>
                </div>
              </>
            ) : (
              <p className="search-result">Traza un poligono en el mapa para crear una nueva zona.</p>
            )}

            {zoneError && <p className="error-text">{zoneError}</p>}

            <div className="record-list">
              {zones.map(zone => (
                <article key={zone._id}>
                  <div>
                    <strong>{zone.name}</strong>
                    <p>{zone.description}</p>
                    <small>{zone.points.length} puntos de conexion</small>
                  </div>
                  <div className="row-actions">
                    <button className="danger" onClick={() => void removeZone(zone._id)}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel form-panel">
            <h3>CRUD interno: reportes</h3>
            <div className="form-grid">
              <input placeholder="Titulo" value={reportForm.title} onChange={event => setReportForm({ ...reportForm, title: event.target.value })} />
              <input placeholder="Descripcion" value={reportForm.description} onChange={event => setReportForm({ ...reportForm, description: event.target.value })} />
              <select value={reportForm.severity} onChange={event => setReportForm({ ...reportForm, severity: event.target.value as ReportRecord["severity"] })}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Critica</option>
              </select>
              <select value={reportForm.category} onChange={event => setReportForm({ ...reportForm, category: event.target.value })}>
                <option value="inundacion">Inundacion</option>
                <option value="electrico">Electrico</option>
                <option value="estructural">Estructural</option>
                <option value="arboles">Arboles</option>
                <option value="otro">Otro</option>
              </select>
              <select value={reportForm.location} onChange={event => setReportForm({ ...reportForm, location: event.target.value })}>
                <option value="">Ubicacion</option>
                {locations.map(location => <option key={location._id} value={location._id}>{location.name}</option>)}
              </select>
            </div>
            {reportError && <p className="error-text">{reportError}</p>}
            <button className="primary" onClick={submitReport}>{reportEditId ? "Actualizar reporte" : "Crear reporte"}</button>
            <div className="record-list">
              {reports.map(report => (
                <article key={report._id}>
                  <div>
                    <strong>{report.title}</strong>
                    <p>{report.description}</p>
                    <small>{report.category} · {report.severity} · {report.location?.name ?? "Sin ubicacion"}</small>
                  </div>
                  <div className="row-actions">
                    <button onClick={() => editReport(report)}>Editar</button>
                    <button className="danger" onClick={async () => {
                      if (isDemoMode) {
                        setReports(current => current.filter(item => item._id !== report._id));
                        return;
                      }
                      await api.deleteReport(report._id);
                      await refreshData();
                    }}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel form-panel">
            <h3>CRUD interno: infraestructura</h3>
            <div className="form-grid">
              <input placeholder="Nombre" value={infraForm.name} onChange={event => setInfraForm({ ...infraForm, name: event.target.value })} />
              <input placeholder="Descripcion" value={infraForm.description} onChange={event => setInfraForm({ ...infraForm, description: event.target.value })} />
              <select value={infraForm.category} onChange={event => setInfraForm({ ...infraForm, category: event.target.value })}>
                <option value="drenaje">Drenaje</option>
                <option value="puente">Puente</option>
                <option value="poste">Poste</option>
                <option value="edificio">Edificio</option>
                <option value="carretera">Carretera</option>
                <option value="otro">Otro</option>
              </select>
              <select value={infraForm.condition} onChange={event => setInfraForm({ ...infraForm, condition: event.target.value })}>
                <option value="good">Bueno</option>
                <option value="warning">Alerta</option>
                <option value="critical">Critico</option>
              </select>
              <select value={infraForm.location} onChange={event => setInfraForm({ ...infraForm, location: event.target.value })}>
                <option value="">Ubicacion</option>
                {locations.map(location => <option key={location._id} value={location._id}>{location.name}</option>)}
              </select>
              <input placeholder="Responsable" value={infraForm.owner} onChange={event => setInfraForm({ ...infraForm, owner: event.target.value })} />
            </div>
            {infraError && <p className="error-text">{infraError}</p>}
            <button className="primary" onClick={submitInfrastructure}>{infraEditId ? "Actualizar infraestructura" : "Crear infraestructura"}</button>
            <div className="record-list">
              {infrastructures.map(item => (
                <article key={item._id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                    <small>{item.category} · {item.condition} · {item.location?.name ?? "Sin ubicacion"}</small>
                  </div>
                  <div className="row-actions">
                    <button onClick={() => editInfrastructure(item)}>Editar</button>
                    <button className="danger" onClick={async () => {
                      if (isDemoMode) {
                        setInfrastructures(current => current.filter(record => record._id !== item._id));
                        return;
                      }
                      await api.deleteInfrastructure(item._id);
                      await refreshData();
                    }}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="side-column">
          <div className="panel realtime-panel">
            <h3>Tabla en tiempo real</h3>
            {tableError && <p className="error-text">{tableError}</p>}
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Lat</th>
                    <th>Lng</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(location => {
                    const isEditing = editingLocationId === location._id;

                    return (
                      <tr key={location._id}>
                        <td>
                          {isEditing ? (
                            <input
                              className="table-inline-input"
                              value={editingLocationDraft.name}
                              onChange={event => setEditingLocationDraft({ ...editingLocationDraft, name: event.target.value })}
                            />
                          ) : (
                            location.name
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              className="table-inline-input"
                              value={editingLocationDraft.description}
                              onChange={event => setEditingLocationDraft({ ...editingLocationDraft, description: event.target.value })}
                            />
                          ) : (
                            location.description
                          )}
                        </td>
                        <td>{location.latitude.toFixed(4)}</td>
                        <td>{location.longitude.toFixed(4)}</td>
                        <td>
                          <div className="table-actions">
                            {isEditing ? (
                              <>
                                <button onClick={() => void saveLocationFromTable(location)}>Guardar</button>
                                <button className="ghost" onClick={cancelEditLocation}>Cancelar</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditLocation(location)}>Editar</button>
                                <button className="danger" onClick={() => void deleteLocationFromTable(location._id)}>Eliminar</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};
