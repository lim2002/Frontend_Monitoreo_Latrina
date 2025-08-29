import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';

type Dispositivo = {
  id: string;
  imei: string;
  modelo: string;
  activo: boolean;
};

const dataInicial: Dispositivo[] = [
  { id: '1', imei: 'SDJHFJD21234', modelo: 'TK103-2B', activo: true },
  { id: '2', imei: 'SDJFHDSF3734', modelo: 'TK103-2B', activo: true },
  { id: '3', imei: 'HJFFJKDS23834', modelo: 'TK103-2B', activo: true },
  { id: '4', imei: 'FDKGJGFKG374', modelo: 'Coban GPS303', activo: false },
  { id: '5', imei: 'SDKJFKSDFFQ93', modelo: 'Coban GPS303', activo: true },
  { id: '6', imei: 'SDKGFLK19393', modelo: 'Coban GPS303', activo: true },
];

const Dispositivos: React.FC = () => {
  const [query, setQuery] = useState('');
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>(dataInicial);
  const [nuevoImei, setNuevoImei] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dispositivos;
    return dispositivos.filter(d =>
      d.imei.toLowerCase().includes(q) || d.modelo.toLowerCase().includes(q)
    );
  }, [dispositivos, query]);

  const toggleActivo = (id: string) => {
    setDispositivos(prev => prev.map(d => (d.id === id ? { ...d, activo: !d.activo } : d)));
  };

  const onGuardarNuevo = () => {
    if (!nuevoImei || !nuevoModelo) return;
    setDispositivos(prev => [
      { id: String(Date.now()), imei: nuevoImei, modelo: nuevoModelo, activo: true },
      ...prev,
    ]);
    setNuevoImei('');
    setNuevoModelo('');
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Dispositivos</span>
      </div>

      {/* Buscador */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <h5 className="card-title text-center">Gestión de Dispositivos</h5>
        <div className="flex items-center gap-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
              <Icon icon="solar:magnifer-linear" width={20} />
            </span>
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa IMEI o modelo del dispositivo GPS"
              className="pl-9 form-control form-rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Dispositivos */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableHeadCell className="p-6 text-base">IMEI</TableHeadCell>
              <TableHeadCell className="text-base">Modelo</TableHeadCell>
              <TableHeadCell className="text-base">Estado</TableHeadCell>
              <TableHeadCell className="text-base">Opciones</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {filtrados.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="whitespace-nowrap ps-6">
                    <span className="text-sm">{d.imei}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{d.modelo}</span>
                  </TableCell>
                  <TableCell>
                    <Badge color={d.activo ? 'lightsuccess' : 'lighterror'} className={`border ${d.activo ? 'border-success text-success' : 'border-error text-error'}`}>
                      {d.activo ? 'Activo' : 'Inactivo'}
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

      {/* Formulario rápido de alta */}
      <div className="mt-6 rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <h6 className="text-lg font-semibold mb-4">Agregar nuevo dispositivo</h6>
        <div className="grid grid-cols-12 gap-4">
          <div className="md:col-span-6 col-span-12">
            <label className="mb-2 block text-sm text-dark/80">IMEI:</label>
            <TextInput value={nuevoImei} onChange={(e) => setNuevoImei(e.target.value)} placeholder="KJSDHFOJW49832" className="form-control form-rounded-xl" />
          </div>
          <div className="md:col-span-6 col-span-12">
            <label className="mb-2 block text-sm text-dark/80">Modelo:</label>
            <TextInput value={nuevoModelo} onChange={(e) => setNuevoModelo(e.target.value)} placeholder="TK103-2B" className="form-control form-rounded-xl" />
          </div>
        </div>
        <div className="mt-4">
          <Button color={'primary'} onClick={onGuardarNuevo} className="font-medium">
            Guardar un nuevo dispositivo
          </Button>
        </div>
      </div>
    </>
  );
};

export default Dispositivos;

