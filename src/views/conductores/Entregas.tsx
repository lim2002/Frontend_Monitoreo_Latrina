import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';
import imgHomeConductor from '/src/assets/images/pictures/imagen-home-conductor.jpg';

type PuntoEntrega = {
  id: string;
  codigoPedido: string;
  orden: number;
};

const dataMock: PuntoEntrega[] = [
  { id: '1', codigoPedido: '9q39q', orden: 1 },
  { id: '2', codigoPedido: '9u943', orden: 2 },
  { id: '3', codigoPedido: '8833k', orden: 3 },
  { id: '4', codigoPedido: '84938', orden: 4 },
];

const Entregas: React.FC = () => {
  const navigate = useNavigate();
  const onVerUbicacion = (row: PuntoEntrega) => {
    // Placeholder para acción de mapa
    // Aquí podrías navegar a un mapa o abrir un modal
    console.log('Ver ubicación de', row);
  };

  const onVerDetalle = (row: PuntoEntrega) => {
    navigate(`/menu/entregas/${row.id}`);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Entregas</span>
      </div>

      {/* Encabezado del sistema */}
      <h3 className="text-2xl font-semibold text-center mb-4">Entregas del Dia</h3>

      {/* Banner/Imagen */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-4 mb-6">
        <div className="w-full h-40 md:h-52 rounded-lg overflow-hidden border border-gray-300/60 flex items-center justify-center bg-gray-50 dark:bg-dark">
          <img src={imgHomeConductor} alt="Entregas del día" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Puntos de Entregas */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <h5 className="card-title">Puntos de Entregas</h5>
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">Cod. Pedido</TableHeadCell>
              <TableHeadCell className="text-base">Orden de entrega</TableHeadCell>
              <TableHeadCell className="text-base">Opciones</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {dataMock.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap ps-6">
                    <span className="text-sm">{row.codigoPedido}</span>
                  </TableCell>
                  <TableCell>
                    <Badge color="lightsecondary" className="border border-secondary text-secondary">
                      {row.orden}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button title="Ubicación" className="hover:text-primary" onClick={() => onVerUbicacion(row)}>
                        <Icon icon="solar:map-point-wave-linear" width={20} />
                      </button>
                      <button title="Ver" className="hover:text-primary" onClick={() => onVerDetalle(row)}>
                        <Icon icon="solar:eye-linear" width={20} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Entregas;
