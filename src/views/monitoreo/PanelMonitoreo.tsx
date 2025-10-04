import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Button, TextInput, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type VehiculoApi = {
  idVehiculo?: number | string | null;
  marca?: string | null;
  modelo?: string | null;
  placa?: string | null;
};

type ConductorApi = {
  idUsuario?: number | string | null;
  nombreCompleto?: string | null;
};

type ProgramacionApi = {
  idProgramacion: number | string;
  fechaEntrega?: string | null;
  estadoEntrega?: number | string | null;
  status?: number | string | null;
  vehiculo?: VehiculoApi | null;
  vehiculoAsignado?: VehiculoApi | null;
  conductor?: ConductorApi | null;
  conductorAsignado?: ConductorApi | null;
};

type ProgramacionItem = {
  id: string;
  fechaEntrega: string | null;
  estadoEntrega: number | null;
  vehiculoDescripcion: string;
  conductorNombre: string;
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

const formatDateForApi = (value: string): string => {
  if (!value) {
    return '';
  }
  const parts = value.split('-');
  if (parts.length !== 3) {
    return '';
  }
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (!year || !month || !day) {
    return '';
  }
  return day + '-' + month + '-' + year;
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

const buildVehiculoDescripcion = (vehiculo: VehiculoApi | null | undefined): string => {
  if (!vehiculo) {
    return 'Sin vehiculo asignado';
  }
  const placa = sanitize(vehiculo.placa);
  const marca = sanitize(vehiculo.marca);
  const modelo = sanitize(vehiculo.modelo);
  const parts = [placa, marca, modelo].filter((part) => Boolean(part));
  return parts.length ? parts.join(' - ') : 'Sin vehiculo asignado';
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

const mapProgramacion = (programacion: ProgramacionApi): ProgramacionItem => {
  const vehiculoRaw = programacion.vehiculo ?? programacion.vehiculoAsignado ?? null;
  const conductorRaw = programacion.conductor ?? programacion.conductorAsignado ?? null;

  return {
    id: String(programacion.idProgramacion),
    fechaEntrega: programacion.fechaEntrega ?? null,
    estadoEntrega: parseNumber(programacion.estadoEntrega),
    vehiculoDescripcion: buildVehiculoDescripcion(vehiculoRaw),
    conductorNombre: sanitize(conductorRaw?.nombreCompleto),
  };
};

type SearchParams = {
  nro: string;
  desde: string;
  hasta: string;
};

const PanelMonitoreo: React.FC = () => {
  const navigate = useNavigate();
  const { token, authorizedFetch } = useAuthorizedApi();

  const [nro, setNro] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [searchParams, setSearchParams] = useState<SearchParams>({ nro: '', desde: '', hasta: '' });

  const [items, setItems] = useState<ProgramacionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setItems([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const nroParam = searchParams.nro.trim();
    const desdeParam = formatDateForApi(searchParams.desde);
    const hastaParam = formatDateForApi(searchParams.hasta);

    const query = new URLSearchParams({
      nro: nroParam,
      desde: desdeParam,
      hasta: hastaParam,
    });

    const fetchProgramaciones = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch('/api/v1/programacion-distribucion/all?' + query.toString(), {
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Error al obtener las programaciones (' + response.status + ').');
        }

        const json = (await response.json()) as { data?: ProgramacionApi[] };
        if (!isMounted) {
          return;
        }

        const records = Array.isArray(json.data) ? json.data.map(mapProgramacion) : [];
        setItems(records);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener programaciones', error);
        if (isMounted) {
          setError('No se pudieron cargar las programaciones. Intenta nuevamente.');
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchProgramaciones();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorizedFetch, searchParams, token]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams({ nro: nro.trim(), desde, hasta });
  };

  const handleClear = () => {
    setNro('');
    setDesde('');
    setHasta('');
    setSearchParams({ nro: '', desde: '', hasta: '' });
  };

  const programaciones = useMemo(() => items, [items]);

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">PanelMonitoreo</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Panel de Monitoreo</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <form className="grid grid-cols-12 gap-4 items-end" onSubmit={handleSearch}>
          <div className="md:col-span-4 col-span-12">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
                <Icon icon="solar:magnifer-linear" width={20} />
              </span>
              <TextInput
                value={nro}
                onChange={(e) => setNro(e.target.value)}
                placeholder="Ingresa Nro. programacion"
                className="pl-9 form-control form-rounded-xl"
              />
            </div>
          </div>
          <div className="md:col-span-3 col-span-12">
            <label className="mb-2 block text-sm text-dark/80">Desde</label>
            <TextInput type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="form-control form-rounded-xl" />
          </div>
          <div className="md:col-span-3 col-span-12">
            <label className="mb-2 block text-sm text-dark/80">Hasta</label>
            <TextInput type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="form-control form-rounded-xl" />
          </div>
          <div className="md:col-span-2 col-span-12 flex gap-2">
            <Button type="submit" color="primary" className="w-full" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button type="button" color="light" onClick={handleClear} className="w-full" disabled={loading}>
              Limpiar
            </Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <h5 className="card-title text-center">Programacion de Distribucion de Salidas</h5>
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableRow>
                <TableHeadCell className="p-6 text-base">Fecha de Distribucion</TableHeadCell>
                <TableHeadCell className="text-base">Nro. Programacion</TableHeadCell>
                <TableHeadCell className="text-base">Estado</TableHeadCell>
                <TableHeadCell className="text-base">Opciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {programaciones.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    <span className="text-sm text-dark/60">No se encontraron programaciones.</span>
                  </TableCell>
                </TableRow>
              ) : (
                programaciones.map((programacion) => {
                  const estado = mapProgramacionEstado(programacion.estadoEntrega);
                  return (
                    <TableRow key={programacion.id}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <span className="text-sm">{formatDateDisplay(programacion.fechaEntrega)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{programacion.id}</span>
                      </TableCell>
                      <TableCell>
                        <Badge color={estado.badge} className={'border ' + estado.cls}>
                          {estado.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button
                            title="Ver"
                            className="hover:text-primary"
                            onClick={() =>
                              navigate('/menu/panel-monitoreo/salidas/' + programacion.id, {
                                state: { programacion },
                              })
                            }
                          >
                            <Icon icon="solar:eye-linear" width={20} />
                          </button>
                          <button title="Eliminar" className="hover:text-error" disabled>
                            <Icon icon="solar:trash-bin-minimalistic-linear" width={20} />
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
      </div>
    </>
  );
};

export default PanelMonitoreo;
