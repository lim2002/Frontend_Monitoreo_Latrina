import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate, useParams } from 'react-router';

type Producto = {
  id: string;
  codigo: string;
  orden: number;
  estado: 'Entregado' | 'Observacion' | 'Pendiente';
  nombre: string;
  cantidad: string; // ej: "20u paquetes"
  precioUnitario: number; // 3.20
  descripcion: string;
};

const productosMock: Producto[] = [
  {
    id: 'p1',
    codigo: 'XHSH',
    orden: 1,
    estado: 'Entregado',
    nombre: 'Papel higiénico perlita',
    cantidad: '20u paquetes',
    precioUnitario: 3.2,
    descripcion: 'Papel de doble hoja, ecológico, de la empresa',
  },
  {
    id: 'p2',
    codigo: 'DKJDJF',
    orden: 2,
    estado: 'Entregado',
    nombre: 'Papel toalla premium',
    cantidad: '10u paquetes',
    precioUnitario: 5.1,
    descripcion: 'Toalla absorbente multiuso',
  },
  {
    id: 'p3',
    codigo: 'SDLFLD',
    orden: 3,
    estado: 'Observacion',
    nombre: 'Servilletas eco',
    cantidad: '15u paquetes',
    precioUnitario: 2.3,
    descripcion: 'Servilletas recicladas, 100 serv. por paquete',
  },
  {
    id: 'p4',
    codigo: 'SSEEED',
    orden: 4,
    estado: 'Pendiente',
    nombre: 'Papel higiénico institucional',
    cantidad: '8u cajas',
    precioUnitario: 22.0,
    descripcion: 'Rollos grandes para dispensadores',
  },
];

const badgeForEstado = (estado: Producto['estado']) => {
  switch (estado) {
    case 'Entregado':
      return { badge: 'lightsuccess', cls: 'border-success text-success' };
    case 'Observacion':
      return { badge: 'lightwarning', cls: 'border-warning text-warning' };
    default:
      return { badge: 'lightsecondary', cls: 'border-secondary text-secondary' };
  }
};

const EntregaDetalle: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Producto[]>(productosMock);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Producto | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const datosPedido = useMemo(
    () => ({
      cliente: 'Adriana Gutierrez',
      celular: '73372931',
      ubicacion: 'Calle 2, Obrajes #833',
      codigoPedido: id ?? '—',
    }),
    [id]
  );

  const setEstado = (pid: string, estado: Producto['estado']) => {
    setRows((prev) => prev.map((r) => (r.id === pid ? { ...r, estado } : r)));
  };

  const onVerProducto = (row: Producto) => {
    setSelected(row);
    setOpen(true);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Entrega</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Detalle</span>
      </div>

      {/* Título */}
      <h3 className="text-2xl font-semibold text-center mb-4">Detalles de Entregas de Hoy</h3>

      {/* Datos del pedido */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <h5 className="card-title mb-3">Datos del Pedido</h5>
        <div className="grid grid-cols-12 gap-4 text-sm">
          <div className="col-span-12 md:col-span-6">
            <div><span className="font-semibold">Cliente: </span>{datosPedido.cliente}</div>
            <div><span className="font-semibold">Celular: </span>{datosPedido.celular}</div>
          </div>
          <div className="col-span-12 md:col-span-6">
            <div><span className="font-semibold">Cod. Pedido: </span>{datosPedido.codigoPedido}</div>
            <div><span className="font-semibold">Detalle ubicación: </span>{datosPedido.ubicacion}</div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <h5 className="card-title">Productos</h5>
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">Código</TableHeadCell>
              <TableHeadCell className="text-base">Orden entrega</TableHeadCell>
              <TableHeadCell className="text-base">Estado entrega</TableHeadCell>
              <TableHeadCell className="text-base">Opciones</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {rows.map((row) => {
                const c = badgeForEstado(row.estado);
                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap ps-6">
                      <span className="text-sm">{row.codigo}</span>
                    </TableCell>
                    <TableCell>
                      <Badge color="lightsecondary" className="border border-secondary text-secondary">{row.orden}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={c.badge} className={`border ${c.cls}`}>{row.estado}</Badge>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                      <button title="Ver" className="hover:text-primary" onClick={() => onVerProducto(row)}>
                        <Icon icon="solar:eye-linear" width={22} />
                      </button>
                      <button title="Observación" className="hover:text-warning" onClick={() => navigate(`/menu/entregas/${id}/observacion/${row.id}`)}>
                        <Icon icon="solar:notes-linear" width={22} />
                      </button>
                    </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmar entrega global */}
      <div className="mt-6 flex items-center justify-end">
        <Button color={'gray'} className="px-6" onClick={() => setOpenConfirm(true)}>Confirmar Entrega</Button>
      </div>

      {/* Modal detalle producto (implementación ligera para compatibilidad) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-darkgray rounded-xl shadow-lg w-full max-w-xl">
            <div className="px-6 py-4 border-b border-black/10">
              <h4 className="text-lg font-semibold">Detalle producto pedido</h4>
            </div>
            <div className="p-6 max-h-[70vh] overflow-auto">
              {selected && (
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">cod. producto: </span>{selected.codigo}</div>
                  <div><span className="font-semibold">Producto: </span>{selected.nombre}</div>
                  <div><span className="font-semibold">Cantidad: </span>{selected.cantidad}</div>
                  <div><span className="font-semibold">Precio unitario: </span>{selected.precioUnitario.toFixed(2)}</div>
                  <div><span className="font-semibold">Descripción: </span>{selected.descripcion}</div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-black/10 flex justify-end">
              <Button color={'gray'} onClick={() => setOpen(false)}>OK</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de entrega */}
      {openConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-darkgray rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-black/10">
              <h4 className="text-lg font-semibold">Alerta</h4>
            </div>
            <div className="p-6">
              <p className="text-sm text-dark/90">
                ¿Confirmar que el pedido fue entregado y las observaciones registradas?
              </p>
            </div>
            <div className="flex">
              <button
                className="flex-1 py-3 text-sm border-t border-r border-black/10 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpenConfirm(false)}
              >
                No
              </button>
              <button
                className="flex-1 py-3 text-sm border-t border-black/10 text-primary hover:bg-lightprimary/40"
                onClick={() => {
                  // Aquí integrar con API para confirmar entrega
                  console.log('Entrega confirmada para salida', id, rows);
                  setOpenConfirm(false);
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntregaDetalle;
