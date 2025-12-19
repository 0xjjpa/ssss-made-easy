import { Link, NavLink } from 'react-router-dom';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `text-white px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-700' : 'hover:bg-indigo-600'}`;

function NavBar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 mb-6">
      <Link to="/" className="text-xl font-semibold text-white">
        SSSS-made-easy
      </Link>
      <div className="flex gap-2">
        <NavLink to="/" className={linkClasses} end>
          Home
        </NavLink>
        <NavLink to="/split" className={linkClasses}>
          Split
        </NavLink>
        <NavLink to="/combine" className={linkClasses}>
          Combine
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;
