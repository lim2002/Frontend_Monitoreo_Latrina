import { useEffect, useRef, useState } from 'react';
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
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';

type EntregaInfo = {
  id: string;
  cliente: string;
  ubicacion: string;
  codigoPedido: string;
  orden: number;
  estado: 'entregado' | 'en_proceso';
  lon: number;
  lat: number;
};

const RecorridoMapa = () => {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const mapRef = useRef<Map | null>(null);
  const viewRef = useRef<View | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Datos de ejemplo de entregas
  const entregasData: EntregaInfo[] = [
    {
      id: 'e1',
      cliente: 'Cliente Adriana Gutierrez',
      ubicacion: 'La Paz, Sopocachi',
      codigoPedido: 'PED-0001',
      orden: 1,
      estado: 'entregado',
      lon: -68.125,
      lat: -16.49,
    },
    {
      id: 'e2',
      cliente: 'Cliente Marco Alvarez',
      ubicacion: 'La Paz, Miraflores',
      codigoPedido: 'PED-0002',
      orden: 2,
      estado: 'en_proceso',
      lon: -68.11,
      lat: -16.5,
    },
    {
      id: 'e3',
      cliente: 'Cliente Simon Romero',
      ubicacion: 'La Paz, San Pedro',
      codigoPedido: 'PED-0003',
      orden: 3,
      estado: 'en_proceso',
      lon: -68.135,
      lat: -16.48,
    },
  ];

  useEffect(() => {
    if (!mapEl.current) return;

    // Centro en La Paz, Bolivia
    const center = fromLonLat([-68.1193, -16.4897]);

    // Icono camión de carga (SVG data URI)
    const truckSvg = encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 36' width='64' height='36'><rect x='2' y='8' width='36' height='16' rx='2' fill='%232563eb'/><rect x='38' y='12' width='16' height='12' rx='2' fill='%232563eb'/><rect x='40' y='14' width='6' height='6' fill='white'/><circle cx='16' cy='28' r='5' fill='%23333'/><circle cx='46' cy='28' r='5' fill='%23333'/></svg>"
    );
    const truckIconUrl = `data:image/svg+xml;charset=UTF-8,${truckSvg}`;

    // Icono pin para entregas, colorizable
    const pinSvg = (color: string) => encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 32' width='24' height='32'><path fill='${color}' d='M12 0C6 0 1.5 4.5 1.5 10.5c0 6.5 7.6 15.2 9.8 17.6.4.5 1 .5 1.4 0 2.2-2.4 9.8-11.1 9.8-17.6C22.5 4.5 18 0 12 0z'/><circle cx='12' cy='10.5' r='4' fill='white'/></svg>`
    );

    // Crear features
    const vehiculo = new Feature({ geometry: new Point(center), tipo: 'vehiculo' });
    vehiculo.setId('vehiculo');

    const entregaFeatures = entregasData.map((e) => {
      const f = new Feature({
        geometry: new Point(fromLonLat([e.lon, e.lat])),
        tipo: 'entrega',
        estado: e.estado,
      });
      f.setId(e.id);
      return f;
    });

    const vectorSource = new VectorSource({ features: [vehiculo, ...entregaFeatures] });

    // Escalado dinámico por zoom y selección
    let currentZoom = 13;
    const styleFn = (feature: FeatureLike, _resolution: number) => {
      const tipo = (feature as any).get('tipo');
      // escala base en función del zoom (ligeramente menor)
      const zoomFactor = Math.max(0.6, Math.min(2.2, 0.5 + (currentZoom - 10) * 0.25));

      if (tipo === 'vehiculo') {
        return new Style({ image: new Icon({ src: truckIconUrl, anchor: [0.5, 1], scale: 0.6 * zoomFactor }) });
      }
      const estado = (feature as any).get('estado');
      const color = estado === 'entregado' ? '#22c55e' : '#f59e0b';
      // Si está seleccionado, aumentamos la escala
      const isSelected = feature.getId() === selectedId;
      const baseScale = 0.9 * zoomFactor * (isSelected ? 1.35 : 1);
      return new Style({ image: new Icon({ src: `data:image/svg+xml;charset=UTF-8,${pinSvg(color)}`, anchor: [0.5, 1], scale: baseScale }) });
    };

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

    // asegurar tamaño correcto tras pintar
    setTimeout(() => map.updateSize(), 100);

    return () => {
      map.setTarget(undefined);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambia la selección, forzar re-estilizado
  useEffect(() => {
    vectorLayerRef.current?.changed();
  }, [selectedId]);

  // actualizar tamaño del mapa en cambios de tamaño de ventana (mobile/desktop)
  useEffect(() => {
    const onResize = () => mapRef.current?.updateSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const flyToEntrega = (id: string) => {
    const view = viewRef.current;
    const layer = vectorLayerRef.current;
    const source = layer?.getSource();
    const f = source?.getFeatureById(id) as Feature<Point> | undefined;
    if (view && f) {
      const geom = f.getGeometry();
      const coord = geom?.getCoordinates();
      if (coord) view.animate({ center: coord, duration: 600, zoom: Math.max(view.getZoom() || 13, 15) });
      setSelectedId(id);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-center">Recorrido</h1>

      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">PanelMonitoreo</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Salidas</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Recorrido</span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Panel izquierdo con cards fuera del mapa */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white rounded-md shadow p-3 space-y-2 max-h-56 overflow-auto md:max-h-[70vh]">
          <h3 className="text-sm font-semibold mb-2">Puntos de entrega</h3>
          {entregasData.map((e) => (
            <button
              key={e.id}
              onClick={() => flyToEntrega(e.id)}
              className={`w-full text-left border rounded-md p-3 hover:border-primary transition ${selectedId === e.id ? 'border-primary ring-2 ring-primary/30' : 'border-gray-300'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${e.estado === 'entregado' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{e.cliente}</div>
                  <div className="text-xs text-gray-600 truncate">Ubicación: {e.ubicacion}</div>
                  <div className="text-xs text-gray-600">Código: {e.codigoPedido}</div>
                  <div className="text-xs text-gray-600">Orden: {e.orden}</div>
                  <div className="text-xs text-gray-700 mt-1">Estado: {e.estado === 'entregado' ? 'Entregado' : 'En proceso'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Contenedor del mapa */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 rounded-lg overflow-hidden shadow-md h-[55vh] md:h-[70vh]">
          <div ref={mapEl} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default RecorridoMapa;
