import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Label, Select, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Checkbox } from 'flowbite-react';
import { useAuth } from 'src/context/AuthContext';

type NotaSalidaApi = {
  idNotaSalida: number;
  cliente?: {
    nombre?: string | null;
  } | null;
  ubicaciones?: Array<{
    idUbicacionCliente?: number | null;
    nombreDireccion?: string | null;
  }> | null;
  nroSalida?: number | string | null;
  codigoPedido?: number | string | null;
};

type VehiculoApi = {
  idVehiculo: number | string;
  marca?: string | null;
  modelo?: string | null;
  placa?: string | null;
};

type ConductorApi = {
  idUsuario: number | string;
  nombreCompleto?: string | null;
};

type Pedido = {
  id: string;
  nroSalida: string;
  nroPedido: string;
  cliente: string;
  ubicaciones: { id: string; nombre: string }[];
  ubicacionSeleccionada?: string;
  seleccionado?: boolean;
};

type VehiculoOption = { id: string; descripcion: string };
type ConductorOption = { id: string; nombre: string };

const formatAsInputDate = (date: Date): string => date.toISOString().split('T')[0];

const sanitize = (value?: string | null): string => (value ?? '').trim();

const resolveApiBaseUrl = (): string => {
  const env = (import.meta.env as unknown as Record<string, string | undefined>)?.VITE_API_BASE_URL;
  if (env) {
    return env.replace(/\/$/, '');
  }
  return 'http://localhost:8080';
};

const ProgramarSalida: React.FC = () => {
  const { auth } = useAuth();
  const [fechaEntrega, setFechaEntrega] = useState<string>(() => formatAsInputDate(new Date()));
  const [vehiculoId, setVehiculoId] = useState<string>('');
  const [conductorId, setConductorId] = useState<string>('');
  const [vehiculos, setVehiculos] = useState<VehiculoOption[]>([]);
  const [conductores, setConductores] = useState<ConductorOption[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const apiBaseUrl = useMemo(() => resolveApiBaseUrl(), []);
  const authHeaders = useMemo<HeadersInit | undefined>(
    () => (auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined),
    [auth.token],
  );
  const pedidosSeleccionados = useMemo(() => pedidos.filter(p => p.seleccionado), [pedidos]);

  const buildApiUrl = useCallback(
    (path: string) => {
      const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return `${base}${normalized}`;
    },
    [apiBaseUrl],
  );

  useEffect(() => {
    let isMounted = true;

    const obtenerNotasSalida = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/v1/notas-salidas/obtener'), {
          headers: authHeaders,
        });

        if (!response.ok) {
          throw new Error(`Respuesta inesperada (${response.status})`);
        }

        const json = await response.json() as { data?: NotaSalidaApi[] };
        if (!isMounted) {
          return;
        }

        const notas = Array.isArray(json.data) ? json.data : [];
        setPedidos(
          notas.map(nota => ({
            id: String(nota.idNotaSalida),
            nroSalida: String(nota.nroSalida ?? ''),
            nroPedido: String(nota.codigoPedido ?? ''),
            cliente: sanitize(nota.cliente?.nombre) || 'Sin cliente',
            ubicaciones: (nota.ubicaciones ?? [])
              .filter(ubicacion => ubicacion?.idUbicacionCliente !== undefined && ubicacion?.idUbicacionCliente !== null)
              .map(ubicacion => ({
                id: String(ubicacion.idUbicacionCliente),
                nombre: sanitize(ubicacion.nombreDireccion) || 'Sin direccion',
              })),
            seleccionado: false,
          })),
        );
      } catch (error) {
        console.error('Error al obtener notas de salida', error);
        if (isMounted) {
          setPedidos([]);
        }
      }
    };

    obtenerNotasSalida();

    return () => {
      isMounted = false;
    };
  }, [authHeaders, buildApiUrl]);

  useEffect(() => {
    let isMounted = true;

    const fechaConsulta = fechaEntrega || formatAsInputDate(new Date());

    const obtenerDisponibles = async () => {
      try {
        const [vehiculosResp, conductoresResp] = await Promise.all([
          fetch(buildApiUrl(`/api/v1/vehiculos/disponibles/${fechaConsulta}`), {
            headers: authHeaders,
          }),
          fetch(buildApiUrl(`/api/v1/usuarios/conductores/disponibles/${fechaConsulta}`), {
            headers: authHeaders,
          }),
        ]);

        if (!vehiculosResp.ok) {
          throw new Error(`Error al obtener vehiculos (${vehiculosResp.status})`);
        }

        if (!conductoresResp.ok) {
          throw new Error(`Error al obtener conductores (${conductoresResp.status})`);
        }

        const [vehiculosJson, conductoresJson] = await Promise.all([
          vehiculosResp.json() as Promise<{ data?: VehiculoApi[] }>,
          conductoresResp.json() as Promise<{ data?: ConductorApi[] }>,
        ]);

        if (!isMounted) {
          return;
        }

        const vehiculosOptions = Array.isArray(vehiculosJson.data)
          ? vehiculosJson.data.map(vehiculo => ({
              id: String(vehiculo.idVehiculo),
              descripcion: [sanitize(vehiculo.marca), sanitize(vehiculo.modelo), sanitize(vehiculo.placa)]
                .filter(Boolean)
                .join(' - ') || `Vehiculo ${vehiculo.idVehiculo}`,
            }))
          : [];

        const conductoresOptions = Array.isArray(conductoresJson.data)
          ? conductoresJson.data.map(conductor => ({
              id: String(conductor.idUsuario),
              nombre: sanitize(conductor.nombreCompleto) || 'Sin nombre',
            }))
          : [];

        setVehiculos(vehiculosOptions);
        setConductores(conductoresOptions);
        setVehiculoId(prev => vehiculosOptions.some(v => v.id === prev) ? prev : '');
        setConductorId(prev => conductoresOptions.some(c => c.id === prev) ? prev : '');
      } catch (error) {
        console.error('Error al obtener vehiculos o conductores', error);
        if (isMounted) {
          setVehiculos([]);
          setConductores([]);
          setVehiculoId('');
          setConductorId('');
        }
      }
    };

    obtenerDisponibles();

    return () => {
      isMounted = false;
    };
  }, [authHeaders, buildApiUrl, fechaEntrega]);

  const actualizarUbicacion = (id: string, ubicacionId: string) => {
    setPedidos(prev => prev.map(p => (p.id === id ? { ...p, ubicacionSeleccionada: ubicacionId } : p)));
  };

  const toggleSeleccion = (id: string) => {
    setPedidos(prev => prev.map(p => (p.id === id ? { ...p, seleccionado: !p.seleccionado } : p)));
  };

  const guardarProgramacion = (e: React.FormEvent) => {
    e.preventDefault();
    // En este punto se tienen: fechaEntrega, vehiculoId, conductorId y pedidosSeleccionados con su ubicacionSeleccionada.
    // console.log({ fechaEntrega, vehiculoId, conductorId, pedidos: pedidosSeleccionados });
  };

  return (
    <form onSubmit={guardarProgramacion}>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">ProgramacionSalida</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Programacion de Distribucion de Salidas</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="xl:col-span-6 col-span-12">
            <h6 className="text-base font-medium mb-4">Ingrese los datos.</h6>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-2 block">Ingrese fecha entrega</Label>
                <TextInput
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="form-control form-rounded-xl"
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block">Seleccione un vehiculo</Label>
                <Select
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(e.target.value)}
                  className="select-md"
                  required
                >
                  <option value="" disabled>
                    {vehiculos.length ? 'Selecciona un vehiculo' : 'No hay vehiculos disponibles'}
                  </option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.descripcion}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Seleccione un conductor</Label>
                <Select
                  value={conductorId}
                  onChange={(e) => setConductorId(e.target.value)}
                  className="select-md"
                  required
                >
                  <option value="" disabled>
                    {conductores.length ? 'Selecciona un conductor' : 'No hay conductores disponibles'}
                  </option>
                  {conductores.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Button color="primary" type="submit" className="font-medium">
                  Agregar nueva Programacion
                </Button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 col-span-12 hidden xl:block">
            <div className="w-px h-full bg-black/10 mx-auto" />
          </div>

          <div className="xl:col-span-5 col-span-12">
            <h6 className="text-base font-medium mb-4">Seleccione los pedidos a entregar.</h6>
            <div className="overflow-x-auto">
              <Table hoverable>
                <TableHead className="border-b border-gray-300">
                  <TableRow>
                    <TableHeadCell className="p-6 text-base">Nro. de salida</TableHeadCell>
                    <TableHeadCell className="text-base">Nro. de pedido</TableHeadCell>
                    <TableHeadCell className="text-base">Cliente</TableHeadCell>
                    <TableHeadCell className="text-base">Ubicacion cliente</TableHeadCell>
                    <TableHeadCell className="text-base">Seleccionar</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y divide-gray-300">
                  {pedidos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <span className="text-sm">{p.nroSalida}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{p.nroPedido}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{p.cliente}</span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.ubicacionSeleccionada || ''}
                          onChange={(e) => actualizarUbicacion(p.id, e.target.value)}
                          className="select-md"
                          disabled={p.ubicaciones.length === 0}
                        >
                          <option value="" disabled>
                            {p.ubicaciones.length ? 'Elige ubicacion' : 'Sin ubicaciones'}
                          </option>
                          {p.ubicaciones.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.nombre}
                            </option>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={!!p.seleccionado} onChange={() => toggleSeleccion(p.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProgramarSalida;

