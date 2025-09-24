import { useState, useMemo } from 'react';
import { Drawer, DrawerItems, Navbar } from 'flowbite-react';
import { Icon } from '@iconify/react';
import Profile from './Profile';
import Notification from './notification';
import MobileSidebar from '../sidebar/MobileSidebar';
import { useAuth } from 'src/context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = useAuth();

  const handleClose = () => setIsOpen(false);

  const welcomeLabel = useMemo(() => {
    if (!auth.isAuthenticated) {
      return 'Bienvenido';
    }
    const roleLabel = auth.roleName ? auth.roleName.charAt(0).toUpperCase() + auth.roleName.slice(1) : 'Usuario';
    const idLabel = auth.userId ? ` #${auth.userId}` : '';
    return `${roleLabel}${idLabel}`;
  }, [auth]);

  return (
    <>
      <header>
        <Navbar fluid className={`rounded-lg bg-white shadow-md  py-4 `}>
          <div className="flex gap-3 items-center justify-between w-full ">
            <div className="flex gap-2 items-center">
              <span
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
              >
                <Icon icon="solar:hamburger-menu-line-duotone" height={21} />
              </span>
              <Notification />
            </div>

            <div className="flex gap-4 items-center">
              <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-200">{welcomeLabel}</span>
              <Profile />
            </div>
          </div>
        </Navbar>
      </header>

      <Drawer open={isOpen} onClose={handleClose} className='w-64'>
        <DrawerItems>
          <MobileSidebar />
        </DrawerItems>
      </Drawer>
    </>
  );
};

export default Header;
