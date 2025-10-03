import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type VehiculoApi = {
  idVehiculo: number | string;
  idDispositivoGps?: number | string | null;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  anio?: number | null;
  capacidadKg?: number | null;
  estadoVehiculo?: string | null;
  fechaUltimoMantenimiento?: string | null;
  status?: number | null;
};

type Vehiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number | null;
  capacidadKg: number | null;
  estadoVehiculo: string;
  fechaUltimoMantenimiento: string | null;
  idDispositivoGps: number | null;
  status: number | null;
};

const sanitize = (value?: string | null): string => (value ?? '').trim();

const mapVehiculo = (vehiculo: VehiculoApi): Vehiculo => ({
  id: String(vehiculo.idVehiculo),
  placa: sanitize(vehiculo.placa),
  marca: sanitize(vehiculo.marca),
  modelo: sanitize(vehiculo.modelo),
  anio: vehiculo.anio ?? null,
  capacidadKg: vehiculo.capacidadKg ?? null,
  estadoVehiculo: sanitize(vehiculo.estadoVehiculo) || 'Sin estado',
  fechaUltimoMantenimiento: vehiculo.fechaUltimoMantenimiento ?? null,
  idDispositivoGps: vehiculo.idDispositivoGps ? Number(vehiculo.idDispositivoGps) : null,
  status: vehiculo.status ?? null,
});

const formatDate = (value: string | null): string => {
  if (!value) {
    return 'Sin registro';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const Vehiculos: React.FC = () => {
  const navigate = useNavigate();
  const { token, authorizedFetch } = useAuthorizedApi();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('all');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setVehiculos([]);
      setSelectedVehiculo(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const term = searchTerm.trim() === '' ? 'all' : searchTerm.trim();

    const obtenerVehiculos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch(`/api/v1/vehiculos/${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al obtener vehiculos (${response.status}).`);
        }

        const json = (await response.json()) as { data?: VehiculoApi[] };
        if (!isMounted) {
          return;
        }

        const items = Array.isArray(json.data) ? json.data.map(mapVehiculo) : [];
        setVehiculos(items);
        setSelectedVehiculo((prev) => (prev && items.some((vehiculo) => vehiculo.id === prev.id) ? prev : null));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener vehiculos', error);
        if (isMounted) {
          setError('No se pudieron cargar los vehiculos. Intenta nuevamente.');
          setVehiculos([]);
          setSelectedVehiculo(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void obtenerVehiculos();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorizedFetch, searchTerm, token]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    setSearchTerm(normalized || 'all');
  };

  const handleClear = () => {
    setQuery('');
    setSearchTerm('all');
    setSelectedVehiculo(null);
  };

  const handleAgregar = () => {
    navigate('/menu/vehiculos/nuevo');
  };

  const vehiculosEnTabla = useMemo(() => vehiculos, [vehiculos]);

  const toggleDetalle = (vehiculo: Vehiculo) => {
    setSelectedVehiculo((prev) => (prev && prev.id === vehiculo.id ? null : vehiculo));
  };

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Vehiculos</span>
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <h5 className="card-title text-center">Vehiculos</h5>
        <form className="mt-4 flex flex-col md:flex-row items-stretch gap-3" onSubmit={handleSearch}>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
              <Icon icon="solar:magnifer-linear" width={20} />
            </span>
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa placa o modelo del vehiculo"
              className="pl-9 form-control form-rounded-xl"
            />
          </div>
          <div className="flex gap-2 md:w-auto w-full">
            <Button type="submit" color="primary" className="font-medium w-full md:w-auto" disabled={isLoading}>
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button type="button" color="gray" className="font-medium w-full md:w-auto" onClick={handleClear} disabled={isLoading}>
              Limpiar
            </Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-base font-medium">Listado de vehiculos</h6>
          {isLoading && <span className="text-sm text-dark/60">Cargando vehiculos...</span>}
        </div>
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableRow>
                <TableHeadCell className="p-6 text-base">Marca</TableHeadCell>
                <TableHeadCell className="text-base">Modelo</TableHeadCell>
                <TableHeadCell className="text-base">Placa</TableHeadCell>
                <TableHeadCell className="text-base">Estado</TableHeadCell>
                <TableHeadCell className="text-base">Opciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {vehiculosEnTabla.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <span className="text-sm text-dark/60">No se encontraron vehiculos.</span>
                  </TableCell>
                </TableRow>
              ) : (
                vehiculosEnTabla.map((vehiculo) => {
                  const activo = (vehiculo.status ?? 0) === 1;
                  return (
                    <TableRow key={vehiculo.id}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <span className="text-sm">{vehiculo.marca || 'Sin marca'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{vehiculo.modelo || 'Sin modelo'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{vehiculo.placa || 'Sin placa'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={activo ? 'lightsuccess' : 'lighterror'}
                          className={`border ${activo ? 'border-success text-success' : 'border-error text-error'}`}
                        >
                          {activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button title="Ver" className="hover:text-primary" onClick={() => toggleDetalle(vehiculo)}>
                            <Icon icon="solar:eye-linear" width={20} />
                          </button>
                          <button title="Editar" className="hover:text-primary" disabled>
                            <Icon icon="solar:pen-linear" width={20} />
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

      {selectedVehiculo && (
        <div className="mt-6 rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h6 className="text-base font-semibold">Detalle del vehiculo</h6>
              <p className="text-sm text-dark/60">Informacion detallada del vehiculo seleccionado.</p>
            </div>
            <Button color="gray" size="sm" onClick={() => setSelectedVehiculo(null)}>
              Cerrar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-dark/50">Marca</p>
              <p className="text-sm font-medium">{selectedVehiculo.marca || 'Sin marca'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Modelo</p>
              <p className="text-sm font-medium">{selectedVehiculo.modelo || 'Sin modelo'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Placa</p>
              <p className="text-sm font-medium">{selectedVehiculo.placa || 'Sin placa'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Anio</p>
              <p className="text-sm font-medium">{selectedVehiculo.anio ?? 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Capacidad (Kg)</p>
              <p className="text-sm font-medium">{selectedVehiculo.capacidadKg ?? 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Estado</p>
              <p className="text-sm font-medium">{selectedVehiculo.estadoVehiculo}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Dispositivo GPS</p>
              <p className="text-sm font-medium">{selectedVehiculo.idDispositivoGps ?? 'Sin asignar'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Ultimo mantenimiento</p>
              <p className="text-sm font-medium">{formatDate(selectedVehiculo.fechaUltimoMantenimiento)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button color="primary" onClick={handleAgregar} className="font-medium">
          Agregar un nuevo vehiculo
        </Button>
      </div>
    </>
  );
};

export default Vehiculos;

