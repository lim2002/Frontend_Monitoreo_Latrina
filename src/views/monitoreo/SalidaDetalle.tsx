import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput, Badge, Button } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate, useParams } from 'react-router';

type Nota = { id: string; cliente: string; orden: number; estado: 'entregado' | 'en proceso' | 'pendiente' };
type Salida = {
  id: string;
  fechaEntrega: string; // ISO
  conductor: string;
  vehiculo: string;
  notas: Nota[];
};

const dataPorSalida: Record<string, Salida> = {
  '1': {
    id: '1',
    fechaEntrega: '2025-05-24',
    conductor: 'Roberto Espinoza',
    vehiculo: 'Mercedes-Benz Actros 2648 XFHO 133',
    notas: [
      { id: 'n1', cliente: 'Giacomo Guilizzoni', orden: 1, estado: 'entregado' },
      { id: 'n2', cliente: 'Marco Botton Tuttofare', orden: 2, estado: 'entregado' },
      { id: 'n3', cliente: 'Mariah Maclachlan Better Half', orden: 3, estado: 'en proceso' },
    ],
  },
  '2': {
    id: '2',
    fechaEntrega: '2025-05-25',
    conductor: 'Ana Rojas',
    vehiculo: 'Volvo FH 540 GJKG 548',
    notas: [
      { id: 'n4', cliente: 'Jorge Ramirez', orden: 1, estado: 'entregado' },
      { id: 'n5', cliente: 'Pedro Romero', orden: 2, estado: 'en proceso' },
    ],
  },
  '3': {
    id: '3',
    fechaEntrega: '2025-05-26',
    conductor: 'Luis Pérez',
    vehiculo: 'Mercedes-Benz Axor 2528 FHDF 304',
    notas: [
      { id: 'n6', cliente: 'Claudia Silva', orden: 1, estado: 'pendiente' },
    ],
  },
};

const fmt = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const badgeFor = (estado: Nota['estado']) => {
  if (estado === 'entregado') return { badge: 'lightsuccess', cls: 'border-success text-success' };
  if (estado === 'en proceso') return { badge: 'lightwarning', cls: 'border-warning text-warning' };
  return { badge: 'lightsecondary', cls: 'border-secondary text-secondary' };
};

const SalidaDetalle: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const salida = dataPorSalida[id || '1'];
  const [q, setQ] = useState('');

  const notas = salida?.notas || [];
  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return notas;
    return notas.filter(n => n.cliente.toLowerCase().includes(t));
  }, [q, notas]);

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

      {/* Buscador */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <div className="relative w-full max-w-xl mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
            <Icon icon="solar:magnifer-linear" width={20} />
          </span>
          <TextInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ingresa nombre de cliente"
            className="pl-9 form-control form-rounded-xl"
          />
        </div>
      </div>

      {/* Notas de salida */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <h5 className="card-title text-center">Notas de salida</h5>
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">Cliente</TableHeadCell>
              <TableHeadCell className="text-base">Orden de entrega</TableHeadCell>
              <TableHeadCell className="text-base">Estado de la entrega</TableHeadCell>
              <TableHeadCell className="text-base">Detalle</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {filtradas.map((n) => {
                const b = badgeFor(n.estado);
                return (
                  <TableRow key={n.id}>
                    <TableCell className="whitespace-nowrap ps-6">
                      <span className="text-sm">{n.cliente}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{n.orden}</span>
                    </TableCell>
                    <TableCell>
                      <Badge color={b.badge} className={`border ${b.cls}`}>{n.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        title="Ver detalle"
                        className="hover:text-primary"
                        onClick={() => navigate(`/menu/panel-monitoreo/salidas/${salida?.id || id}/detalle/${n.id}`)}
                      >
                        <Icon icon="solar:eye-linear" width={20} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Resumen */}
        <div className="mt-6 border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
          <p className="text-sm"><span className="font-semibold">Conductor:</span> {salida?.conductor || '-'}</p>
          <p className="text-sm"><span className="font-semibold">Fecha de entrega:</span> {salida ? fmt(salida.fechaEntrega) : '-'}</p>
          <p className="text-sm"><span className="font-semibold">Vehículo:</span> {salida?.vehiculo || '-'}</p>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex items-center justify-between">
          <Button color={'primary'} className="font-medium" onClick={() => navigate(`/menu/panel-monitoreo/salidas/${salida?.id || id}/recorrido`)}>
            Ver recorrido
          </Button>
          <Button color={'gray'} onClick={() => navigate(-1)}>Volver</Button>
        </div>
      </div>
    </>
  );
};

export default SalidaDetalle;
