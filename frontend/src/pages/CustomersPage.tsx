import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Eye, X, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { getToken, getUserRole } from '../utils/auth';
import { useFormContext } from '../context/FormContext';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  // Edit State for Follow-up
  const [editNotes, setEditNotes] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  const { openForm, refreshTrigger, showToast } = useFormContext();
  const role = getUserRole();
  const itemsPerPage = 8;

  useEffect(() => {
    fetchCustomers();
  }, [refreshTrigger]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('https://fundsroom-assesment-production.up.railway.app/api/customers', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setEditNotes(customer.notes || '');
    setEditFollowUpDate(customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '');
  };

  const saveCustomerNotes = async () => {
    if (!selectedCustomer) return;
    setSavingCustomer(true);
    try {
      await axios.put(`https://fundsroom-assesment-production.up.railway.app/api/customers/${selectedCustomer.id}`, {
        notes: editNotes,
        followUpDate: editFollowUpDate ? new Date(editFollowUpDate).toISOString() : null
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      showToast?.('Customer notes updated successfully', 'SUCCESS');
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      showToast?.('Failed to update customer', 'ERROR');
    } finally {
      setSavingCustomer(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.mobile.includes(searchQuery) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#333' }}>Customers</h1>
        {(role === 'ADMIN' || role === 'SALES') && (
          <button onClick={() => openForm('customer')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#4b3b9b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            <UserPlus size={18} /> Add Customer
          </button>
        )}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eef2f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eef2f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#a0a7b5" />
          <input 
            type="text" 
            placeholder="Search by name, email, or mobile..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading customers...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eef2f9', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Name</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Mobile</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Type</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eef2f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7b859a' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{c.mobile}</td>
                    <td style={{ padding: '12px 16px' }}>{c.type}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: c.status === 'ACTIVE' ? '#e6f4ea' : (c.status === 'LEAD' ? '#e8f0fe' : '#fef0f0'), color: c.status === 'ACTIVE' ? '#1e8e3e' : (c.status === 'LEAD' ? '#1a73e8' : '#d93025') }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleOpenDetails(c)} style={{ background: 'none', border: 'none', color: '#3c8dbc', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Eye size={16} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#7b859a' }}>No customers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eef2f9', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '0.85rem', color: '#7b859a' }}>Page {currentPage} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 12px', border: '1px solid #d2d6de', borderRadius: '4px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16} /></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 12px', border: '1px solid #d2d6de', borderRadius: '4px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CUSTOMER DETAILS & EDIT MODAL */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', width: '500px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eef2f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Customer Profile</h2>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b859a' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Name</strong> {selectedCustomer.name}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Business Name</strong> {selectedCustomer.businessName || 'N/A'}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Email</strong> {selectedCustomer.email || 'N/A'}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Mobile</strong> {selectedCustomer.mobile}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>GST Number</strong> {selectedCustomer.gstNumber || 'N/A'}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Type</strong> {selectedCustomer.type}</div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eef2f9', margin: '15px 0' }} />
              <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Address</strong> {selectedCustomer.address || 'N/A'}</div>
              
              <div style={{ marginTop: '15px' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a', marginBottom: '5px' }}>Follow-up Date</strong>
                <input type="date" value={editFollowUpDate} onChange={e => setEditFollowUpDate(e.target.value)} style={{ padding: '8px', width: '100%', border: '1px solid #d2d6de', borderRadius: '4px' }} disabled={role !== 'ADMIN' && role !== 'SALES'} />
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a', marginBottom: '5px' }}>Internal Notes</strong>
                <textarea rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)} style={{ padding: '8px', width: '100%', border: '1px solid #d2d6de', borderRadius: '4px', resize: 'none' }} disabled={role !== 'ADMIN' && role !== 'SALES'}></textarea>
              </div>

              {(role === 'ADMIN' || role === 'SALES') && (
                <button onClick={saveCustomerNotes} disabled={savingCustomer} style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#4b3b9b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> {savingCustomer ? 'Saving...' : 'Save Updates'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
