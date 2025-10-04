import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type ClienteApi = {
  idCliente?: number | string | null;
  nombre?: string | null;
  representante?: string | null;
  telefono?: string | null;
  celular?: string | null;
  fax?: string | null;
  email?: string | null;
};

type UbicacionApi = {
  idUbicacionCliente?: number | string | null;
  cliente?: ClienteApi | null;
  ubicacion?: string | null;
  nombreDireccion?: string | null;
  status?: string | null;
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

type NotaSalida = {
  idSalidaProgramada: string;
  idNotaSalida: string;
  nroSalida: string;
  cliente: string;
  ordenPrioridadRuta: number | null;
  estadoEntrega: number | null;
  direccion: string;
  ubicacionEntrega: string;
  fechaEntregaConfirmada: string;
};

type ProgramacionResumen = {
  id: string;
  fechaEntrega: string | null;
  estadoEntrega: number | null;
  vehiculoDescripcion: string;
  conductorNombre: string;
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

const createFallbackId = () => 'nota-' + Math.random().toString(36).slice(2, 10);

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
  const salidaId = nota.idSalidaProgramada !== undefined && nota.idSalidaProgramada !== null ? String(nota.idSalidaProgramada) : fallbackId;
  const notaId = nota.idNotaSalida !== undefined && nota.idNotaSalida !== null ? String(nota.idNotaSalida) : salidaId;

  return {
    idSalidaProgramada: salidaId,
    idNotaSalida: notaId,
    nroSalida: sanitize(nota.nroSalida),
    cliente: sanitize(nota.cliente?.nombre),
    ordenPrioridadRuta: parseNumber(nota.ordenPrioridadRuta),
    estadoEntrega: parseNumber(nota.estadoEntrega),
    direccion: sanitize(nota.ubicacion?.nombreDireccion),
    ubicacionEntrega: sanitize(nota.ubicacionEntrega ?? nota.ubicacion?.ubicacion),
    fechaEntregaConfirmada: sanitize(nota.fechaEntregaConfirmada),
  };
};

const extractProgramacionFromState = (state: unknown): ProgramacionResumen | null => {
  if (!state || typeof state !== 'object') {
    return null;
  }
  const maybeState = state as { programacion?: ProgramacionResumen | null };
  if (!maybeState.programacion) {
    return null;
  }
  const programacion = maybeState.programacion;
  return {
    id: programacion.id,
    fechaEntrega: programacion.fechaEntrega ?? null,
    estadoEntrega: programacion.estadoEntrega ?? null,
    vehiculoDescripcion: programacion.vehiculoDescripcion ?? 'Sin vehiculo asignado',
    conductorNombre: programacion.conductorNombre ?? '',
  };
};

const SalidaDetalle: React.FC = () => {
  const { id } = useParams();
  const programacionId = id ?? '';
  const navigate = useNavigate();
  const location = useLocation();
  const { token, authorizedFetch } = useAuthorizedApi();

  const [notas, setNotas] = useState<NotaSalida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programacion, setProgramacion] = useState<ProgramacionResumen | null>(extractProgramacionFromState(location.state));

  useEffect(() => {
    setProgramacion(extractProgramacionFromState(location.state));
  }, [location.state]);

  useEffect(() => {
    if (!token || !programacionId) {
      setNotas([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchNotas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch('/api/v1/salidas-programadas/' + encodeURIComponent(programacionId), {
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Error al obtener las notas de salida (' + response.status + ').');
        }

        const json = (await response.json()) as { data?: SalidaProgramadaApi[] };
        if (!isMounted) {
          return;
        }

        const items = Array.isArray(json.data) ? json.data.map(mapNotaSalida) : [];
        setNotas(items);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener notas de salida', err);
        if (isMounted) {
          setError('No se pudieron cargar las notas de salida. Intenta nuevamente.');
          setNotas([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchNotas();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorizedFetch, programacionId, token]);

  const resumen = useMemo(() => {
    const total = notas.length;
    const noEntregadas = notas.filter((nota) => nota.estadoEntrega === 1).length;
    const entregadas = notas.filter((nota) => nota.estadoEntrega === 2).length;
    const atrasadas = notas.filter((nota) => nota.estadoEntrega === 3).length;
    return { total, noEntregadas, entregadas, atrasadas };
  }, [notas]);

  const estadoProgramacion = mapProgramacionEstado(programacion?.estadoEntrega ?? null);
  const fechaProgramacion = formatDateDisplay(programacion?.fechaEntrega ?? null);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">PanelMonitoreo</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Salidas</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Panel de Monitoreo</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="card-title">Notas de salida</h5>
          {isLoading && <span className="text-sm text-dark/60">Cargando notas...</span>}
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
        {programacionId === '' && !error ? (
          <p className="text-sm text-dark/60">Selecciona una programacion en el panel para ver sus notas de salida.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <Table hoverable>
              <TableHead className="border-b border-gray-300">
                <TableRow>
                  <TableHeadCell className="p-6 text-base">Cliente</TableHeadCell>
                  <TableHeadCell className="text-base">Nro. nota</TableHeadCell>
                  <TableHeadCell className="text-base">Orden</TableHeadCell>
                  <TableHeadCell className="text-base">Estado</TableHeadCell>
                  <TableHeadCell className="text-base">Direccion</TableHeadCell>
                  <TableHeadCell className="text-base">Detalle</TableHeadCell>
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
                    const notaIdForDetail = nota.idNotaSalida || nota.idSalidaProgramada;
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
                          <button
                            title="Ver detalle"
                            className="hover:text-primary"
                            onClick={() => navigate('/menu/panel-monitoreo/salidas/' + programacionId + '/detalle/' + notaIdForDetail)}
                          >
                            <Icon icon="solar:eye-linear" width={20} />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-6 border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Programacion seleccionada:</span> {programacionId || 'Ninguna'}
            </div>
            <div>
              <span className="font-semibold">Fecha de distribucion:</span> {fechaProgramacion}
            </div>
            <div>
              <span className="font-semibold">Conductor asignado:</span> {programacion?.conductorNombre || 'Sin conductor asignado'}
            </div>
            <div>
              <span className="font-semibold">Vehiculo asignado:</span> {programacion?.vehiculoDescripcion || 'Sin vehiculo asignado'}
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

        <div className="mt-6 flex items-center justify-between">
          <Button
            color={'primary'}
            className="font-medium"
            onClick={() => navigate('/menu/panel-monitoreo/salidas/' + programacionId + '/recorrido', { state: { programacion, notas } })}
            disabled={!programacionId}
          >
            Ver recorrido
          </Button>
          <Button color={'gray'} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    </>
  );
};

export default SalidaDetalle;
