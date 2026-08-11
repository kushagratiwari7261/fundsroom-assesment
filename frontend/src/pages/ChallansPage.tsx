import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FilePlus, Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { getToken, getUserRole } from '../utils/auth';
import { useFormContext } from '../context/FormContext';

const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChallan, setSelectedChallan] = useState<any | null>(null);

  const { openForm, refreshTrigger, showToast } = useFormContext();
  const role = getUserRole();
  const itemsPerPage = 8;

  useEffect(() => {
    fetchChallans();
  }, [refreshTrigger]);

  const fetchChallans = async () => {
    try {
      const response = await axios.get('https://fundsroom-assesment-production.up.railway.app/api/challans', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setChallans(response.data);
    } catch (error) {
      console.error('Failed to fetch challans:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, action: 'confirm' | 'cancel') => {
    try {
      await axios.put(`https://fundsroom-assesment-production.up.railway.app/api/challans/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      showToast?.(`Challan ${action === 'confirm' ? 'Confirmed (Stock Deducted)' : 'Cancelled'}!`, 'SUCCESS');
      fetchChallans();
    } catch (error: any) {
      showToast?.(error.response?.data?.error || 'Failed to update challan', 'ERROR');
    }
  };

  const filteredChallans = challans.filter(c => 
    c.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.customer?.name && c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredChallans.length / itemsPerPage);
  const paginatedChallans = filteredChallans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#333' }}>Sales Challans</h1>
        {(role === 'ADMIN' || role === 'SALES') && (
          <button onClick={() => openForm('challan')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#4b3b9b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            <FilePlus size={18} /> Create Challan
          </button>
        )}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eef2f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eef2f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#a0a7b5" />
          <input 
            type="text" 
            placeholder="Search by challan number or customer..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading challans...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eef2f9', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Challan No.</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Customer</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Total Qty</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Date & By</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedChallans.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eef2f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.challanNumber}</td>
                    <td style={{ padding: '12px 16px' }}>{c.customer?.name || 'Unknown'}</td>
                    <td style={{ padding: '12px 16px' }}>{c.totalQuantity} items</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#7b859a' }}>{c.user?.name || 'User'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: c.status === 'CONFIRMED' ? '#e6f4ea' : (c.status === 'DRAFT' ? '#fff8e1' : '#fef0f0'), color: c.status === 'CONFIRMED' ? '#1e8e3e' : (c.status === 'DRAFT' ? '#f57f17' : '#d93025') }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setSelectedChallan(c)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d2d6de', backgroundColor: '#f8fafc', color: '#3c8dbc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}>
                          <Eye size={14} /> Details
                        </button>

                        {c.status === 'DRAFT' && (role === 'ADMIN' || role === 'SALES') && (
                          <>
                            <button onClick={() => updateStatus(c.id, 'confirm')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #1e8e3e', backgroundColor: '#e6f4ea', color: '#1e8e3e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}>
                              <CheckCircle size={14} /> Confirm
                            </button>
                          </>
                        )}
                        
                        {c.status !== 'CANCELLED' && (role === 'ADMIN' || role === 'SALES') && (
                          <button onClick={() => updateStatus(c.id, 'cancel')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d93025', backgroundColor: '#fef0f0', color: '#d93025', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}>
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedChallans.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#7b859a' }}>No challans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
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

      {/* CHALLAN DETAILS MODAL */}
      {selectedChallan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', width: '600px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eef2f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Invoice: {selectedChallan.challanNumber}</h2>
              <button onClick={() => setSelectedChallan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b859a' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Customer</strong> {selectedChallan.customer?.name}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Status</strong> {selectedChallan.status}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Created At</strong> {new Date(selectedChallan.createdAt).toLocaleString()}</div>
                <div><strong style={{ display: 'block', fontSize: '0.8rem', color: '#7b859a' }}>Generated By</strong> {selectedChallan.user?.name || 'Unknown'}</div>
              </div>
              
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #eef2f9', paddingBottom: '10px', marginBottom: '10px' }}>Line Items Snapshot</h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ color: '#7b859a', textAlign: 'left', borderBottom: '1px solid #eef2f9' }}>
                    <th style={{ padding: '8px' }}>Product</th>
                    <th style={{ padding: '8px' }}>SKU</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items?.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '8px' }}>{item.productName}</td>
                      <td style={{ padding: '8px', color: '#7b859a' }}>{item.productSku}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.unitPrice.toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!selectedChallan.items || selectedChallan.items.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ padding: '15px', textAlign: 'center', color: '#7b859a' }}>No items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '1.1rem' }}>
                <strong style={{ color: '#7b859a', marginRight: '15px' }}>Grand Total:</strong>
                <strong>
                  ₹{selectedChallan.items?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0).toLocaleString() || 0}
                </strong>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChallansPage;
