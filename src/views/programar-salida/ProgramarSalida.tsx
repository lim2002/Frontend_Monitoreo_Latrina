import React, { useEffect, useMemo, useState } from 'react';
import { Button, Label, Select, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Checkbox } from 'flowbite-react';
import { useAuth } from 'src/context/AuthContext';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type ClienteApi = {
  idCliente?: number | null;
  nombre?: string | null;
  representante?: string | null;
  telefono?: string | null;
  celular?: string | null;
  fax?: string | null;
  email?: string | null;
};

type UbicacionClienteApi = {
  idUbicacionCliente?: number | null;
  idCliente?: ClienteApi | null;
  ubicacion?: string | null;
  nombreDireccion?: string | null;
  status?: string | null;
};

type NotaSalidaApi = {
  idNotaSalida: number;
  cliente?: ClienteApi | null;
  ubicaciones?: Array<UbicacionClienteApi | null> | null;
  nroSalida?: number | string | null;
  codigoPedido?: number | string | null;
  fechaSalidaAprobada?: string | null;
  fechaSalida?: string | null;
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

type PedidoUbicacion = { id: string; nombre: string; raw: UbicacionClienteApi | null };
type Pedido = {
  id: string;
  nroSalida: string;
  nroPedido: string;
  cliente: string;
  clienteInfo?: ClienteApi | null;
  ubicaciones: PedidoUbicacion[];
  ubicacionSeleccionada?: string;
  seleccionado?: boolean;
  rawNota: NotaSalidaApi;
};

type VehiculoOption = { id: string; descripcion: string };
type ConductorOption = { id: string; nombre: string };

const formatAsInputDate = (date: Date): string => date.toISOString().split('T')[0];
const formatAsLocalDateTime = (date: Date): string => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const sanitize = (value?: string | null): string => (value ?? '').trim();

const isUbicacionValida = (ubicacion: UbicacionClienteApi | null | undefined): ubicacion is UbicacionClienteApi =>
  Boolean(ubicacion && ubicacion.idUbicacionCliente !== undefined && ubicacion.idUbicacionCliente !== null);

const coerceStringIdToNumber = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseMaybeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const extractProgramacionId = (payload: unknown): number | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const directId = parseMaybeNumber(record.idProgramacion ?? record.id_programacion);
  if (directId !== null) {
    return directId;
  }

  if (record.data) {
    const nested = extractProgramacionId(record.data);
    if (nested !== null) {
      return nested;
    }
  }

  if (record.programacion) {
    const nested = extractProgramacionId(record.programacion);
    if (nested !== null) {
      return nested;
    }
  }

  return null;
};

const ProgramarSalida: React.FC = () => {
  const { auth } = useAuth();
  const { token, authorizedFetch } = useAuthorizedApi();
  const [fechaEntrega, setFechaEntrega] = useState<string>(() => formatAsInputDate(new Date()));
  const [vehiculoId, setVehiculoId] = useState<string>('');
  const [conductorId, setConductorId] = useState<string>('');
  const [vehiculos, setVehiculos] = useState<VehiculoOption[]>([]);
  const [conductores, setConductores] = useState<ConductorOption[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const today = useMemo(() => formatAsInputDate(new Date()), []);
  const pedidosSeleccionados = useMemo(() => pedidos.filter(p => p.seleccionado), [pedidos]);


  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const obtenerNotasSalida = async () => {
      try {
        const response = await authorizedFetch('/api/v1/notas-salidas/obtener');

        if (!response.ok) {
          throw new Error(`Respuesta inesperada (${response.status})`);
        }

        const json = (await response.json()) as { data?: NotaSalidaApi[] };
        if (!isMounted) {
          return;
        }

        const notas = Array.isArray(json.data) ? json.data : [];
        setPedidos(
          notas.map((nota) => {
            const ubicacionesLimpias = (nota.ubicaciones ?? [])
              .filter(isUbicacionValida)
              .map((ubicacion) => ({
                id: String(ubicacion.idUbicacionCliente),
                nombre: sanitize(ubicacion.nombreDireccion) || 'Sin direccion',
                raw: ubicacion,
              }));

            return {
              id: String(nota.idNotaSalida),
              nroSalida: String(nota.nroSalida ?? ''),
              nroPedido: String(nota.codigoPedido ?? ''),
              cliente: sanitize(nota.cliente?.nombre) || 'Sin cliente',
              clienteInfo: nota.cliente ?? null,
              ubicaciones: ubicacionesLimpias,
              seleccionado: false,
              rawNota: nota,
            };
          }),
        );
      } catch (error) {
        console.error('Error al obtener notas de salida', error);
        if (isMounted) {
          setPedidos([]);
        }
      }
    };

    void obtenerNotasSalida();

    return () => {
      isMounted = false;
    };
  }, [authorizedFetch, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const fechaConsulta = fechaEntrega && fechaEntrega >= today ? fechaEntrega : today;

    const obtenerDisponibles = async () => {
      try {
        const [vehiculosResp, conductoresResp] = await Promise.all([
          authorizedFetch(`/api/v1/vehiculos/disponibles/${fechaConsulta}`),
          authorizedFetch(`/api/v1/usuarios/conductores/disponibles/${fechaConsulta}`),
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
          ? vehiculosJson.data.map((vehiculo) => ({
              id: String(vehiculo.idVehiculo),
              descripcion: [sanitize(vehiculo.marca), sanitize(vehiculo.modelo), sanitize(vehiculo.placa)]
                .filter(Boolean)
                .join(' - ') || `Vehiculo ${vehiculo.idVehiculo}`,
            }))
          : [];

        const conductoresOptions = Array.isArray(conductoresJson.data)
          ? conductoresJson.data.map((conductor) => ({
              id: String(conductor.idUsuario),
              nombre: sanitize(conductor.nombreCompleto) || 'Sin nombre',
            }))
          : [];

        setVehiculos(vehiculosOptions);
        setConductores(conductoresOptions);
        setVehiculoId((prev) => (vehiculosOptions.some((v) => v.id === prev) ? prev : ''));
        setConductorId((prev) => (conductoresOptions.some((c) => c.id === prev) ? prev : ''));
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

    void obtenerDisponibles();

    return () => {
      isMounted = false;
    };
  }, [authorizedFetch, fechaEntrega, today, token]);
  useEffect(() => {
    setVehiculoId("");
    setConductorId("");
  }, [fechaEntrega]);


  const actualizarUbicacion = (id: string, ubicacionId: string) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ubicacionSeleccionada: ubicacionId } : p)));
  };

  const toggleSeleccion = (id: string) => {
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, seleccionado: !p.seleccionado } : p)));
  };

  const guardarProgramacion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    if (!fechaEntrega) {
      setSubmitError('Selecciona una fecha de entrega.');
      return;
    }
    if (fechaEntrega < today) {
      setSubmitError('La fecha de entrega no puede ser anterior a hoy.');
      return;
    }

    if (!vehiculoId) {
      setSubmitError('Selecciona un vehiculo.');
      return;
    }

    if (!conductorId) {
      setSubmitError('Selecciona un conductor.');
      return;
    }

    const seleccionados = pedidosSeleccionados;
    if (!seleccionados.length) {
      setSubmitError('Selecciona al menos un pedido para programar.');
      return;
    }

    const pendientesDeUbicacion = seleccionados.filter((p) => !p.ubicacionSeleccionada);
    if (pendientesDeUbicacion.length) {
      setSubmitError('Selecciona una ubicacion para cada pedido marcado.');
      return;
    }

    const idVehiculo = coerceStringIdToNumber(vehiculoId);
    const idConductor = coerceStringIdToNumber(conductorId);
    const idAdministrador = auth.userId ?? null;

    if (idVehiculo === null) {
      setSubmitError('El identificador del vehiculo no es valido.');
      return;
    }

    if (idConductor === null) {
      setSubmitError('El identificador del conductor no es valido.');
      return;
    }

    if (idAdministrador === null) {
      setSubmitError('No se encontro el identificador del administrador.');
      return;
    }

    if (!token) {
      setSubmitError('No se encontro un token de autenticacion. Inicia sesion e intentalo nuevamente.');
      return;
    }

    if (typeof window !== 'undefined') {
      const confirmado = window.confirm('Estas seguro de crear la nueva programacion?');
      if (!confirmado) {
        return;
      }
    }

    const programacionPayload = {
      idProgramacion: null,
      idVehiculo,
      idConductor,
      idAdministrador,
      fechaCreacion: formatAsLocalDateTime(new Date()),
      estadoEntrega: 1,
      fechaEntrega,
      status: 1,
    };

    try {
      setIsSubmitting(true);



      const programacionResponse = await authorizedFetch('/api/v1/programacion-distribucion/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programacionPayload),
      });

      if (!programacionResponse.ok) {
        const errorText = await programacionResponse.text();
        throw new Error(
          errorText ? `Error al registrar la programacion: ${errorText}` : `Error al registrar la programacion (${programacionResponse.status}).`,
        );
      }

      let programacionJson: unknown = null;
      try {
        programacionJson = await programacionResponse.json();
      } catch (error) {
        console.warn('No se pudo leer la respuesta de programacion', error);
      }

      const programacionId = extractProgramacionId(programacionJson);
      if (programacionId === null) {
        throw new Error('La API no devolvio el identificador de la programacion.');
      }

      const salidasPayload = seleccionados.map((pedido) => {
        const ubicacion = pedido.ubicaciones.find((u) => u.id === pedido.ubicacionSeleccionada);
        if (!ubicacion || !ubicacion.raw) {
          throw new Error(`No se encontro la ubicacion seleccionada para el pedido ${pedido.nroPedido}.`);
        }

        return {
          idNotaSalida: pedido.rawNota.idNotaSalida,
          cliente: pedido.rawNota.cliente ?? null,
          ubicaciones: ubicacion.raw,
          nroSalida: pedido.rawNota.nroSalida ?? null,
          codigoPedido: pedido.rawNota.codigoPedido ?? null,
          fechaSalidaAprobada: pedido.rawNota.fechaSalidaAprobada ?? null,
          fechaSalida: pedido.rawNota.fechaSalida ?? null,
        };
      });

      const salidasResponse = await authorizedFetch(`/api/v1/salidas-programadas/add/${programacionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salidasPayload),
      });

      if (!salidasResponse.ok) {
        const errorText = await salidasResponse.text();
        throw new Error(
          errorText ? `Error al registrar las salidas: ${errorText}` : `Error al registrar las salidas (${salidasResponse.status}).`,
        );
      }

      setSubmitSuccess('Programacion registrada correctamente.');
      setPedidos((prev) =>
        prev.map((pedido) => ({
          ...pedido,
          seleccionado: false,
          ubicacionSeleccionada: undefined,
        })),
      );
    } catch (error) {
      console.error('Error al guardar la programacion', error);
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar la programacion.');
    } finally {
      setIsSubmitting(false);
    }
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
                  min={today}
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  className="form-control form-rounded-xl"
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block">Seleccione un vehiculo</Label>
                <Select
                  key={`vehiculo-${fechaEntrega}`}
                  value={vehiculoId}
                  onChange={(e) => setVehiculoId(e.target.value)}
                  className="select-md"
                  required
                >
                  <option value="" disabled>
                    {vehiculos.length ? 'Selecciona un vehiculo' : 'No hay vehiculos disponibles'}
                  </option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.descripcion}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Seleccione un conductor</Label>
                <Select
                  key={`conductor-${fechaEntrega}`}
                  value={conductorId}
                  onChange={(e) => setConductorId(e.target.value)}
                  className="select-md"
                  required
                >
                  <option value="" disabled>
                    {conductores.length ? 'Selecciona un conductor' : 'No hay conductores disponibles'}
                  </option>
                  {conductores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Button color="primary" type="submit" className="font-medium" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Agregar nueva Programacion'}
                </Button>
                {submitError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{submitError}</p>}
                {submitSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{submitSuccess}</p>}
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
                          {p.ubicaciones.map((u) => (
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
