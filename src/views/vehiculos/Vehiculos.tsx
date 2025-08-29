import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';

type Vehiculo = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  activo: boolean;
};

const dataInicial: Vehiculo[] = [
  { id: '1', marca: 'Mercedes-Benz', modelo: 'Actros 2648', placa: 'XFHO 133', activo: true },
  { id: '2', marca: 'Mercedes-Benz', modelo: 'Axor 2528', placa: 'FHDF 304', activo: true },
  { id: '3', marca: 'Volvo', modelo: 'Volvo FH 540', placa: 'GJKG 548', activo: true },
  { id: '4', marca: 'Volvo', modelo: 'Volvo FMX', placa: 'FHGJ 8998', activo: false },
  { id: '5', marca: 'FAW', modelo: 'FAW J6P', placa: 'HGHG 099', activo: true },
  { id: '6', marca: 'Hyundai', modelo: 'Hyundai Xcient', placa: 'JGJH 664', activo: true },
];

const Vehiculos: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(dataInicial);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehiculos;
    return vehiculos.filter(v =>
      v.placa.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q)
    );
  }, [vehiculos, query]);

  const toggleActivo = (id: string) => {
    setVehiculos(prev => prev.map(v => (v.id === id ? { ...v, activo: !v.activo } : v)));
  };

  const handleAgregar = () => { navigate('/menu/vehiculos/nuevo'); };

  const onAgregar = () => {
    // Aquí podrías navegar a un form: /menu/vehiculos/nuevo
    // o abrir un modal. Por ahora, dejamos un placeholder.
    // console.log('Agregar vehículo');
  };

  return (
    <>
      {/* Breadcrumb / Seguimiento de navegación */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Vehículos</span>
      </div>
      {/* Buscador */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <h5 className="card-title text-center">Vehículos</h5>
        <div className="flex items-center gap-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
              <Icon icon="solar:magnifer-linear" width={20} />
            </span>
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa placa o modelo del vehículo"
              className="pl-9 form-control form-rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Vehículos */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">Marca</TableHeadCell>
              <TableHeadCell className="text-base">Modelo</TableHeadCell>
              <TableHeadCell className="text-base">Placa</TableHeadCell>
              <TableHeadCell className="text-base">Estado</TableHeadCell>
              <TableHeadCell className="text-base">Opciones</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {filtrados.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="whitespace-nowrap ps-6">
                    <span className="text-sm">{v.marca}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{v.modelo}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{v.placa}</span>
                  </TableCell>
                  <TableCell>
                    <Badge color={v.activo ? 'lightsuccess' : 'lighterror'} className={`border ${v.activo ? 'border-success text-success' : 'border-error text-error'}`}>
                      {v.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button title="Ver" className="hover:text-primary">
                        <Icon icon="solar:eye-linear" width={20} />
                      </button>
                      <button title="Editar" className="hover:text-primary">
                        <Icon icon="solar:pen-linear" width={20} />
                      </button>
                      <button title="Eliminar" className="hover:text-error">
                        <Icon icon="solar:trash-bin-minimalistic-linear" width={20} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Botón Agregar */}
      <div className="mt-4">
        <Button color={'primary'} onClick={handleAgregar} className="font-medium">
          Agregar un nuevo vehículo
        </Button>
      </div>
    </>
  );
};

export default Vehiculos;
