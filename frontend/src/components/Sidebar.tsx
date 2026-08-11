import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Package, FileText, LogOut, Home, Printer } from 'lucide-react';
import { getUserRole } from '../utils/auth';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '16px 0',
    textDecoration: 'none',
    color: isActive ? '#4b3b9b' : '#7b859a', // Matching the purple/gray from screenshot
    borderLeft: isActive ? '4px solid #4b3b9b' : '4px solid transparent',
    backgroundColor: isActive ? '#f8f9fa' : 'transparent',
    fontSize: '0.75rem',
    fontWeight: 500,
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ width: '90px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid #eef2f9', flexShrink: 0 }}>
      
      <div style={{ padding: '20px 0', fontSize: '0.7rem', color: '#a0a7b5', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #eef2f9' }}>
        {role}
      </div>

      <nav style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
        
        <NavLink to="/" end style={navLinkStyle}>
          {({ isActive }) => (
            <>
              <Home size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>Home</span>
            </>
          )}
        </NavLink>

        {(role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') && (
          <NavLink to="/customers" style={navLinkStyle}>
            {({ isActive }) => (
              <>
                <Users size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>Customers</span>
              </>
            )}
          </NavLink>
        )}

        {(role === 'ADMIN' || role === 'WAREHOUSE') && (
          <NavLink to="/inventory" style={navLinkStyle}>
            {({ isActive }) => (
              <>
                <Package size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>Inventory</span>
              </>
            )}
          </NavLink>
        )}

        {(role === 'ADMIN' || role === 'SALES' || role === 'WAREHOUSE' || role === 'ACCOUNTS') && (
          <NavLink to="/challans" style={navLinkStyle}>
            {({ isActive }) => (
              <>
                <FileText size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>Challans</span>
              </>
            )}
          </NavLink>
        )}

        {(role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') && (
          <NavLink to="/invoices" style={navLinkStyle}>
            {({ isActive }) => (
              <>
                <Printer size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>Invoices</span>
              </>
            )}
          </NavLink>
        )}

        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            gap: '6px', padding: '16px 0', textDecoration: 'none', color: '#7b859a', 
            borderLeft: '4px solid transparent', backgroundColor: 'transparent', fontSize: '0.75rem', 
            fontWeight: 500, width: '100%', boxSizing: 'border-box', transition: 'all 0.2s ease', 
            borderTop: 'none', borderRight: 'none', borderBottom: 'none', cursor: 'pointer', marginTop: '10px' 
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#4b3b9b'; e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#7b859a'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={22} strokeWidth={2} />
          <span>Logout</span>
        </button>

      </nav>
    </div>
  );
};

export default Sidebar;
