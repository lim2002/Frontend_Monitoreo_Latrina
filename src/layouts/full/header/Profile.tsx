import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { Icon } from "@iconify/react";
import user1 from "/src/assets/images/profile/user-1.jpg";
import { useNavigate } from "react-router";
import { useAuth } from "src/context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img
              src={user1}
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <DropdownItem className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark">
          <Icon icon="solar:user-circle-outline" height={20} />
          Perfil
        </DropdownItem>
        <div className="p-3 pt-0">
          <Button
            size="sm"
            onClick={handleLogout}
            className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none"
          >
            Salir
          </Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
