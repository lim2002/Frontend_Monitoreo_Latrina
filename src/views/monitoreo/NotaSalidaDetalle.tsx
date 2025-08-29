import React, { useState } from 'react';
import { Table } from 'flowbite-react';
import { TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router';

type Item = {
  id: string;
  codigo: string;
  producto: string;
  cantidad: number;
  descripcion: string;
  estado: 'Entregado' | 'Cancelado';
  observacion?: string;
};

const dataNota: Record<string, { cliente: string; fecha: string; items: Item[] }> = {
  n1: {
    cliente: 'Jorge Ramirez',
    fecha: '2025-05-24',
    items: [
      {
        id: 'i1',
        codigo: 'XHDHF',
        producto: 'Papel higienico Perlita',
        cantidad: 200,
        descripcion: 'Paquetes x 4 unidades',
        estado: 'Entregado',
        observacion: 'Se entrego completo en porteria 2. Firmo J. Ramirez.',
      },
      {
        id: 'i2',
        codigo: 'KLMNP',
        producto: 'Detergente Bolivar',
        cantidad: 150,
        descripcion: 'Cajas x 12 unidades (1kg c/u)',
        estado: 'Cancelado',
        observacion: 'Cliente solicito reprogramacion por inventario, se cancela parcial.',
      },
      { id: 'i3', codigo: 'QWERT', producto: 'Leche en polvo PIL', cantidad: 80, descripcion: 'Bolsas x 1kg', estado: 'Entregado' },
      { id: 'i4', codigo: 'ZXCVL', producto: 'Cloro Clorox', cantidad: 120, descripcion: 'Bidones x 5 litros', estado: 'Entregado' },
      {
        id: 'i5',
        codigo: 'POIUY',
        producto: 'Toallas Nova',
        cantidad: 90,
        descripcion: 'Paquetes x 10 unidades',
        estado: 'Cancelado',
        observacion: 'Producto danado en transito, devuelto al almacen.',
      },
      { id: 'i6', codigo: 'MNBVC', producto: 'Jabon en barra Dove', cantidad: 300, descripcion: 'Cajas x 24 unidades', estado: 'Entregado' },
    ],
  },
};

const fmt = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const NotaSalidaDetalle: React.FC = () => {
  const navigate = useNavigate();
  const { notaId } = useParams();
  const nota = dataNota[notaId || 'n1'] || dataNota['n1'];

  const [openObs, setOpenObs] = useState(false);
  const [obsText, setObsText] = useState('');

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">PanelMonitoreo</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Salidas</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">DetalleSalida</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Detalle de Nota de Salida</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        {/* Cabecera del cliente */}
        <div className="border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
          <p className="text-sm"><span className="font-semibold">Cliente:</span> {nota.cliente}</p>
          <p className="text-sm"><span className="font-semibold">Fecha de entrega:</span> {fmt(nota.fecha)}</p>
        </div>

        {/* Tabla de productos */}
        <div className="mt-6 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">Codigo</TableHeadCell>
              <TableHeadCell className="text-base">Producto</TableHeadCell>
              <TableHeadCell className="text-base">Cantidad</TableHeadCell>
              <TableHeadCell className="text-base">Descripcion</TableHeadCell>
              <TableHeadCell className="text-base">Estado</TableHeadCell>
              <TableHeadCell className="text-base">Observacion</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {nota.items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="whitespace-nowrap ps-6">{it.codigo}</TableCell>
                  <TableCell>{it.producto}</TableCell>
                  <TableCell>{it.cantidad}</TableCell>
                  <TableCell>{it.descripcion}</TableCell>
                  <TableCell>
                    <Badge
                      color={it.estado === 'Entregado' ? 'lightsuccess' : 'lighterror'}
                      className={`border ${it.estado === 'Entregado' ? 'border-success text-success' : 'border-error text-error'}`}
                    >
                      {it.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {it.observacion ? (
                      <Button
                        color={'lightprimary'}
                        size="sm"
                        className="px-3 py-1"
                        onClick={() => {
                          setObsText(it.observacion || '');
                          setOpenObs(true);
                        }}
                      >
                        Ver
                      </Button>
                    ) : (
                      <span className="text-dark/50 text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end">
          <Button color={'gray'} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>

      {/* Modal Observacion (custom overlay sin dependencia) */}
      {openObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-darkgray rounded-xl shadow-lg w-full max-w-xl">
            <div className="px-6 py-4 border-b border-black/10">
              <h4 className="text-lg font-semibold">OBSERVACION</h4>
            </div>
            <div className="p-6 max-h-[70vh] overflow-auto">
              <div className="text-sm leading-6 whitespace-pre-wrap">{obsText}</div>
            </div>
            <div className="px-6 py-4 border-t border-black/10 flex justify-end">
              <Button color={'primary'} onClick={() => setOpenObs(false)}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotaSalidaDetalle;
