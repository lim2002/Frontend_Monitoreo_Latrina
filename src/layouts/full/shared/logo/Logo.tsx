
import LogoIcon from '/src/assets/images/logos/logo-icon.svg'
import { Link } from 'react-router';

const Logo = () => {
  return (
   <Link to={'/inicio'}>
      <img src={LogoIcon} alt="logo" />
    </Link>
  )
}

export default Logo
