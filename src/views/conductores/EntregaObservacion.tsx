import React, { useMemo, useState } from 'react';
import { Button, Label, Select, Textarea } from 'flowbite-react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useAuthorizedApi } from 'src/hooks/useAuthorizedApi';
import { useAuth } from 'src/context/AuthContext';

type EstadoEntregaSelect = 'Entregado' | 'No Entregado';
type EstadoEntregaValue = 1 | 2;

type LocationState = {
  notaId?: string | null;
};

const mapEstadoToValue = (estado: EstadoEntregaSelect): EstadoEntregaValue => (estado === 'Entregado' ? 2 : 1);

const EntregaObservacion: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productoId } = useParams();
  const { authorizedFetch } = useAuthorizedApi();
  const { auth } = useAuth();
  const conductorId = auth.userId;

  const [observacion, setObservacion] = useState('');
  const [estado, setEstado] = useState<EstadoEntregaSelect>('No Entregado');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const state = (location.state ?? {}) as LocationState;
  const salidaDetalleId = productoId ?? state.notaId ?? '';

  const canSubmit = useMemo(() => Boolean(conductorId && salidaDetalleId && observacion.trim()), [conductorId, salidaDetalleId, observacion]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    const confirm = window.confirm('Esta seguro de registrar la observacion?');
    if (!confirm) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        idConductor: conductorId,
        idSalidasProgramadasDetalle: Number(salidaDetalleId),
        observacion: observacion.trim(),
        estadoEntrega: mapEstadoToValue(estado),
        status: 1,
      };

      const response = await authorizedFetch('/api/v1/observacion-entregas/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error al registrar la observación (${response.status}).`);
      }

      navigate(-1);
    } catch (error) {
      console.error('Error al registrar observación', error);
      alert('No se pudo registrar la observación. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-dark/70">
        <span className="font-medium">Menu</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Entrega</span>
        <span className="mx-2">&gt;</span>
        <span className="font-medium">Detalle</span>
        <span className="mx-2">&gt;</span>
        <span className="text-dark font-semibold">Observación</span>
      </div>

      {/* Encabezado */}
      <h3 className="text-2xl font-semibold text-center mb-4">Formulario de Registro - Observacion</h3>

      {/* Card Form */}
      <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6">
        <h5 className="card-title mb-4">Observacion</h5>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <Label htmlFor="obs" className="mb-2 block" />
            <Textarea id="obs" rows={6} value={observacion} onChange={(e) => setObservacion(e.target.value)} className="form-control form-rounded-xl" required disabled={isSubmitting} />
          </div>

          <div>
            <Label htmlFor="estado" className="mb-2 block" />
            <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoEntregaSelect)} className="form-control form-rounded-xl" disabled={isSubmitting}>
              <option value="Entregado">Entregado</option>
              <option value="No Entregado">No Entregado</option>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="submit" color={'gray'} className="px-6" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Confirmar Observacion'}
            </Button>
            <Button type="button" color={'light'} onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EntregaObservacion;
