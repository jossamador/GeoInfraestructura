import { Link } from "react-router-dom";

export const AnalyticsPage = () => {
  return (
    <main className="analytics-view shell">
      <section className="analytics-hero">
        <p className="eyebrow">Vista adicional</p>
        <h1>Centro Analitico de Riesgo Hidrometeorologico</h1>
        <p>Esta vista prioriza decisiones operativas para Proteccion Civil combinando reportes ciudadanos, estado de infraestructura y zonas trazadas.</p>
      </section>

      <section className="analytics-grid-alt">
        <article>
          <span>Riesgo inmediato</span>
          <strong>Zonas urbanas bajas</strong>
          <p>Concentran mas eventos de inundacion y fallas de drenaje.</p>
        </article>
        <article>
          <span>Infraestructura critica</span>
          <strong>Puentes y drenajes</strong>
          <p>Elementos con condicion warning/critical para intervencion prioritaria.</p>
        </article>
        <article>
          <span>Seguimiento</span>
          <strong>Reportes abiertos</strong>
          <p>Casos no resueltos que requieren atencion de cuadrillas.</p>
        </article>
      </section>

      <section className="analytics-timeline panel">
        <h2>Ruta recomendada de respuesta</h2>
        <div className="timeline-row">
          <div>
            <strong>1. Detectar</strong>
            <p>Validar nuevos reportes georreferenciados y su severidad.</p>
          </div>
          <div>
            <strong>2. Cruce espacial</strong>
            <p>Relacionar reportes con infraestructura cercana y zonas trazadas.</p>
          </div>
          <div>
            <strong>3. Priorizar</strong>
            <p>Atender primero puntos criticos con mayor impacto economico y social.</p>
          </div>
        </div>
      </section>

      <Link to="/dashboard" className="primary-link analytics-back-link">Volver al tablero</Link>
    </main>
  );
};
