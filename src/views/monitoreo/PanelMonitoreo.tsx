import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Button, TextInput, Badge } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';

type Item = {
  id: string;
  fecha: string; // ISO YYYY-MM-DD
  nroSalida: string;
  estado: 'Terminado' | 'En proceso' | 'Pendiente';
};

const dataMock: Item[] = [
  { id: '1', fecha: '2025-05-10', nroSalida: '1129994-444', estado: 'Terminado' },
  { id: '2', fecha: '2025-05-14', nroSalida: '1129994-584', estado: 'Terminado' },
  { id: '3', fecha: '2025-05-20', nroSalida: '1129994-854', estado: 'En proceso' },
];

const formatDDMMYYYY = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const colorForEstado = (estado: Item['estado']) => {
  switch (estado) {
    case 'Terminado':
      return { badge: 'lightsuccess', cls: 'border-success text-success' };
    case 'En proceso':
      return { badge: 'lightwarning', cls: 'border-warning text-warning' };
    default:
      return { badge: 'lightsecondary', cls: 'border-secondary text-secondary' };
  }
};

const PanelMonitoreo: React.FC = () => {
  const [q, setQ] = useState('');
  const [desde, setDesde] = useState(''); // YYYY-MM-DD
  const [hasta, setHasta] = useState(''); // YYYY-MM-DD
  const navigate = useNavigate();

  const filtrados = useMemo(() => {
    return dataMock.filter((it) => {
      const inQuery = (() => {
        if (!q.trim()) return true;
        const txt = q.toLowerCase();
        return (
          it.nroSalida.toLowerCase().includes(txt) ||
          formatDDMMYYYY(it.fecha).toLowerCase().includes(txt) ||
          it.fecha.includes(txt)
        );
      })();

      const inDesde = desde ? it.fecha >= desde : true;
      const inHasta = hasta ? it.fecha <= hasta : true;
      return inQuery && inDesde && inHasta;
    });
  }, [q, desde, hasta]);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">PanelMonitoreo</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Panel de Monitoreo</h3>

      {/* Filtros */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 col-span-12">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
                <Icon icon="solar:magnifer-linear" width={20} />
              </span>
              <TextInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ingresa Nro. de salida"
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
          <div className="md:col-span-2 col-span-12">
            <Button color={'gray'} onClick={() => { setQ(''); setDesde(''); setHasta(''); }} className="w-full">Limpiar</Button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <h5 className="card-title text-center">Salidas programadas en curso</h5>
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">Fecha de Distribución</TableHeadCell>
              <TableHeadCell className="text-base">Nro. Salida</TableHeadCell>
              <TableHeadCell className="text-base">Estado</TableHeadCell>
              <TableHeadCell className="text-base">Opciones</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {filtrados.map((it) => {
                const c = colorForEstado(it.estado);
                return (
                  <TableRow key={it.id}>
                    <TableCell className="whitespace-nowrap ps-6">
                      <span className="text-sm">{formatDDMMYYYY(it.fecha)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{it.nroSalida}</span>
                    </TableCell>
                    <TableCell>
                      <Badge color={c.badge} className={`border ${c.cls}`}>{it.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button title="Ver" className="hover:text-primary" onClick={() => navigate(`/menu/panel-monitoreo/salidas/${it.id}`)}>
                          <Icon icon="solar:eye-linear" width={20} />
                        </button>
                        <button title="Eliminar" className="hover:text-error">
                          <Icon icon="solar:trash-bin-minimalistic-linear" width={20} />
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
    </>
  );
};

export default PanelMonitoreo;
