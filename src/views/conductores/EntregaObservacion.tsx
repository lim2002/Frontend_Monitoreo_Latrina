import React, { useState } from 'react';
import { Button, Label, Select, Textarea } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router';

type EstadoEntrega = 'Entregado' | 'No Entregado';

const EntregaObservacion: React.FC = () => {
  const navigate = useNavigate();
  const { id, productoId } = useParams();
  const [observacion, setObservacion] = useState('');
  const [estado, setEstado] = useState<EstadoEntrega>('No Entregado');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la llamada a API para guardar
    console.log('Guardar observación', { pedidoId: id, productoId, observacion, estado });
    navigate(-1); // volver al detalle
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
            <Textarea id="obs" rows={6} value={observacion} onChange={(e) => setObservacion(e.target.value)} className="form-control form-rounded-xl" required />
          </div>

          <div>
            <Label htmlFor="estado" className="mb-2 block" />
            <Select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoEntrega)} className="form-control form-rounded-xl">
              <option value="Entregado">Entregado</option>
              <option value="No Entregado">No Entregado</option>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="submit" color={'gray'} className="px-6">Confirmar Observación</Button>
            <Button type="button" color={'light'} onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EntregaObservacion;

