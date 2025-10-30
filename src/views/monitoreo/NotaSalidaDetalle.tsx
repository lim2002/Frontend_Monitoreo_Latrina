import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type SalidaProgramadaDetalleApi = {
  idSalidaProgramadaDetalle?: number | string | null;
  idSalidaProgramada?: number | string | null;
  idNotaSalida?: number | string | null;
  idNotaSalidaDetalle?: number | string | null;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  cantidad?: number | string | null;
  descripcion?: string | null;
  precioUnitario?: number | string | null;
  estadoObservacion?: number | string | null;
  estadoEntrega?: number | string | null;
  status?: number | string | null;
};

type NotaSalidaResumen = {
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

type LocationState = {
  nota?: NotaSalidaResumen | null;
  programacion?: ProgramacionResumen | null;
  programacionId?: string;
};

type DetalleNota = {
  id: string;
  idNotaSalidaDetalle: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  descripcion: string;
  precioUnitario: number | null;
  estadoEntrega: number | null;
  estadoObservacion: number | null;
};

type ObservacionEntregaApi = {
  idObservacionEntrega?: number | string | null;
  idSalidasProgramadasDetalle?: number | string | null;
  observacion?: string | null;
  estadoEntrega?: number | string | null;
  status?: number | string | null;
};

type ObservacionEntrega = {
  id: string;
  detalleId: string;
  observacion: string;
  estadoEntrega: number | null;
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

const mapEstadoEntrega = (estado: number | null) => {
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

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return 'Sin registro';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const [dateOnly] = value.split('T');
    return (dateOnly ?? value).replace(/-/g, '/');
  }
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const mapDetalle = (detalle: SalidaProgramadaDetalleApi): DetalleNota => ({
  id: detalle.idSalidaProgramadaDetalle !== undefined && detalle.idSalidaProgramadaDetalle !== null ? String(detalle.idSalidaProgramadaDetalle) : crypto.randomUUID(),
  idNotaSalidaDetalle: detalle.idNotaSalidaDetalle !== undefined && detalle.idNotaSalidaDetalle !== null ? String(detalle.idNotaSalidaDetalle) : '',
  productoCodigo: sanitize(detalle.productoCodigo),
  productoNombre: sanitize(detalle.productoNombre),
  cantidad: parseNumber(detalle.cantidad) ?? 0,
  descripcion: sanitize(detalle.descripcion),
  precioUnitario: parseNumber(detalle.precioUnitario),
  estadoEntrega: parseNumber(detalle.estadoEntrega),
  estadoObservacion: parseNumber(detalle.estadoObservacion),
});

const NotaSalidaDetalle: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notaId } = useParams();
  const state = (location.state ?? {}) as LocationState;
  const nota = state.nota ?? null;
  const programacion = state.programacion ?? null;
  const { authorizedFetch } = useAuthorizedApi();

  const [detalles, setDetalles] = useState<DetalleNota[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState<Record<string, ObservacionEntrega>>({});
  const [selectedObservacion, setSelectedObservacion] = useState<ObservacionEntrega | null>(null);

  const clienteDisplay = useMemo(() => nota?.cliente || 'Sin cliente', [nota?.cliente]);
  const fechaDisplay = useMemo(() => formatDate(programacion?.fechaEntrega ?? nota?.fechaEntregaConfirmada ?? null), [nota?.fechaEntregaConfirmada, programacion?.fechaEntrega]);

  useEffect(() => {
    const salidaProgramadaId = nota?.idSalidaProgramada;
    if (!salidaProgramadaId) {
      setDetalles([]);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    authorizedFetch(`/api/v1/salidas-programadas-detalle/salida-programada/${encodeURIComponent(salidaProgramadaId)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al obtener el detalle de la salida (${response.status}).`);
        }
        const json = (await response.json()) as { data?: SalidaProgramadaDetalleApi[] | null };
        if (controller.signal.aborted) {
          return;
        }
        const items = Array.isArray(json?.data) ? json.data.map(mapDetalle) : [];
        setDetalles(items);
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener detalle de nota de salida', err);
        setError('No se pudo cargar el detalle de la nota de salida.');
        setDetalles([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [authorizedFetch, nota?.idSalidaProgramada]);

  useEffect(() => {
    const salidaProgramadaId = nota?.idSalidaProgramada;
    if (!salidaProgramadaId) {
      setObservaciones({});
      return;
    }

    const controller = new AbortController();

    authorizedFetch(
      `/api/v1/observacion-entregas/programacion-salida/${encodeURIComponent(salidaProgramadaId)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al obtener las observaciones (${response.status}).`);
        }
        const json = (await response.json()) as { data?: ObservacionEntregaApi[] | null };
        if (controller.signal.aborted) {
          return;
        }
        const mapped = Array.isArray(json?.data)
          ? json.data.reduce<Record<string, ObservacionEntrega>>((acc, item) => {
              const detalleId = item?.idSalidasProgramadasDetalle;
              if (detalleId === undefined || detalleId === null) {
                return acc;
              }
              const key = String(detalleId);
              acc[key] = {
                id:
                  item?.idObservacionEntrega !== undefined && item?.idObservacionEntrega !== null
                    ? String(item.idObservacionEntrega)
                    : key,
                detalleId: key,
                observacion: sanitize(item?.observacion),
                estadoEntrega: parseNumber(item?.estadoEntrega),
              };
              return acc;
            }, {})
          : {};
        setObservaciones(mapped);
      })
      .catch((err) => {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener observaciones de entrega', err);
        setObservaciones({});
      });

    return () => controller.abort();
  }, [authorizedFetch, nota?.idSalidaProgramada]);

  const handleVerObservacion = (detalleId: string) => {
    const observacion = observaciones[detalleId];
    if (observacion) {
      setSelectedObservacion(observacion);
    }
  };

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">PanelMonitoreo</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Salidas</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Detalle nota</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Detalle de Nota de Salida</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
          <p className="text-sm"><span className="font-semibold">Cliente:</span> {clienteDisplay}</p>
          <p className="text-sm"><span className="font-semibold">Fecha de entrega:</span> {fechaDisplay}</p>
          <p className="text-sm"><span className="font-semibold">Nota:</span> {nota?.nroSalida || notaId || '-'}</p>
        </div>

        {isLoading && <p className="mt-6 text-sm text-dark/70">Cargando productos...</p>}
        {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {!isLoading && !error && (
          <div className="mt-6 overflow-x-auto">
            <Table hoverable>
              <TableHead className="border-b border-gray-300">
                <TableRow>
                  <TableHeadCell className="p-6 text-base">Codigo</TableHeadCell>
                  <TableHeadCell className="text-base">Producto</TableHeadCell>
                  <TableHeadCell className="text-base">Cantidad</TableHeadCell>
                  <TableHeadCell className="text-base">Descripcion</TableHeadCell>
                  <TableHeadCell className="text-base">Estado entrega</TableHeadCell>
                  <TableHeadCell className="text-base">Observacion</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-300">
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-sm text-dark/60">
                      No se registraron productos para esta nota de salida.
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((detalle) => {
                    const estado = mapEstadoEntrega(detalle.estadoEntrega);
                    const observacionDetalle = observaciones[detalle.id];
                    const puedeVerObservacion = detalle.estadoObservacion === 1 && Boolean(observacionDetalle);
                    return (
                      <TableRow key={detalle.id}>
                        <TableCell className="whitespace-nowrap ps-6">{detalle.productoCodigo || '-'}</TableCell>
                        <TableCell>{detalle.productoNombre || 'Sin nombre'}</TableCell>
                        <TableCell>{detalle.cantidad}</TableCell>
                        <TableCell>{detalle.descripcion || 'Sin descripcion'}</TableCell>
                        <TableCell>
                          <Badge color={estado.badge} className={`border ${estado.cls}`}>
                            {estado.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {puedeVerObservacion ? (
                            <Button color={'light'} size="sm" onClick={() => handleVerObservacion(detalle.id)}>
                              <Icon icon="solar:notes-linear" width={18} className="me-1" /> Ver observacion
                            </Button>
                          ) : (
                            <span className="text-sm text-dark/50">Sin observacion</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button color={'gray'} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>

      {selectedObservacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-darkgray rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-black/10">
              <h4 className="text-lg font-semibold">Observacion</h4>
            </div>
            <div className="p-6 text-sm text-dark/70">
              {selectedObservacion.observacion || 'Sin observacion registrada.'}
            </div>
            <div className="px-6 py-4 border-t border-black/10 flex justify-end">
              <Button color={'primary'} onClick={() => setSelectedObservacion(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotaSalidaDetalle;
