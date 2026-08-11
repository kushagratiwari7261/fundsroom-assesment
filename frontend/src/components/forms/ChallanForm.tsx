import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { useFormContext } from '../../context/FormContext';
import { X, Plus, Check } from 'lucide-react';

const ChallanForm: React.FC = () => {
  const { closeForm, triggerRefresh, showToast } = useFormContext();
  const [loading, setLoading] = useState(false);
  
  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Data State
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Form State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<{ productId: string, quantity: number }[]>([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const custRes = await axios.get('http://localhost:5000/api/customers', { headers: { Authorization: `Bearer ${getToken()}` } });
        const prodRes = await axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${getToken()}` } });
        setCustomers(custRes.data);
        setProducts(prodRes.data);
        if (custRes.data.length > 0) setCustomerId(custRes.data[0].id);
        if (prodRes.data.length > 0) setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const nextStep = () => {
    if (currentStep === 1 && !customerId) return showToast('Please select a customer', 'ERROR');
    if (currentStep === 2 && (items.length === 0 || !items[0].productId)) return showToast('Please add at least one valid product', 'ERROR');
    setCurrentStep(p => Math.min(p + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(p => Math.max(p - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/challans', { customerId, items }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      triggerRefresh();
      closeForm();
      showToast(`Challan Generated! Memo: ${res.data.challanNumber}`, 'SUCCESS');
    } catch (error) {
      showToast('Failed to create challan. Check stock levels.', 'ERROR');
      setLoading(false);
    }
  };

  const selectedCustomerDetails = customers.find(c => c.id === customerId);
  const getProductDetails = (id: string) => products.find(p => p.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* STEPPER NAVIGATION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '15%', right: '15%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 1, transform: 'translateY(-50%)' }}>
          <div style={{ width: currentStep === 1 ? '0%' : (currentStep === 2 ? '50%' : '100%'), height: '100%', backgroundColor: '#4b3b9b', transition: 'width 0.3s ease' }}></div>
        </div>

        {[1, 2, 3].map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <div 
              key={step} 
              onClick={() => {
                if (step < currentStep) {
                  setCurrentStep(step);
                } else if (step === currentStep + 1) {
                  nextStep(); // Allow clicking the very next step if validation passes
                }
              }}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2,
                cursor: step <= currentStep + 1 ? 'pointer' : 'not-allowed'
              }}
            >
              <div style={{ 
                width: '30px', height: '30px', borderRadius: '50%', 
                backgroundColor: isActive || isCompleted ? '#4b3b9b' : '#ffffff',
                border: isActive || isCompleted ? '2px solid #4b3b9b' : '2px solid #a0a7b5',
                color: isActive || isCompleted ? 'white' : '#a0a7b5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s ease'
              }}>
                {isCompleted ? <Check size={16} /> : step}
              </div>
              <span style={{ fontSize: '0.7rem', color: isActive ? '#4b3b9b' : '#a0a7b5', marginTop: '6px', fontWeight: isActive ? 700 : 500, textTransform: 'uppercase' }}>
                {step === 1 ? 'Customer' : (step === 2 ? 'Items' : 'Review')}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        
        {/* STEP 1: CUSTOMER */}
        {currentStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1a2233' }}>Step 1: Select Customer</h3>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Billing Customer *</label>
            <select required value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}>
              <option value="" disabled>-- Choose a customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
            {selectedCustomerDetails && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '6px', fontSize: '0.85rem', color: '#4a5568', borderLeft: '3px solid #4b3b9b' }}>
                <strong>Mobile:</strong> {selectedCustomerDetails.mobile}<br/>
                <strong>Email:</strong> {selectedCustomerDetails.email || 'N/A'}<br/>
                <strong>GST:</strong> {selectedCustomerDetails.gstNumber || 'Unregistered'}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: PRODUCTS */}
        {currentStep === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1a2233' }}>Step 2: Add Line Items</h3>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <select 
                    value={item.productId} 
                    onChange={e => handleItemChange(index, 'productId', e.target.value)} 
                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                  >
                    <option value="" disabled>Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock}) - ₹{p.unitPrice}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} 
                    style={{ width: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} 
                    placeholder="Qty"
                  />
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={20} />
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => setItems([...items, { productId: products[0]?.id || '', quantity: 1 }])} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#4b3b9b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '10px', fontWeight: 600 }}>
                <Plus size={16} /> Add Product Line
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {currentStep === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1a2233' }}>Step 3: Review & Generate</h3>
            
            <div style={{ backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a2233', marginBottom: '5px' }}>Bill To</div>
              <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>{selectedCustomerDetails?.name}</div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eef2f9', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eef2f9', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '8px 12px', color: '#7b859a' }}>Product</th>
                    <th style={{ padding: '8px 12px', color: '#7b859a', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px 12px', color: '#7b859a', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const prod = getProductDetails(item.productId);
                    const total = (prod?.unitPrice || 0) * item.quantity;
                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #eef2f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{prod?.name || 'Unknown'}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{total.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'right', fontSize: '1.1rem' }}>
              <strong style={{ color: '#7b859a', marginRight: '10px' }}>Grand Total:</strong>
              <strong style={{ color: '#1e8e3e' }}>
                ₹{items.reduce((sum, item) => sum + ((getProductDetails(item.productId)?.unitPrice || 0) * item.quantity), 0).toLocaleString()}
              </strong>
            </div>

          </div>
        )}

        {/* BOTTOM ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #eef2f9' }}>
          
          {currentStep > 1 ? (
            <button type="button" onClick={prevStep} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600 }}>Back</button>
          ) : (
            <button type="button" onClick={closeForm} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#e74c3c', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          )}

          {currentStep < 3 ? (
            <button type="button" onClick={nextStep} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4b3b9b', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Next Step</button>
          ) : (
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#1e8e3e', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
              {loading ? 'Generating...' : 'Confirm & Generate'}
            </button>
          )}

        </div>

      </form>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ChallanForm;
