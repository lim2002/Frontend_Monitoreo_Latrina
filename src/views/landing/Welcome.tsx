import { Dropdown, DropdownItem } from "flowbite-react";
import { useNavigate } from "react-router";
import logo from "/src/assets/images/pictures/imagen-home.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  const accessAs = (role: "administrador" | "conductor") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("role", role);
    }
    // Ir a la pantalla Home (con men� filtrado por rol)
    navigate("/inicio");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Acceder - esquina superior derecha */}
        <div className="absolute right-4 top-6 md:right-6">
          <Dropdown label="Acceder" inline className="rounded-sm min-w-[200px]">
            <DropdownItem onClick={() => accessAs("administrador")}>
              Acceder como Administrador
            </DropdownItem>
            <DropdownItem onClick={() => accessAs("conductor")}>
              Acceder como Conductor
            </DropdownItem>
          </Dropdown>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">
          Sistema de Monitoreo de Distribucion "Latrina Cover"
        </h1>

        <div className="border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 p-4 md:p-8">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl aspect-video bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Imagen de bienvenida" className="object-contain w-full h-full p-4 md:p-6 opacity-90" />
            </div>
          </div>

          <p className="mt-6 md:mt-8 text-gray-700 dark:text-gray-200 max-w-4xl mx-auto text-justify leading-relaxed">
            Bienvenido al sistema de monitoreo de distribucion. Esta plataforma permite visualizar el estado de las
            salidas, el seguimiento de entregas y el control de flota en tiempo real. Use el menu para navegar entre los
            modulos y gestionar la operacion de forma sencilla.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
