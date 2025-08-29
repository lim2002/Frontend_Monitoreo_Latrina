import React, { useMemo, useState } from 'react';
import { Button, Label, Select, TextInput, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Checkbox } from 'flowbite-react';

type Vehiculo = { id: string; desc: string };
type Conductor = { id: string; nombre: string };
type Pedido = {
  id: string;
  nroSalida: string;
  nroPedido: string;
  cliente: string;
  ubicaciones: { id: string; nombre: string }[];
  ubicacionSeleccionada?: string;
  seleccionado?: boolean;
};

const vehiculosMock: Vehiculo[] = [
  { id: 'v1', desc: 'Mercedes-Benz, Actros 2648, XFHO 133' },
  { id: 'v2', desc: 'Mercedes-Benz, Axor 2528, FHDF 304' },
  { id: 'v3', desc: 'Volvo, Volvo FH 540, GJKG 548' },
];

const conductoresMock: Conductor[] = [
  { id: 'c1', nombre: 'Raul Romero' },
  { id: 'c2', nombre: 'Pedro Carvajal' },
  { id: 'c3', nombre: 'Alberto Garcia' },
];

const pedidosMock: Pedido[] = [
  {
    id: 'p1',
    nroSalida: '932948',
    nroPedido: '21828',
    cliente: 'Jorge Ramirez',
    ubicaciones: [
      { id: 'u1', nombre: 'Casa Central' },
      { id: 'u2', nombre: 'Depósito Norte' },
    ],
    seleccionado: false,
  },
  {
    id: 'p2',
    nroSalida: '932948',
    nroPedido: '21828',
    cliente: 'Pedro Romero',
    ubicaciones: [
      { id: 'u3', nombre: 'Sucursal Centro' },
      { id: 'u4', nombre: 'Sucursal Sur' },
    ],
    seleccionado: true,
  },
  {
    id: 'p3',
    nroSalida: '932948',
    nroPedido: '21828',
    cliente: 'Fabrizio Nogales',
    ubicaciones: [
      { id: 'u5', nombre: 'Planta Industrial' },
      { id: 'u6', nombre: 'Depósito Central' },
    ],
    seleccionado: true,
  },
  {
    id: 'p4',
    nroSalida: '932948',
    nroPedido: '21828',
    cliente: 'Claudia Silva',
    ubicaciones: [
      { id: 'u7', nombre: 'Barrio Norte' },
      { id: 'u8', nombre: 'Barrio Este' },
    ],
    seleccionado: false,
  },
  {
    id: 'p5',
    nroSalida: '932948',
    nroPedido: '21828',
    cliente: 'Adriana Guitierrez',
    ubicaciones: [
      { id: 'u9', nombre: 'Barrio Centro' },
      { id: 'u10', nombre: 'Oficina Comercial' },
    ],
    seleccionado: false,
  },
];

const ProgramarSalida: React.FC = () => {
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [vehiculoId, setVehiculoId] = useState<string>('');
  const [conductorId, setConductorId] = useState<string>('');
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosMock);

  const pedidosSeleccionados = useMemo(() => pedidos.filter(p => p.seleccionado), [pedidos]);

  const actualizarUbicacion = (id: string, ubicacionId: string) => {
    setPedidos(prev => prev.map(p => (p.id === id ? { ...p, ubicacionSeleccionada: ubicacionId } : p)));
  };

  const toggleSeleccion = (id: string) => {
    setPedidos(prev => prev.map(p => (p.id === id ? { ...p, seleccionado: !p.seleccionado } : p)));
  };

  const guardarProgramacion = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí enviarías: fechaEntrega, vehiculoId, conductorId, pedidosSeleccionados con su ubicacionSeleccionada
    // Por ahora solo hacemos un log comentado.
    // console.log({ fechaEntrega, vehiculoId, conductorId, pedidos: pedidosSeleccionados });
  };

  return (
    <form onSubmit={guardarProgramacion}>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">ProgramacionSalida</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Programación de Distribución de Salidas</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Columna izquierda: datos */}
          <div className="xl:col-span-6 col-span-12">
            <h6 className="text-base font-medium mb-4">Ingrese los datos.</h6>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-2 block">Ingrese fecha entrega</Label>
                <TextInput type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} className="form-control form-rounded-xl" required />
              </div>
              <div>
                <Label className="mb-2 block">Seleccione un vehículo</Label>
                <Select value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)} className="select-md" required>
                  <option value="" disabled>Selecciona un vehículo</option>
                  {vehiculosMock.map(v => (
                    <option key={v.id} value={v.id}>{v.desc}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Seleccione un conductor</Label>
                <Select value={conductorId} onChange={(e) => setConductorId(e.target.value)} className="select-md" required>
                  <option value="" disabled>Selecciona un conductor</option>
                  {conductoresMock.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Button color={'primary'} type="submit" className="font-medium">Agregar nueva Programación</Button>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="xl:col-span-1 col-span-12 hidden xl:block">
            <div className="w-px h-full bg-black/10 mx-auto" />
          </div>

          {/* Columna derecha: tabla de pedidos */}
          <div className="xl:col-span-5 col-span-12">
            <h6 className="text-base font-medium mb-4">Seleccione los pedidos a entregar.</h6>
            <div className="overflow-x-auto">
              <Table hoverable>
                <TableHead className="border-b border-gray-300">
                  <TableHeadCell className="p-6 text-base">Nro. de salida</TableHeadCell>
                  <TableHeadCell className="text-base">Nro. de pedido</TableHeadCell>
                  <TableHeadCell className="text-base">Cliente</TableHeadCell>
                  <TableHeadCell className="text-base">Ubicación cliente</TableHeadCell>
                  <TableHeadCell className="text-base">Seleccionar</TableHeadCell>
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
                        >
                          <option value="" disabled>Elige ubicación</option>
                          {p.ubicaciones.map(u => (
                            <option key={u.id} value={u.id}>{u.nombre}</option>
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

