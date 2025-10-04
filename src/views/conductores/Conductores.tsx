import React, { useEffect, useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type ConductorApi = {
  idUsuario: number | string;
  username?: string | null;
  nombreCompleto?: string | null;
  correo?: string | null;
  celular?: string | null;
  direccion?: string | null;
  fechaNacimiento?: string | null;
  nroLicencia?: string | null;
  categoria?: string | null;
  fechaExpiracionLicencia?: string | null;
};

type Conductor = {
  id: string;
  username: string;
  nombreCompleto: string;
  correo: string;
  celular: string;
  direccion: string;
  fechaNacimiento: string | null;
  nroLicencia: string;
  categoria: string;
  fechaExpiracionLicencia: string | null;
};

const sanitize = (value?: string | null): string => (value ?? '').trim();

const mapConductor = (conductor: ConductorApi): Conductor => ({
  id: String(conductor.idUsuario),
  username: sanitize(conductor.username),
  nombreCompleto: sanitize(conductor.nombreCompleto),
  correo: sanitize(conductor.correo),
  celular: sanitize(conductor.celular),
  direccion: sanitize(conductor.direccion),
  fechaNacimiento: conductor.fechaNacimiento ?? null,
  nroLicencia: sanitize(conductor.nroLicencia),
  categoria: sanitize(conductor.categoria),
  fechaExpiracionLicencia: conductor.fechaExpiracionLicencia ?? null,
});

const formatDate = (value: string | null): string => {
  if (!value) {
    return 'Sin registro';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const dateOnly = value.split('T')[0];
    return (dateOnly || value).replace(/-/g, '/');
  }
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const calculateAge = (value: string | null): number | null => {
  if (!value) {
    return null;
  }
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

const Conductores: React.FC = () => {
  const { token, authorizedFetch } = useAuthorizedApi();
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchTerm(query.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!token) {
      setConductores([]);
      setSelectedConductor(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const nombreParam = encodeURIComponent(searchTerm);

    const obtenerConductores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch('/api/v1/usuarios/conductores/all?nombre=' + nombreParam, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Error al obtener conductores (' + response.status + ').');
        }

        const json = (await response.json()) as { data?: ConductorApi[] };
        if (!isMounted) {
          return;
        }

        const items = Array.isArray(json.data) ? json.data.map(mapConductor) : [];
        setConductores(items);
        setSelectedConductor((prev) => {
          if (!prev) {
            return null;
          }
          return items.find((item) => item.id === prev.id) ?? null;
        });
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener conductores', err);
        if (isMounted) {
          setError('No se pudieron cargar los conductores. Intenta nuevamente.');
          setConductores([]);
          setSelectedConductor(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void obtenerConductores();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorizedFetch, searchTerm, token]);

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Conductores</span>
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">Conductores</h3>

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

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-base font-medium">Listado de conductores</h6>
          {isLoading && <span className="text-sm text-dark/60">Cargando conductores...</span>}
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
        <div className="grid grid-cols-12 gap-6">
          {!isLoading && conductores.length === 0 && !error ? (
            <div className="col-span-12 text-center text-sm text-dark/60">
              No se encontraron conductores.
            </div>
          ) : (
            conductores.map((conductor) => {
              const edad = calculateAge(conductor.fechaNacimiento);
              return (
                <div key={conductor.id} className="lg:col-span-6 col-span-12">
                  <div className="relative border border-black/20 rounded-lg p-4 bg-white dark:bg-darkgray">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-black/10 flex items-center justify-center">
                        <Icon icon="solar:user-circle-linear" width={28} />
                      </div>
                      <div className="leading-6">
                        <p className="text-sm">
                          <span className="font-semibold">Nombre:</span> {conductor.nombreCompleto || 'Sin registro'}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Nro. de Licencia:</span> {conductor.nroLicencia || 'Sin registro'}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Categoria:</span> {conductor.categoria || 'Sin registro'}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Edad:</span> {edad !== null ? edad + ' anios' : 'Sin registro'}
                        </p>
                      </div>
                    </div>
                    <button
                      title="Ver"
                      className="absolute right-3 bottom-3 hover:text-primary"
                      onClick={() => setSelectedConductor(conductor)}
                    >
                      <Icon icon="solar:eye-linear" width={22} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedConductor && (
        <div className="mt-6 rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h6 className="text-base font-semibold">Detalle del conductor</h6>
              <p className="text-sm text-dark/60">Informacion detallada del conductor seleccionado.</p>
            </div>
            <Button color="gray" size="sm" onClick={() => setSelectedConductor(null)}>
              Cerrar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase text-dark/50">Nombre completo</p>
              <p className="font-medium">{selectedConductor.nombreCompleto || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Usuario</p>
              <p className="font-medium">{selectedConductor.username || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Correo</p>
              <p className="font-medium">{selectedConductor.correo || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Celular</p>
              <p className="font-medium">{selectedConductor.celular || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Direccion</p>
              <p className="font-medium">{selectedConductor.direccion || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Fecha de nacimiento</p>
              <p className="font-medium">{formatDate(selectedConductor.fechaNacimiento)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Edad</p>
              <p className="font-medium">
                {(() => {
                  const edadDetalle = calculateAge(selectedConductor.fechaNacimiento);
                  return edadDetalle !== null ? edadDetalle + ' anios' : 'Sin registro';
                })()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Nro. de licencia</p>
              <p className="font-medium">{selectedConductor.nroLicencia || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Categoria</p>
              <p className="font-medium">{selectedConductor.categoria || 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Expiracion licencia</p>
              <p className="font-medium">{formatDate(selectedConductor.fechaExpiracionLicencia)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Conductores;
