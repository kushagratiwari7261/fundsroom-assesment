import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Search, History, X, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getToken, getUserRole } from '../utils/auth';
import { useFormContext } from '../context/FormContext';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [historyProduct, setHistoryProduct] = useState<any | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const { openForm, refreshTrigger, apiCache, setApiCache } = useFormContext();
  const role = getUserRole();
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger, apiCache, setApiCache]);

  const fetchProducts = async () => {
    if (apiCache['products']) {
      setProducts(apiCache['products']);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get('https://fundsroom-assesment-production.up.railway.app/api/products', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProducts(response.data);
      setApiCache('products', response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (product: any) => {
    setHistoryProduct(product);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`https://fundsroom-assesment-production.up.railway.app/api/products/${product.id}/history`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setHistoryData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#333' }}>Inventory</h1>
        {(role === 'ADMIN' || role === 'WAREHOUSE') && (
          <button onClick={() => openForm('product')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#4b3b9b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            <PackagePlus size={18} /> Add Product
          </button>
        )}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eef2f9', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eef2f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={18} color="#a0a7b5" />
          <input 
            type="text" 
            placeholder="Search by name, SKU, or category..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem' }}
          />
        </div>
        
        {loading ? (
          <>
            <style>{`
              @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
              .skel { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 400px 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
            `}</style>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="skel" style={{ width: '22%', height: '18px' }}></div>
                  <div className="skel" style={{ width: '12%', height: '18px' }}></div>
                  <div className="skel" style={{ width: '12%', height: '18px' }}></div>
                  <div className="skel" style={{ width: '14%', height: '24px', borderRadius: '12px' }}></div>
                  <div className="skel" style={{ width: '10%', height: '18px', marginLeft: 'auto' }}></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eef2f9', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Product</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>SKU</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Price</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem' }}>Stock Level</th>
                  <th style={{ padding: '12px 16px', color: '#7b859a', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(p => {
                  const isLow = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eef2f9', backgroundColor: isLow ? '#fffcfc' : 'white' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                        {p.name}
                        <div style={{ fontSize: '0.75rem', color: '#7b859a' }}>{p.category}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#7b859a' }}>{p.sku}</td>
                      <td style={{ padding: '12px 16px' }}>Rs. {p.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: isLow ? '#fef0f0' : '#e6f4ea', color: isLow ? '#d93025' : '#1e8e3e' }}>
                          {p.currentStock} in stock
                        </span>
                        {isLow && <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#d93025' }}>Low Stock Alert!</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => fetchHistory(p)} style={{ background: 'none', border: 'none', color: '#3c8dbc', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <History size={16} /> History
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#7b859a' }}>No products found.</td>
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

      {/* STOCK HISTORY MODAL */}
      {historyProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #eef2f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>Stock Movement History</h2>
                <div style={{ fontSize: '0.85rem', color: '#7b859a', marginTop: '2px' }}>{historyProduct.name} ({historyProduct.sku})</div>
              </div>
              <button onClick={() => setHistoryProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b859a' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '0', overflowY: 'auto' }}>
              {historyLoading ? (
                <div style={{ padding: '30px', textAlign: 'center' }}>Loading history...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eef2f9', textAlign: 'left', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '10px 20px', color: '#7b859a', fontWeight: 500, fontSize: '0.8rem' }}>Date</th>
                      <th style={{ padding: '10px 20px', color: '#7b859a', fontWeight: 500, fontSize: '0.8rem' }}>Type</th>
                      <th style={{ padding: '10px 20px', color: '#7b859a', fontWeight: 500, fontSize: '0.8rem' }}>Qty</th>
                      <th style={{ padding: '10px 20px', color: '#7b859a', fontWeight: 500, fontSize: '0.8rem' }}>Reason & User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map(h => (
                      <tr key={h.id} style={{ borderBottom: '1px solid #eef2f9' }}>
                        <td style={{ padding: '12px 20px', fontSize: '0.85rem' }}>{new Date(h.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: h.type === 'IN' ? '#e6f4ea' : '#fef0f0', color: h.type === 'IN' ? '#1e8e3e' : '#d93025' }}>
                            {h.type === 'IN' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                            {h.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{h.quantity}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ fontSize: '0.85rem' }}>{h.reason}</div>
                          <div style={{ fontSize: '0.75rem', color: '#7b859a' }}>By: {h.user?.name || 'System'}</div>
                        </td>
                      </tr>
                    ))}
                    {historyData.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#7b859a' }}>No movement history.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
