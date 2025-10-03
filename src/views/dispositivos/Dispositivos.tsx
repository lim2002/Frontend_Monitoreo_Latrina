import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Badge, Button, TextInput } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';

type DispositivoApi = {
  idDispositivo: number | string;
  codigo?: string | null;
  modelo?: string | null;
  activo?: number | null;
  status?: number | null;
};

type Dispositivo = {
  id: string;
  codigo: string;
  modelo: string;
  activo: number | null;
  status: number | null;
};

const sanitize = (value?: string | null): string => (value ?? '').trim();

const mapDispositivo = (dispositivo: DispositivoApi): Dispositivo => ({
  id: String(dispositivo.idDispositivo),
  codigo: sanitize(dispositivo.codigo),
  modelo: sanitize(dispositivo.modelo),
  activo: dispositivo.activo ?? null,
  status: dispositivo.status ?? null,
});

const availabilityLabel = (value: number | null): string => {
  switch (value) {
    case 1:
      return 'Disponible';
    case 2:
      return 'Asignado';
    default:
      return 'Sin estado';
  }
};

const availabilityBadgeColor = (value: number | null): string => {
  switch (value) {
    case 1:
      return 'lightsuccess';
    case 2:
      return 'lightwarning';
    default:
      return 'lightsecondary';
  }
};

const statusLabel = (value: number | null): string => {
  if (value === 1) {
    return 'Activo';
  }
  if (value === 0) {
    return 'Inactivo';
  }
  return 'Sin registro';
};

const Dispositivos: React.FC = () => {
  const { token, authorizedFetch } = useAuthorizedApi();

  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [selectedDispositivo, setSelectedDispositivo] = useState<Dispositivo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setDispositivos([]);
      setSelectedDispositivo(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const term = searchTerm.trim() === '' ? 'all' : searchTerm.trim();

    const obtenerDispositivos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authorizedFetch(`/api/v1/dispositivosGps/${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al obtener dispositivos (${response.status}).`);
        }

        const json = (await response.json()) as { data?: DispositivoApi[] };
        if (!isMounted) {
          return;
        }

        const items = Array.isArray(json.data) ? json.data.map(mapDispositivo) : [];
        setDispositivos(items);
        setSelectedDispositivo((prev) => (prev && items.some((item) => item.id === prev.id) ? prev : null));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error al obtener dispositivos', error);
        if (isMounted) {
          setError('No se pudieron cargar los dispositivos. Intenta nuevamente.');
          setDispositivos([]);
          setSelectedDispositivo(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void obtenerDispositivos();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorizedFetch, searchTerm, token, reloadKey]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    setSearchTerm(normalized || 'all');
  };

  const handleClear = () => {
    setQuery('');
    setSearchTerm('all');
    setSelectedDispositivo(null);
  };

  const toggleDetalle = (dispositivo: Dispositivo) => {
    setSelectedDispositivo((prev) => (prev && prev.id === dispositivo.id ? null : dispositivo));
  };

  const resetForm = () => {
    setNuevoCodigo('');
    setNuevoModelo('');
  };

  const handleGuardarNuevo = async () => {
    if (!token) {
      setSubmitError('No se encontro un token de autenticacion.');
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    const codigo = sanitize(nuevoCodigo);
    const modelo = sanitize(nuevoModelo);

    if (!codigo || !modelo) {
      setSubmitError('Completa el codigo y el modelo del dispositivo.');
      return;
    }

    const payload = {
      idDispositivo: null,
      codigo,
      modelo,
      activo: 1,
      status: 1,
    };

    setIsSubmitting(true);
    try {
      const response = await authorizedFetch('/api/v1/dispositivosGps/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error al registrar el dispositivo (${response.status}).`);
      }

      setSubmitSuccess('Dispositivo registrado correctamente.');
      resetForm();
      setQuery('');
      setSearchTerm('all');
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error al registrar dispositivo', error);
      setSubmitError(error instanceof Error ? error.message : 'No se pudo registrar el dispositivo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dispositivosEnTabla = useMemo(() => dispositivos, [dispositivos]);

  return (
    <>
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Dispositivos</span>
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 mb-6">
        <h5 className="card-title text-center">Gestion de Dispositivos</h5>
        <form className="mt-4 flex flex-col md:flex-row items-stretch gap-3" onSubmit={handleSearch}>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/60">
              <Icon icon="solar:magnifer-linear" width={20} />
            </span>
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa codigo o modelo del dispositivo GPS"
              className="pl-9 form-control form-rounded-xl"
            />
          </div>
          <div className="flex gap-2 md:w-auto w-full">
            <Button type="submit" color="primary" className="font-medium w-full md:w-auto" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button type="button" color="light" className="font-medium w-full md:w-auto" onClick={handleClear} disabled={loading}>
              Limpiar
            </Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex items-center justify-between mb-3">
          <h6 className="text-base font-medium">Listado de dispositivos</h6>
          {loading && <span className="text-sm text-dark/60">Cargando dispositivos...</span>}
        </div>
        <div className="mt-3 overflow-x-auto">
          <Table hoverable>
            <TableHead className="border-b border-gray-300">
              <TableRow>
                <TableHeadCell className="p-6 text-base">Codigo</TableHeadCell>
                <TableHeadCell className="text-base">Modelo</TableHeadCell>
                <TableHeadCell className="text-base">Disponibilidad</TableHeadCell>
                <TableHeadCell className="text-base">Opciones</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-gray-300">
              {dispositivosEnTabla.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    <span className="text-sm text-dark/60">No se encontraron dispositivos.</span>
                  </TableCell>
                </TableRow>
              ) : (
                dispositivosEnTabla.map((dispositivo) => {
                  const label = availabilityLabel(dispositivo.activo);
                  const badgeColor = availabilityBadgeColor(dispositivo.activo);
                  const badgeClass =
                    dispositivo.activo === 1
                      ? 'border-success text-success'
                      : dispositivo.activo === 2
                        ? 'border-warning text-warning'
                        : 'border-secondary text-dark/70';

                  return (
                    <TableRow key={dispositivo.id}>
                      <TableCell className="whitespace-nowrap ps-6">
                        <span className="text-sm">{dispositivo.codigo || 'Sin codigo'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{dispositivo.modelo || 'Sin modelo'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge color={badgeColor} className={`border ${badgeClass}`}>
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button title="Ver" className="hover:text-primary" onClick={() => toggleDetalle(dispositivo)}>
                            <Icon icon="solar:eye-linear" width={20} />
                          </button>
                          <button title="Editar" className="hover:text-primary" disabled>
                            <Icon icon="solar:pen-linear" width={20} />
                          </button>
                          <button title="Eliminar" className="hover:text-error" disabled>
                            <Icon icon="solar:trash-bin-minimalistic-linear" width={20} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedDispositivo && (
        <div className="mt-6 rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h6 className="text-base font-semibold">Detalle del dispositivo</h6>
              <p className="text-sm text-dark/60">Informacion del dispositivo seleccionado.</p>
            </div>
            <Button color="gray" size="sm" onClick={() => setSelectedDispositivo(null)}>
              Cerrar
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-dark/50">Codigo</p>
              <p className="text-sm font-medium">{selectedDispositivo.codigo || 'Sin codigo'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Modelo</p>
              <p className="text-sm font-medium">{selectedDispositivo.modelo || 'Sin modelo'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Disponibilidad</p>
              <p className="text-sm font-medium">{availabilityLabel(selectedDispositivo.activo)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Estado</p>
              <p className="text-sm font-medium">{statusLabel(selectedDispositivo.status)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <h6 className="text-lg font-semibold mb-4">Agregar nuevo dispositivo</h6>
        <div className="grid grid-cols-12 gap-4">
          <div className="md:col-span-6 col-span-12">
            <label className="mb-2 block text-sm text-dark/80">Codigo:</label>
            <TextInput value={nuevoCodigo} onChange={(e) => setNuevoCodigo(e.target.value)} placeholder="GPS-000123" className="form-control form-rounded-xl" />
          </div>
          <div className="md:col-span-6 col-span-12">
            <label className="mb-2 block text-sm text-dark/80">Modelo:</label>
            <TextInput value={nuevoModelo} onChange={(e) => setNuevoModelo(e.target.value)} placeholder="Teltonika FMB920" className="form-control form-rounded-xl" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
          <Button color="primary" onClick={handleGuardarNuevo} className="font-medium" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar un nuevo dispositivo'}
          </Button>
          {submitError && <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>}
          {submitSuccess && <p className="text-sm text-green-600 dark:text-green-400">{submitSuccess}</p>}
        </div>
      </div>
    </>
  );
};

export default Dispositivos;
