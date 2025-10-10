import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Button, TextInput, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';
import { useAuth } from 'src/context/AuthContext';
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

type SearchParams = {
  nro: string;
  desde: string;
  hasta: string;
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
  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return '';
  }
  return `${day}-${month}-${year}`;
};

const getTodayIsoDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
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
  const parts = [placa, marca, modelo].filter(Boolean);
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

const Entregas: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { authorizedFetch, token } = useAuthorizedApi();

  const conductorId = auth.userId;
  const initialDate = useMemo(() => getTodayIsoDate(), []);

  const [nro, setNro] = useState('');
  const [desde, setDesde] = useState(initialDate);
  const [hasta, setHasta] = useState(initialDate);
  const [items, setItems] = useState<ProgramacionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>(() => ({
    nro: '',
    desde: initialDate,
    hasta: initialDate,
  }));

  useEffect(() => {
    const controller = new AbortController();

    if (!token) {
      setError('No hay token de autenticacion.');
      setItems([]);
      setLoading(false);
      return () => controller.abort();
    }

    if (!conductorId) {
      setError('No se pudo obtener el identificador del conductor.');
      setItems([]);
      setLoading(false);
      return () => controller.abort();
    }

    const nroParam = searchParams.nro.trim();
    const desdeParam = formatDateForApi(searchParams.desde);
    const hastaParam = formatDateForApi(searchParams.hasta);

    const query = new URLSearchParams({
      idConductor: String(conductorId),
      nro: nroParam,
      desde: desdeParam,
      hasta: hastaParam,
    });

    const fetchProgramaciones = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch(
          `/api/v1/programacion-distribucion/all-by-conductor?${query.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al cargar programaciones (${response.status}).`);
        }

        const json = (await response.json()) as { data?: ProgramacionApi[] | null };
        if (controller.signal.aborted) {
          return;
        }
        const mapped = Array.isArray(json?.data) ? json.data.map(mapProgramacion) : [];
        setItems(mapped);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener programaciones del conductor', err);
        setError('No se pudo cargar las programaciones asignadas.');
        setItems([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProgramaciones();

    return () => controller.abort();
  }, [authorizedFetch, conductorId, searchParams, token]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams({ nro: nro.trim(), desde, hasta });
  };

  const handleClear = () => {
    const resetDate = getTodayIsoDate();
    setNro('');
    setDesde(resetDate);
    setHasta(resetDate);
    setSearchParams({ nro: '', desde: resetDate, hasta: resetDate });
  };

  const programaciones = useMemo(() => items, [items]);

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Entregas</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Entregas Asignadas</h3>

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
        <h5 className="card-title text-center">Programacion de Distribucion Asignadas</h5>
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
                    <span className="text-sm text-dark/60">No se encontraron programaciones asignadas.</span>
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
                              navigate(`/menu/entregas/${programacion.id}/salidas`, { state: { programacion } })
                            }
                          >
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
      </div>
    </>
  );
};

export default Entregas;
