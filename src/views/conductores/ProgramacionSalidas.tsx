import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type ClienteApi = {
  idCliente?: number | string | null;
  nombre?: string | null;
};

type UbicacionApi = {
  idUbicacionCliente?: number | string | null;
  ubicacion?: string | null;
  nombreDireccion?: string | null;
};

type SalidaProgramadaApi = {
  idSalidaProgramada?: number | string | null;
  idProgramacion?: number | string | null;
  idNotaSalida?: number | string | null;
  cliente?: ClienteApi | null;
  ubicacion?: UbicacionApi | null;
  nroSalida?: string | null;
  estadoEntrega?: number | string | null;
  ordenPrioridadRuta?: number | string | null;
  ubicacionEntrega?: string | null;
  fechaEntregaConfirmada?: string | null;
  status?: number | string | null;
};

type ProgramacionResumen = {
  id: string;
  fechaEntrega: string | null;
  estadoEntrega: number | null;
  vehiculoDescripcion: string;
  conductorNombre: string;
};

type NotaSalida = {
  idSalidaProgramada: string;
  idNotaSalida: string;
  nroSalida: string;
  cliente: string;
  ordenPrioridadRuta: number | null;
  estadoEntrega: number | null;
  direccion: string;
  ubicacionDetalle: string;
  fechaEntregaConfirmada: string;
  lat: string | null;
  lon: string | null;
};

const sanitize = (value?: string | null): string => (value ?? '').trim();

const parseNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const createFallbackId = () => 'salida-' + Math.random().toString(36).slice(2, 10);

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

const parseLatLon = (value?: string | null): { lat: string | null; lon: string | null } => {
  if (!value) {
    return { lat: null, lon: null };
  }
  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { lat: null, lon: null };
  }
  const [latRaw, lonRaw] = parts;
  const latNum = Number(latRaw);
  const lonNum = Number(lonRaw);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    return { lat: null, lon: null };
  }
  return { lat: latRaw, lon: lonRaw };
};

const mapNotaEstado = (estado: number | null) => {
  switch (estado) {
    case 1:
      return { label: 'No entregado', badge: 'lightwarning', cls: 'border-warning text-warning' };
    case 2:
      return { label: 'Entregado', badge: 'lightsuccess', cls: 'border-success text-success' };
    case 3:
      return { label: 'Atrasado', badge: 'lighterror', cls: 'border-error text-error' };
    default:
      return { label: 'Sin estado', badge: 'lightsecondary', cls: 'border-secondary text-secondary' };
  }
};

const mapProgramacionEstado = (estado: number | null) => {
  switch (estado) {
    case 0:
      return { label: 'En proceso', badge: 'lightwarning', cls: 'border-warning text-warning' };
    case 2:
      return { label: 'Entregado', badge: 'lightsuccess', cls: 'border-success text-success' };
    case 3:
      return { label: 'No entregado', badge: 'lightsecondary', cls: 'border-secondary text-secondary' };
    default:
      return { label: 'Sin estado', badge: 'lightsecondary', cls: 'border-secondary text-secondary' };
  }
};

const mapNotaSalida = (nota: SalidaProgramadaApi): NotaSalida => {
  const fallbackId = createFallbackId();
  const salidaId =
    nota.idSalidaProgramada !== undefined && nota.idSalidaProgramada !== null
      ? String(nota.idSalidaProgramada)
      : fallbackId;
  const notaId =
    nota.idNotaSalida !== undefined && nota.idNotaSalida !== null ? String(nota.idNotaSalida) : salidaId;

  return {
    idSalidaProgramada: salidaId,
    idNotaSalida: notaId,
    nroSalida: sanitize(nota.nroSalida),
    cliente: sanitize(nota.cliente?.nombre),
    ordenPrioridadRuta: parseNumber(nota.ordenPrioridadRuta),
    estadoEntrega: parseNumber(nota.estadoEntrega),
    direccion: sanitize(nota.ubicacion?.nombreDireccion),
    ubicacionDetalle: sanitize(nota.ubicacionEntrega ?? nota.ubicacion?.ubicacion),
    fechaEntregaConfirmada: sanitize(nota.fechaEntregaConfirmada),
    ...parseLatLon(nota.ubicacionEntrega ?? nota.ubicacion?.ubicacion ?? null),
  };
};

type LocationState = {
  programacion?: ProgramacionResumen | null;
};

const ProgramacionSalidas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: programacionIdParam } = useParams();
  const { token, authorizedFetch } = useAuthorizedApi();

  const state = (location.state ?? {}) as LocationState;
  const programacion = state.programacion ?? null;

  const programacionId = programacionIdParam ? String(programacionIdParam) : '';

  const [notas, setNotas] = useState<NotaSalida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    if (!programacionId) {
      setNotas([]);
      return () => controller.abort();
    }
    if (!token) {
      setError('No se pudo autenticar la solicitud.');
      setNotas([]);
      return () => controller.abort();
    }

    const fetchNotas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch(
          '/api/v1/salidas-programadas/' + encodeURIComponent(programacionId),
          { signal: controller.signal },
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al obtener las salidas (${response.status}).`);
        }
        const json = (await response.json()) as { data?: SalidaProgramadaApi[] | null };
        if (controller.signal.aborted) {
          return;
        }
        const items = Array.isArray(json?.data) ? json.data.map(mapNotaSalida) : [];
        setNotas(items);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al cargar salidas de la programacion', err);
        setError('No se pudo cargar las notas de salida.');
        setNotas([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotas();

    return () => controller.abort();
  }, [authorizedFetch, programacionId, reloadKey, token]);

  const resumen = useMemo(() => {
    const total = notas.length;
    const noEntregadas = notas.filter((n) => n.estadoEntrega === 1).length;
    const entregadas = notas.filter((n) => n.estadoEntrega === 2).length;
    const atrasadas = notas.filter((n) => n.estadoEntrega === 3).length;
    return { total, noEntregadas, entregadas, atrasadas };
  }, [notas]);

  const estadoProgramacion = useMemo(() => mapProgramacionEstado(programacion?.estadoEntrega ?? null), [programacion?.estadoEntrega]);
  const fechaProgramacion = formatDateDisplay(programacion?.fechaEntrega ?? null);

  const handleVerDetalle = (nota: NotaSalida) => {
    navigate(`/menu/entregas/${nota.idSalidaProgramada}`, { state: { nota, programacion, programacionId } });
  };

  const handleConfirmProgramacion = async () => {
    if (!programacionId || isConfirming) {
      return;
    }
    const confirm = window.confirm('Esta seguro de confirmar las entregas de esta programacion?');
    if (!confirm) {
      return;
    }
    try {
      setIsConfirming(true);
      const response = await authorizedFetch(
        `/api/v1/programacion-distribucion/confirm/${encodeURIComponent(programacionId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([]),
        },
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error al confirmar la programacion (${response.status}).`);
      }
      alert('Programacion confirmada correctamente.');
      setReloadKey((prev) => prev + 1);
    } catch (err) {
      console.error('Error al confirmar programacion', err);
      alert('No se pudo confirmar la programacion. Intente nuevamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Entregas</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Programacion</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Notas de salida asignadas</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        {isLoading && <p className="text-sm text-dark/70 mb-3">Cargando notas de salida...</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}

        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableRow>
                <TableHeadCell className="p-6 text-base">Cliente</TableHeadCell>
                <TableHeadCell className="text-base">Nro. nota</TableHeadCell>
                <TableHeadCell className="text-base">Orden</TableHeadCell>
                <TableHeadCell className="text-base">Estado</TableHeadCell>
                <TableHeadCell className="text-base">Direccion</TableHeadCell>
                <TableHeadCell className="text-base">Opciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {!isLoading && notas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <span className="text-sm text-dark/60">No se encontraron notas de salida.</span>
                  </TableCell>
                </TableRow>
              ) : (
                notas.map((nota) => {
                  const estado = mapNotaEstado(nota.estadoEntrega);
                  return (
                    <TableRow key={nota.idSalidaProgramada}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <span className="text-sm">{nota.cliente || 'Sin cliente'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{nota.nroSalida || nota.idNotaSalida || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{nota.ordenPrioridadRuta ?? '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge color={estado.badge} className={'border ' + estado.cls}>
                          {estado.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{nota.direccion || 'Sin direccion'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {nota.lat && nota.lon ? (
                            <a
                              title="Ver ubicacion en Google Maps"
                              className="hover:text-primary"
                              href={`https://www.google.com/maps?q=${encodeURIComponent(`${nota.lat},${nota.lon}`)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Icon icon="solar:map-point-wave-linear" width={20} />
                            </a>
                          ) : (
                            <span className="text-sm text-dark/40" title="Ubicacion no disponible">
                              <Icon icon="solar:map-point-wave-linear" width={20} />
                            </span>
                          )}
                          <button title="Ver detalle" className="hover:text-primary" onClick={() => handleVerDetalle(nota)}>
                            <Icon icon="solar:eye-linear" width={20} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Programacion:</span> {programacionId || 'Sin seleccion'}
            </div>
            <div>
              <span className="font-semibold">Fecha de distribucion:</span> {fechaProgramacion}
            </div>
            <div>
              <span className="font-semibold">Conductor asignado:</span>{' '}
              {programacion?.conductorNombre || 'Sin conductor asignado'}
            </div>
            <div>
              <span className="font-semibold">Vehiculo asignado:</span>{' '}
              {programacion?.vehiculoDescripcion || 'Sin vehiculo asignado'}
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <span className="font-semibold">Estado programacion:</span>
              <Badge color={estadoProgramacion.badge} className={'border ' + estadoProgramacion.cls}>
                {estadoProgramacion.label}
              </Badge>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Total de notas:</span> {resumen.total}
            </div>
            <div>
              <span className="font-semibold">No entregadas:</span> {resumen.noEntregadas}
            </div>
            <div>
              <span className="font-semibold">Entregadas:</span> {resumen.entregadas}
            </div>
            <div>
              <span className="font-semibold">Atrasadas:</span> {resumen.atrasadas}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button color={'gray'} className="px-6" onClick={handleConfirmProgramacion} disabled={!programacionId || isConfirming}>
          Confirmar Entregas
        </Button>
        <Button color={'gray'} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </>
  );
};

export default ProgramacionSalidas;
