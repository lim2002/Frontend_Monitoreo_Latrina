import React, { useMemo, useState } from 'react';
import { TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';

type Conductor = {
  id: string;
  nombre: string;
  licencia: string;
  edad: number;
};

const dataInicial: Conductor[] = [
  { id: '1', nombre: 'Giacomo Guilizzoni', licencia: '38384844', edad: 45 },
  { id: '2', nombre: 'Marco Botton Tuttofare', licencia: '9495864', edad: 35 },
  { id: '3', nombre: 'Mariah Maclachlan', licencia: '04949595', edad: 32 },
  { id: '4', nombre: 'Valerie Liberty', licencia: '9495964', edad: 43 },
];

const Conductores: React.FC = () => {
  const [query, setQuery] = useState('');
  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dataInicial;
    return dataInicial.filter((c) => c.nombre.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Conductores</span>
      </div>

      {/* Título */}
      <h3 className="text-2xl font-semibold text-center mb-4">Conductores</h3>

      {/* Buscador */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <div className="relative w-full max-w-xl mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
            <Icon icon="solar:magnifer-linear" width={20} />
          </span>
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ingresa nombre de conductor"
            className="pl-9 form-control form-rounded-xl"
          />
        </div>
      </div>

      {/* Listado de conductores (tarjetas) */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="grid grid-cols-12 gap-6">
          {filtrados.map((c) => (
            <div key={c.id} className="lg:col-span-6 col-span-12">
              <div className="relative border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center">
                    <Icon icon="solar:user-circle-linear" width={28} />
                  </div>
                  <div className="leading-6">
                    <p className="text-sm"><span className="font-semibold">Nombre:</span> {c.nombre}</p>
                    <p className="text-sm"><span className="font-semibold">Nro. de Licencia:</span> {c.licencia}</p>
                    <p className="text-sm"><span className="font-semibold">Edad:</span> {c.edad} años</p>
                  </div>
                </div>
                <button title="Ver" className="absolute right-3 bottom-3 hover:text-primary">
                  <Icon icon="solar:eye-linear" width={22} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Conductores;

