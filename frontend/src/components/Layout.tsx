import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { isAuthenticated, getToken, getUserRole } from '../utils/auth';
import { Bell, User, X, MinusSquare, Maximize2, LogOut } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import CustomerForm from './forms/CustomerForm';
import ProductForm from './forms/ProductForm';
import ChallanForm from './forms/ChallanForm';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getUserRole();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { activeForm, isMinimized, closeForm, toggleMinimize, refreshTrigger, toast, hideToast } = useFormContext();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (isAuthenticated()) {
      axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${getToken()}` }
      }).then(res => setNotifications(res.data)).catch(console.error);
    }
  }, [refreshTrigger]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Get current page name for header
  const getPageName = () => {
    switch(location.pathname) {
      case '/customers': return 'Customers';
      case '/inventory': return 'Inventory';
      case '/challans': return 'Sales Challans';
      case '/invoices': return 'Tax Invoices';
      default: return 'Home';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f6f8' }}>
      
      {/* Top Header Bar */}
      <header style={{ 
        height: '60px', backgroundColor: 'white', display: 'flex', alignItems: 'center', 
        padding: '0 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 10, position: 'relative',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '90px' }}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '28px' }}>
              <path d="M12.5 8.5L28.5 24.5M28.5 8.5L12.5 24.5" stroke="#4b3b9b" strokeWidth="4" strokeLinecap="round" />
              <rect x="2" y="2" width="36" height="36" rx="8" stroke="#4b3b9b" strokeWidth="3" />
              <path d="M8 20L15 27L32 10" stroke="#4b3b9b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#1a2233', margin: '0 0 0 10px', fontWeight: 600 }}>{getPageName()}</h2>
        </div>

        {/* Right side - Notifications & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', color: '#7b859a' }}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '5px', right: '6px', width: '8px', height: '8px', backgroundColor: '#e74c3c', borderRadius: '50%', border: '2px solid white' }}></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: '0', width: '320px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eef2f9', padding: '10px', zIndex: 20, maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #eef2f9', fontWeight: 600, fontSize: '0.9rem', color: '#1a2233' }}>Notifications</div>
                
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#7b859a', fontSize: '0.85rem' }}>No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#7b859a', borderBottom: '1px solid #eef2f9' }}>
                      <div style={{ color: n.type === 'WARNING' ? '#d93025' : '#1a73e8', fontWeight: 600, marginBottom: '4px' }}>{n.title}</div>
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '20px', borderLeft: '1px solid #eef2f9' }}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
            >
              <div style={{ width: '32px', height: '32px', backgroundColor: '#f0eff7', color: '#4b3b9b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a2233' }}>{role}</span>
            </button>

            {showProfileDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '10px', width: '200px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #d2d6de', padding: '10px', zIndex: 20 }}>
                <div style={{ padding: '5px 5px 10px 5px', borderBottom: '1px solid #eef2f9', fontSize: '0.85rem', color: '#7b859a', marginBottom: '10px' }}>
                  Logged in as <strong style={{ color: '#1a2233' }}>{role}</strong>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                  <LogOut size={16} /> Secure Logout
                </button>
              </div>
            )}
          </div>
          
        </div>
      </header>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        
        <main style={{ padding: '30px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </main>
      </div>

      {/* GLOBAL FLOATING WINDOW MANAGER */}
      {activeForm && (
        <div style={{
          position: 'fixed',
          bottom: isMinimized ? '0' : '20px',
          right: '20px',
          width: '450px',
          backgroundColor: 'white',
          borderRadius: isMinimized ? '12px 12px 0 0' : '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #eef2f9',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          transform: isMinimized ? 'translateY(0)' : 'translateY(0)',
          maxHeight: isMinimized ? '50px' : '85vh',
        }}>
          {/* Window Header */}
          <div style={{ 
            padding: '12px 20px', 
            backgroundColor: '#1a2233', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer'
          }} onClick={toggleMinimize}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {activeForm === 'customer' && 'New Customer Entry'}
              {activeForm === 'product' && 'New Inventory Item'}
              {activeForm === 'challan' && 'Generate Sales Challan'}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button style={{ background: 'none', border: 'none', color: '#a0a7b5', cursor: 'pointer', padding: 0 }}>
                {isMinimized ? <Maximize2 size={16} /> : <MinusSquare size={16} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); closeForm(); }} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Window Body (Scrollable) */}
          <div style={{ 
            padding: '20px', 
            overflowY: 'auto', 
            display: isMinimized ? 'none' : 'block',
            backgroundColor: '#ffffff'
          }}>
            {activeForm === 'customer' && <CustomerForm />}
            {activeForm === 'product' && <ProductForm />}
            {activeForm === 'challan' && <ChallanForm />}
          </div>
        </div>
      )}
      
      {/* GLOBAL TOAST NOTIFICATION (Spring Boot / Bootstrap Style) */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          minWidth: '300px',
          backgroundColor: toast.type === 'SUCCESS' ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'Arial, sans-serif',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {toast.message}
          </div>
          <button onClick={hideToast} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '15px', padding: '0', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default Layout;
