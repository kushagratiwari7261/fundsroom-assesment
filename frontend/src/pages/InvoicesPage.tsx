import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Eye, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { getToken } from '../utils/auth';
import { useFormContext } from '../context/FormContext';
import { useReactToPrint } from 'react-to-print';
import { PrintableInvoice } from '../components/PrintableInvoice';

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedInvoice ? `Invoice_${selectedInvoice.challanNumber}` : 'Invoice',
  });

  const { refreshTrigger } = useFormContext();
  const itemsPerPage = 8;

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('https://fundsroom-assesment-production.up.railway.app/api/challans', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      // ONLY SHOW CONFIRMED CHALLANS IN THE INVOICES TAB
      setInvoices(response.data.filter((c: any) => c.status === 'CONFIRMED'));
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(c => 
    c.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.customer?.name && c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#333' }}>Tax Invoices</h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eef2f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eef2f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#a0a7b5" />
          <input 
            type="text" 
            placeholder="Search by invoice number or customer..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading invoices...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eef2f9', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Invoice No.</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Customer</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Total Qty</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Date & By</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eef2f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.challanNumber}</td>
                    <td style={{ padding: '12px 16px' }}>{c.customer?.name || 'Unknown'}</td>
                    <td style={{ padding: '12px 16px' }}>{c.totalQuantity} items</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#7b859a' }}>{c.user?.name || 'User'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => setSelectedInvoice(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '4px', border: '1px solid #d2d6de', backgroundColor: '#f8fafc', color: '#3c8dbc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s' }}>
                        <Eye size={14} /> View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#7b859a' }}>No invoices found.</td>
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

      {/* FULL PAGE INVOICE MODAL */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '40px 20px' }}>
          
          <div style={{ width: '210mm', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* TOOLBAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#333' }}>Invoice Document Viewer</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#4b3b9b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button onClick={() => setSelectedInvoice(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#d93025', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <X size={16} /> Close
                </button>
              </div>
            </div>

            {/* A4 PRINTABLE AREA */}
            <div style={{ width: '100%', backgroundColor: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', minHeight: '297mm' }}>
              <PrintableInvoice ref={printRef} challan={selectedInvoice} />
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default InvoicesPage;
