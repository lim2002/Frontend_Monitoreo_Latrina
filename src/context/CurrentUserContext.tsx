import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';
import { useAuth } from './AuthContext';

type UsuarioApi = {
  idUsuario?: number | string | null;
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

type CurrentUser = {
  id: string;
  username: string;
  nombreCompleto: string;
  correo: string | null;
  celular: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;
  nroLicencia: string | null;
  categoria: string | null;
  fechaExpiracionLicencia: string | null;
};

type CurrentUserContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

const sanitize = (value?: string | null): string => (value ?? '').trim();
const sanitizeOrNull = (value?: string | null): string | null => {
  const cleaned = sanitize(value);
  return cleaned.length ? cleaned : null;
};

const mapUser = (raw: UsuarioApi): CurrentUser => ({
  id: raw.idUsuario !== undefined && raw.idUsuario !== null ? String(raw.idUsuario) : '',
  username: sanitize(raw.username),
  nombreCompleto: sanitize(raw.nombreCompleto),
  correo: sanitizeOrNull(raw.correo),
  celular: sanitizeOrNull(raw.celular),
  direccion: sanitizeOrNull(raw.direccion),
  fechaNacimiento: raw.fechaNacimiento ?? null,
  nroLicencia: sanitizeOrNull(raw.nroLicencia),
  categoria: sanitizeOrNull(raw.categoria),
  fechaExpiracionLicencia: raw.fechaExpiracionLicencia ?? null,
});

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authorizedFetch } = useAuthorizedApi();
  const { auth } = useAuth();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshRef = useRef<AbortController | null>(null);

  const fetchUser = useCallback(
    async (signal?: AbortSignal) => {
      if (!auth.isAuthenticated || !auth.userId) {
        setUser(null);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const path = `/api/v1/usuarios/${encodeURIComponent(String(auth.userId))}`;
        const response = await authorizedFetch(path, { signal });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Error al obtener el usuario (${response.status}).`);
        }

        const json = (await response.json()) as { data?: UsuarioApi | null };
        if (signal?.aborted) {
          return;
        }

        const mapped = json?.data ? mapUser(json.data) : null;
        setUser(mapped);
        setError(null);
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        console.error('Error al cargar el usuario actual', err);
        setUser(null);
        setError('No se pudo obtener la informacion del usuario.');
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [auth.isAuthenticated, auth.userId, authorizedFetch],
  );

  useEffect(() => {
    const controller = new AbortController();
    refreshRef.current?.abort();
    refreshRef.current = controller;
    void fetchUser(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchUser]);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    refreshRef.current?.abort();
    refreshRef.current = controller;
    void fetchUser(controller.signal);
  }, [fetchUser]);

  const value = useMemo<CurrentUserContextValue>(
    () => ({
      user,
      isLoading,
      error,
      refresh,
    }),
    [error, isLoading, refresh, user],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
};

export const useCurrentUser = (): CurrentUserContextValue => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser must be used within a CurrentUserProvider');
  }
  return context;
};
