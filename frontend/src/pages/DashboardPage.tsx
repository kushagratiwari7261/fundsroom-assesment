import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken, getUserRole } from '../utils/auth';
import { 
  Users, Package, FileText, AlertTriangle, 
  BarChart2, List, DollarSign, TrendingDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('https://fundsroom-assesment-production.up.railway.app/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skel { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 400px 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
      `}</style>
      <div style={{ borderBottom: '2px solid #343a40', paddingBottom: '10px' }}>
        <div className="skel" style={{ width: '220px', height: '28px' }}></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        {[1,2,3].map(i => <div key={i} className="skel" style={{ height: '110px', borderRadius: '4px' }}></div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="skel" style={{ height: '380px', borderRadius: '4px' }}></div>
        <div className="skel" style={{ height: '380px', borderRadius: '4px' }}></div>
      </div>
    </div>
  );

  const role = stats?.role || getUserRole();

  // -------------------------------------------------------------
  // SPRING BOOT / ENTERPRISE STYLED COMPONENTS
  // -------------------------------------------------------------
  
  const KPICard = ({ title, value, icon: Icon, color, footerText }: any) => (
    <div style={{ backgroundColor: color, color: 'white', borderRadius: '4px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>{title}</div>
        </div>
        <Icon size={48} opacity={0.3} />
      </div>
      <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '5px 15px', fontSize: '0.8rem', textAlign: 'center' }}>
        {footerText}
      </div>
    </div>
  );

  const Panel = ({ title, icon: Icon, children }: any) => (
    <div style={{ backgroundColor: 'white', border: '1px solid #d2d6de', borderRadius: '3px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
      <div style={{ backgroundColor: '#f4f4f4', borderBottom: '1px solid #d2d6de', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={16} color="#343a40" />
        <h3 style={{ margin: 0, color: '#343a40', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
      </div>
      <div style={{ padding: '15px' }}>
        {children}
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // ROLE SPECIFIC VIEWS
  // -------------------------------------------------------------

  const renderAccountsDashboard = () => {
    const fin = stats.financials;
    if (!fin) return null;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <KPICard title="Total Revenue" value={`Rs. ${fin.totalRevenue.toLocaleString()}`} icon={DollarSign} color="#28a745" footerText="Accounts Module" />
          <KPICard title="Confirmed Challans" value={fin.totalConfirmedChallans} icon={FileText} color="#17a2b8" footerText="Invoicing Ready" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
          <Panel title="Revenue (Last 7 Days)" icon={BarChart2}>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fin.revenueChart} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d2d6de" />
                  <XAxis dataKey="name" tick={{ fill: '#343a40', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#343a40', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue (Rs)" stroke="#28a745" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Recent Invoices" icon={List}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {fin.recentChallans.map((c: any) => (
                <li key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f4f4f4' }}>
                  <div style={{ fontWeight: 'bold', color: '#3c8dbc' }}>{c.challanNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#777' }}>{c.customer?.name} - {new Date(c.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </>
    );
  };

  const renderSalesDashboard = () => {
    const sls = stats.sales;
    if (!sls) return null;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          <KPICard title="Total Customers" value={sls.totalCustomers} icon={Users} color="#17a2b8" footerText="CRM Module" />
          <KPICard title="Challans Generated" value={sls.totalChallans} icon={FileText} color="#3c8dbc" footerText="Sales Module" />
          <KPICard title="Draft Challans" value={sls.draftChallans} icon={FileText} color="#ffc107" footerText="Pending Confirmation" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
          <Panel title="Challan Generation (Last 7 Days)" icon={BarChart2}>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sls.challanChart} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d2d6de" />
                  <XAxis dataKey="name" tick={{ fill: '#343a40', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#343a40', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f4f4f4' }} />
                  <Legend />
                  <Bar dataKey="count" name="Challans" fill="#3c8dbc" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Recent Onboardings" icon={List}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {sls.recentCustomers.map((c: any) => (
                <li key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #f4f4f4' }}>
                  <div style={{ fontWeight: 'bold', color: '#3c8dbc' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#777' }}>Type: {c.type} - {new Date(c.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </>
    );
  };

  const renderWarehouseDashboard = () => {
    const inv = stats.inventory;
    if (!inv) return null;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
          <KPICard title="Active Inventory" value={inv.totalProducts} icon={Package} color="#28a745" footerText="Warehouse Module" />
          <KPICard title="Low Stock Alerts" value={inv.lowStockCount} icon={AlertTriangle} color="#dc3545" footerText="Action Required" />
          <KPICard title="Items Dispatched" value={inv.totalDispatched} icon={TrendingDown} color="#605ca8" footerText="Total OUT Movements" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
          <Panel title="Lowest Stock Items" icon={BarChart2}>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inv.lowestStockChart} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#d2d6de" />
                  <XAxis type="number" tick={{ fill: '#343a40', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#343a40', fontSize: 11 }} width={100} />
                  <Tooltip cursor={{ fill: '#f4f4f4' }} />
                  <Legend />
                  <Bar dataKey="stock" name="Current Stock" fill="#dc3545" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Recent Stock Movements" icon={List}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {inv.recentMovements.map((m: any) => (
                <li key={m.id} style={{ padding: '10px 0', borderBottom: '1px solid #f4f4f4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: '#3c8dbc', fontSize: '0.9rem' }}>{m.product?.name}</div>
                    <span style={{ padding: '2px 6px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: m.type === 'IN' ? '#e6f4ea' : '#fef0f0', color: m.type === 'IN' ? '#1e8e3e' : '#d93025' }}>
                      {m.type} {m.quantity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#777', marginTop: '4px' }}>{new Date(m.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '2px solid #343a40', paddingBottom: '10px', marginBottom: '10px' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#343a40', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {role} Dashboard
        </h1>
      </div>

      {role === 'ACCOUNTS' && renderAccountsDashboard()}
      {role === 'SALES' && renderSalesDashboard()}
      {role === 'WAREHOUSE' && renderWarehouseDashboard()}
      
      {role === 'ADMIN' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#343a40', marginBottom: '10px', borderBottom: '1px solid #d2d6de', paddingBottom: '5px' }}>Financial Analytics</h2>
            {renderAccountsDashboard()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#343a40', marginBottom: '10px', borderBottom: '1px solid #d2d6de', paddingBottom: '5px' }}>Sales & CRM Analytics</h2>
            {renderSalesDashboard()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#343a40', marginBottom: '10px', borderBottom: '1px solid #d2d6de', paddingBottom: '5px' }}>Inventory Analytics</h2>
            {renderWarehouseDashboard()}
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
