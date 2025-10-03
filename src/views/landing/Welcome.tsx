import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import logo from '/src/assets/images/pictures/imagen-home.jpg';
import { useAuth } from 'src/context/AuthContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      return;
    }

    const target = auth.roleId === 2 ? '/menu/programar-salida' : auth.roleId === 104 ? '/menu/entregas' : '/inicio';

    if (`${window.location.pathname}${window.location.search}` !== target) {
      navigate(target, { replace: true });
    }
  }, [auth, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          Sistema de Monitoreo de Distribucion "Latrina Cover"
        </h1>

        <div className="border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 p-4 md:p-8">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl aspect-video bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Imagen de bienvenida" className="object-contain w-full h-full p-4 md:p-6 opacity-90" />
            </div>
          </div>

          <div className="mt-6 md:mt-8 text-gray-700 dark:text-gray-200 max-w-4xl mx-auto text-justify leading-relaxed space-y-4">
            <p>
              Bienvenido al sistema de monitoreo de distribucion. Esta plataforma permite visualizar el estado de las
              salidas, el seguimiento de entregas y el control de flota en tiempo real.
            </p>
            {auth.isAuthenticated ? (
              <p className="text-center font-medium text-primary">
                Validando tus credenciales, te redirigiremos a tu panel en un momento...
              </p>
            ) : (
              <p className="text-center font-medium">
                Para acceder, asegurate de ingresar mediante el enlace proporcionado que incluye tu token de acceso.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
