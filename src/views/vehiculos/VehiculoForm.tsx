import React, { useMemo, useState } from 'react';
import { Button, Label, Select, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useNavigate } from 'react-router';

type EstadoVehiculo = 'Nuevo' | 'Semi Nuevo';

type Dispositivo = {
  id: string;
  imei: string;
  modelo: string;
  descripcion: string; // para mostrar combinado
};

const dispositivosMock: Dispositivo[] = [
  { id: '1', imei: 'SDKJFKSDF9Q3', modelo: 'Coban GPS303', descripcion: 'SDKJFKSDF9Q3, Coban GPS303' },
  { id: '2', imei: 'SDJFHDSF7374', modelo: 'TK103-2B', descripcion: 'SDJFHDSF7374, TK103-2B' },
  { id: '3', imei: 'HJFFJKD23834', modelo: 'TK103-2B', descripcion: 'HJFFJKD23834, TK103-2B' },
  { id: '4', imei: 'SDKGFLKf4933', modelo: 'Coban GPS303', descripcion: 'SDKGFLKf4933, Coban GPS303' },
];

const VehiculoForm: React.FC = () => {
  const navigate = useNavigate();

  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [capacidadKg, setCapacidadKg] = useState('');
  const [estado, setEstado] = useState<EstadoVehiculo>('Nuevo');
  const [fechaMantenimiento, setFechaMantenimiento] = useState('');

  const [queryDispositivo, setQueryDispositivo] = useState('');
  const [dispositivoId, setDispositivoId] = useState('');

  const dispositivosFiltrados = useMemo(() => {
    const q = queryDispositivo.trim().toLowerCase();
    if (!q) return dispositivosMock;
    return dispositivosMock.filter(
      (d) => d.imei.toLowerCase().includes(q) || d.modelo.toLowerCase().includes(q)
    );
  }, [queryDispositivo]);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí enviarías los datos al backend.
    // Por ahora, volvemos a la lista de vehículos.
    navigate('/menu/vehiculos');
  };

  const handleCancelar = () => navigate('/menu/vehiculos');

  return (
    <form onSubmit={handleGuardar}>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Vehículos</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Registro</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Formulario de registro de vehículo</h3>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Columna izquierda */}
          <div className="xl:col-span-6 col-span-12">
            <h6 className="text-base font-medium mb-4">Ingrese los datos.</h6>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-2 block">Placa</Label>
                <TextInput value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ej. HHDF 112" className="form-control form-rounded-xl" required />
              </div>
              <div>
                <Label className="mb-2 block">Marca</Label>
                <TextInput value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="ej. Volvo" className="form-control form-rounded-xl" required />
              </div>
              <div>
                <Label className="mb-2 block">Modelo</Label>
                <TextInput value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="ej. Volvo FX 234" className="form-control form-rounded-xl" required />
              </div>
              <div>
                <Label className="mb-2 block">Año</Label>
                <TextInput value={anio} onChange={(e) => setAnio(e.target.value)} placeholder="ej. 2022" className="form-control form-rounded-xl" />
              </div>
              <div>
                <Label className="mb-2 block">Capacidad del vehículo (Kg.)</Label>
                <TextInput value={capacidadKg} onChange={(e) => setCapacidadKg(e.target.value)} placeholder="3000" className="form-control form-rounded-xl" />
              </div>
              <div>
                <Label className="mb-2 block">Estado del vehículo</Label>
                <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoVehiculo)} className="select-md">
                  <option>Nuevo</option>
                  <option>Semi Nuevo</option>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Fecha de mantenimiento</Label>
                <TextInput type="date" value={fechaMantenimiento} onChange={(e) => setFechaMantenimiento(e.target.value)} className="form-control form-rounded-xl" />
              </div>
            </div>
          </div>

          {/* Separador visual */}
          <div className="xl:col-span-1 col-span-12 hidden xl:block">
            <div className="w-px h-full bg-black/10 mx-auto" />
          </div>

          {/* Columna derecha */}
          <div className="xl:col-span-5 col-span-12">
            <h6 className="text-base font-medium mb-4">Seleccione el dispositivo GPS instalado en el vehículo</h6>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
                  <Icon icon="solar:magnifer-linear" width={20} />
                </span>
                <TextInput
                  value={queryDispositivo}
                  onChange={(e) => setQueryDispositivo(e.target.value)}
                  placeholder="Ingresa IMEI o Modelo"
                  className="pl-9 form-control form-rounded-xl"
                />
              </div>
              <div>
                <Select value={dispositivoId} onChange={(e) => setDispositivoId(e.target.value)} className="select-md h-48" required>
                  <option value="" disabled>
                    Seleccione un dispositivo
                  </option>
                  {dispositivosFiltrados.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.descripcion}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex gap-3">
          <Button color={'primary'} type="submit" className="px-6">
            Guardar
          </Button>
          <Button color={'gray'} type="button" onClick={handleCancelar} className="px-6">
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
};

export default VehiculoForm;

