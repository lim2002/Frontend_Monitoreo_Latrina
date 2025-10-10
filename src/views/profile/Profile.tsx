import React from 'react';
import { Button } from 'flowbite-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useCurrentUser } from 'src/context/CurrentUserContext';
import { useAuth } from 'src/context/AuthContext';

const displayValue = (value: string | null | undefined): string => {
  if (!value) {
    return 'Sin registro';
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : 'Sin registro';
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) {
    return 'Sin registro';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(value);
  }
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const Profile: React.FC = () => {
  const { auth } = useAuth();
  const { user, isLoading, error, refresh } = useCurrentUser();

  const isConductor = auth.roleName === 'conductor';

  if (!auth.isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="mb-4 text-sm text-dark/70">
          <span className="font-medium">Menu</span>
          <span className="mx-2">&gt;</span>
          <span className="text-dark font-semibold">Perfil</span>
        </div>
        <h3 className="text-2xl font-semibold text-center">Mi perfil</h3>
        <p className="text-sm text-dark/70">Inicia sesion para ver los datos de tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Perfil</span>
      </div>

      <h3 className="text-2xl font-semibold text-center">Mi perfil</h3>

      {isLoading && (
        <div className="rounded-xl bg-white dark:bg-darkgray shadow-md p-6 text-sm text-dark/70">
          Cargando informacion del usuario...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl bg-white dark:bg-darkgray shadow-md p-6">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
          <Button color="light" onClick={refresh}>
            <Icon icon="solar:refresh-linear" width={18} className="me-1" />
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !error && !user && (
        <div className="rounded-xl bg-white dark:bg-darkgray shadow-md p-6 text-sm text-dark/70">
          No se encontro informacion del usuario.
        </div>
      )}
      {!isLoading && !error && user && (
        <div className="rounded-xl bg-white dark:bg-darkgray shadow-md p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="text-lg font-semibold">Datos generales</h5>
              <p className="text-sm text-dark/60">Informacion del usuario autenticado.</p>
            </div>
            <Button color="light" size="sm" onClick={refresh} disabled={isLoading}>
              <Icon icon="solar:refresh-linear" width={18} className="me-1" />
              Actualizar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase text-dark/50">Nombre completo</p>
              <p className="text-sm font-medium">{displayValue(user.nombreCompleto)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Usuario</p>
              <p className="text-sm font-medium">{displayValue(user.username)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Correo</p>
              <p className="text-sm font-medium">{displayValue(user.correo)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Celular</p>
              <p className="text-sm font-medium">{displayValue(user.celular)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Direccion</p>
              <p className="text-sm font-medium">{displayValue(user.direccion)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-dark/50">Fecha de nacimiento</p>
              <p className="text-sm font-medium">{formatDate(user.fechaNacimiento)}</p>
            </div>
          </div>

          {isConductor && (
            <div className="border-t border-black/10 pt-4 mt-2">
              <h6 className="text-base font-semibold mb-4">Datos de licencia</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-dark/50">Numero de licencia</p>
                  <p className="text-sm font-medium">{displayValue(user.nroLicencia)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-dark/50">Categoria</p>
                  <p className="text-sm font-medium">{displayValue(user.categoria)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-dark/50">Fecha de expiracion</p>
                  <p className="text-sm font-medium">{formatDate(user.fechaExpiracionLicencia)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
