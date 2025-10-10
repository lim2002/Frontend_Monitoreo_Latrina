import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature, { type FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { boundingExtent } from 'ol/extent';

type NotaSalidaResumen = {
  idSalidaProgramada: string;
  idNotaSalida: string;
  nroSalida: string;
  cliente: string;
  ordenPrioridadRuta: number | null;
  estadoEntrega: number | null;
  direccion: string;
  ubicacionEntrega: string;
};

type ProgramacionResumen = {
  id: string;
  fechaEntrega: string | null;
  estadoEntrega: number | null;
  vehiculoDescripcion: string;
  conductorNombre: string;
};

type RecorridoLocationState = {
  programacion?: ProgramacionResumen | null;
  notas?: NotaSalidaResumen[] | null;
};

type EntregaItem = {
  id: string;
  cliente: string;
  direccion: string;
  nroSalida: string;
  estadoEntrega: number | null;
  orden: number | null;
  lat: number | null;
  lon: number | null;
  ubicacionOriginal: string;
};

type EstadoNotaInfo = {
  label: string;
  pillClass: string;
  dotClass: string;
  pinColor: string;
};

const VEHICLE_LON_LAT: [number, number] = [-68.1193, -16.4897];

const sanitize = (value?: string | null): string => (value ?? '').trim();

const parseCoordinates = (value: string | null): { lat: number; lon: number } | null => {
  const trimmed = sanitize(value);
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(',');
  if (parts.length < 2) {
    return null;
  }
  const lat = Number(parts[0]?.trim());
  const lon = Number(parts[1]?.trim());
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }
  return { lat, lon };
};

const getNotaEstadoInfo = (estado: number | null): EstadoNotaInfo => {
  switch (estado) {
    case 1:
      return {
        label: 'No entregado',
        pillClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
        pinColor: '#facc15',
      };
    case 2:
      return {
        label: 'Entregado',
        pillClass: 'bg-green-50 text-green-700 border-green-200',
        dotClass: 'bg-green-500',
        pinColor: '#22c55e',
      };
    case 3:
      return {
        label: 'Atrasado',
        pillClass: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500',
        pinColor: '#ef4444',
      };
    default:
      return {
        label: 'Sin estado',
        pillClass: 'bg-gray-100 text-gray-600 border-gray-300',
        dotClass: 'bg-gray-400',
        pinColor: '#9ca3af',
      };
  }
};

const formatDateDisplay = (value: string | null): string => {
  if (!value) {
    return 'Sin fecha';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const buildPinSvg = (color: string) =>
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 32' width='24' height='32'><path fill='${color}' d='M12 0C6 0 1.5 4.5 1.5 10.5c0 6.5 7.6 15.2 9.8 17.6.4.5 1 .5 1.4 0 2.2-2.4 9.8-11.1 9.8-17.6C22.5 4.5 18 0 12 0z'/><circle cx='12' cy='10.5' r='4' fill='white'/></svg>`
  );

const buildTruckSvg = () =>
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 36' width='64' height='36'><rect x='2' y='8' width='36' height='16' rx='2' fill='%232563eb'/><rect x='38' y='12' width='16' height='12' rx='2' fill='%232563eb'/><rect x='40' y='14' width='6' height='6' fill='white'/><circle cx='16' cy='28' r='5' fill='%23333'/><circle cx='46' cy='28' r='5' fill='%23333'/></svg>"
  );

const RecorridoMapa = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { programacion, notas } = useMemo(() => {
    const state = (location.state ?? {}) as RecorridoLocationState;
    const notasLimpias = Array.isArray(state.notas)
      ? state.notas.filter((nota): nota is NotaSalidaResumen => Boolean(nota && typeof nota === 'object'))
      : [];
    return {
      programacion: state.programacion ?? null,
      notas: notasLimpias,
    };
  }, [location.state]);

  const entregas = useMemo<EntregaItem[]>(
    () =>
      notas.map((nota) => {
        const coords = parseCoordinates(nota.ubicacionEntrega);
        return {
          id: nota.idSalidaProgramada || nota.idNotaSalida,
          cliente: sanitize(nota.cliente) || 'Sin cliente',
          direccion: sanitize(nota.direccion) || 'Sin direccion',
          nroSalida: sanitize(nota.nroSalida) || '-',
          estadoEntrega: nota.estadoEntrega ?? null,
          orden: nota.ordenPrioridadRuta ?? null,
          lat: coords?.lat ?? null,
          lon: coords?.lon ?? null,
          ubicacionOriginal: sanitize(nota.ubicacionEntrega),
        };
      }),
    [notas]
  );

  const entregasConCoordenadas = useMemo(
    () => entregas.filter((entrega): entrega is EntregaItem & { lat: number; lon: number } => entrega.lat !== null && entrega.lon !== null),
    [entregas]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (entregas.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => (prev && entregas.some((entrega) => entrega.id === prev) ? prev : entregas[0].id));
  }, [entregas]);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const mapRef = useRef<Map | null>(null);
  const viewRef = useRef<View | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    vectorLayerRef.current?.changed();
  }, [selectedId]);

  useEffect(() => {
    if (!mapEl.current) {
      return;
    }

    const center = fromLonLat([VEHICLE_LON_LAT[0], VEHICLE_LON_LAT[1]]);
    const truckIconUrl = `data:image/svg+xml;charset=UTF-8,${buildTruckSvg()}`;

    let currentZoom = 13;

    const styleFn = (feature: FeatureLike) => {
      const tipo = (feature as any).get('tipo');
      const zoomFactor = Math.max(0.6, Math.min(2.2, 0.5 + (currentZoom - 10) * 0.25));

      if (tipo === 'vehiculo') {
        return new Style({ image: new Icon({ src: truckIconUrl, anchor: [0.5, 1], scale: 0.6 * zoomFactor }) });
      }

      const estado = (feature as any).get('estado') as number | null;
      const estadoInfo = getNotaEstadoInfo(estado);
      const isSelected = feature.getId() === selectedIdRef.current;
      const baseScale = 0.9 * zoomFactor * (isSelected ? 1.35 : 1);
      return new Style({ image: new Icon({ src: `data:image/svg+xml;charset=UTF-8,${buildPinSvg(estadoInfo.pinColor)}`, anchor: [0.5, 1], scale: baseScale }) });
    };

    const vehiculo = new Feature({ geometry: new Point(center), tipo: 'vehiculo' });
    vehiculo.setId('vehiculo');

    const vectorSource = new VectorSource({ features: [vehiculo] });
    vectorSourceRef.current = vectorSource;

    const vectorLayer = new VectorLayer({ source: vectorSource, style: styleFn });
    vectorLayerRef.current = vectorLayer;

    const view = new View({ center, zoom: currentZoom });
    viewRef.current = view;

    const map = new Map({ target: mapEl.current, layers: [new TileLayer({ source: new OSM() }), vectorLayer], view });
    mapRef.current = map;

    view.on('change:resolution', () => {
      currentZoom = view.getZoom() || currentZoom;
      vectorLayer.changed();
    });

    setTimeout(() => map.updateSize(), 120);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    const source = vectorSourceRef.current;
    if (!source) {
      return;
    }

    source.getFeatures().forEach((feature) => {
      if ((feature as any).get('tipo') === 'entrega') {
        source.removeFeature(feature);
      }
    });

    entregasConCoordenadas.forEach((entrega) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([entrega.lon as number, entrega.lat as number])),
        tipo: 'entrega',
        estado: entrega.estadoEntrega ?? null,
      });
      feature.setId(entrega.id);
      source.addFeature(feature);
    });

    if (entregasConCoordenadas.length > 0) {
      const coords = entregasConCoordenadas.map((entrega) => fromLonLat([entrega.lon as number, entrega.lat as number]));
      coords.push(fromLonLat([VEHICLE_LON_LAT[0], VEHICLE_LON_LAT[1]]));
      const extent = boundingExtent(coords);
      const view = viewRef.current;
      if (view) {
        view.fit(extent, { padding: [80, 80, 80, 80], duration: 600, maxZoom: 16 });
      }
    }

    vectorLayerRef.current?.changed();
  }, [entregasConCoordenadas]);

  useEffect(() => {
    const handleResize = () => mapRef.current?.updateSize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const flyToEntrega = (id: string) => {
    setSelectedId(id);
    const view = viewRef.current;
    const source = vectorSourceRef.current;
    if (!view || !source) {
      return;
    }
    const feature = source.getFeatureById(id) as Feature<Point> | undefined;
    const coord = feature?.getGeometry()?.getCoordinates();
    if (coord) {
      view.animate({ center: coord, duration: 600, zoom: Math.max(view.getZoom() || 13, 15) });
    }
  };

  const fechaProgramacion = formatDateDisplay(programacion?.fechaEntrega ?? null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-center">Recorrido</h1>

      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
        >
          Volver
        </button>
      </div>

      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">PanelMonitoreo</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Salidas</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Recorrido</span>
      </div>

      <div className="rounded-xl bg-white dark:bg-darkgray shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="block text-xs uppercase text-dark/60">Programacion</span>
            <span className="font-semibold">{programacion?.id || 'Sin identificador'}</span>
          </div>
          <div>
            <span className="block text-xs uppercase text-dark/60">Fecha</span>
            <span className="font-semibold">{fechaProgramacion}</span>
          </div>
          <div>
            <span className="block text-xs uppercase text-dark/60">Conductor</span>
            <span className="font-semibold">{programacion?.conductorNombre || 'Sin conductor asignado'}</span>
          </div>
          <div>
            <span className="block text-xs uppercase text-dark/60">Vehiculo</span>
            <span className="font-semibold">{programacion?.vehiculoDescripcion || 'Sin vehiculo asignado'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white dark:bg-darkgray rounded-md shadow p-3 space-y-2 max-h-60 overflow-auto md:max-h-[70vh]">
          <h3 className="text-sm font-semibold mb-2">Puntos de entrega</h3>
          {entregas.length === 0 ? (
            <p className="text-sm text-dark/60">No se recibieron notas de salida para esta programacion.</p>
          ) : (
            entregas.map((entrega) => {
              const estadoInfo = getNotaEstadoInfo(entrega.estadoEntrega ?? null);
              const isSelected = selectedId === entrega.id;
              const tieneCoordenadas = entrega.lat !== null && entrega.lon !== null;
              return (
                <button
                  key={entrega.id}
                  type="button"
                  onClick={() => flyToEntrega(entrega.id)}
                  className={`w-full text-left border rounded-md p-3 transition ${
                    isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${estadoInfo.dotClass}`} />
                    <div className="min-w-0 space-y-1">
                      <div className="text-sm font-semibold truncate">{entrega.cliente}</div>
                      <div className="text-xs text-gray-600 truncate">Direccion: {entrega.direccion}</div>
                      <div className="text-xs text-gray-600">Nro. salida: {entrega.nroSalida}</div>
                      {entrega.orden !== null && (
                        <div className="text-xs text-gray-600">Orden: {entrega.orden}</div>
                      )}
                      <div className="text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border ${estadoInfo.pillClass}`}>
                          {estadoInfo.label}
                        </span>
                      </div>
                      {!tieneCoordenadas && (
                        <div className="text-xs text-amber-600">Sin coordenadas disponibles</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-9 rounded-lg overflow-hidden shadow-md h-[55vh] md:h-[70vh]">
          <div ref={mapEl} className="w-full h-full" />
        </div>
      </div>

      {entregas.length > 0 && entregasConCoordenadas.length === 0 && (
        <p className="text-sm text-amber-600">
          Ninguna de las notas tiene coordenadas validas, por lo que no se pudieron graficar en el mapa.
        </p>
      )}
    </div>
  );
};

export default RecorridoMapa;
