import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { useFormContext } from '../../context/FormContext';

const ProductForm: React.FC = () => {
  const { closeForm, triggerRefresh, showToast } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', unitPrice: '', 
    currentStock: '', minStockAlert: '10', location: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate SKU if Name changes and SKU hasn't been manually heavily edited
    if (name === 'name' && (!formData.sku || formData.sku.length < 10)) {
      const generatedSku = value
        .split(' ')
        .map(word => word.substring(0, 3).toUpperCase())
        .join('-') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      setFormData({ ...formData, name: value, sku: value.trim() ? generatedSku : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock) || 0,
        minStockAlert: parseInt(formData.minStockAlert) || 10
      };
      const res = await axios.post('https://fundsroom-assesment-production.up.railway.app/api/products', payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      triggerRefresh();
      closeForm();
      showToast(`Inventory added! SKU: ${res.data.sku}`, 'SUCCESS');
    } catch (error) {
      showToast('Failed to save product', 'ERROR');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Product Name *</label>
          <input required name="name" type="text" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>SKU Code *</label>
          <input required name="sku" type="text" value={formData.sku} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Category *</label>
          <input required name="category" type="text" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Unit Price (₹) *</label>
          <input required name="unitPrice" type="number" step="0.01" value={formData.unitPrice} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Initial Stock</label>
          <input name="currentStock" type="number" value={formData.currentStock} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Min Alert Level</label>
          <input required name="minStockAlert" type="number" value={formData.minStockAlert} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Bin Location</label>
          <input name="location" type="text" value={formData.location} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eef2f9' }}>
        <button type="button" onClick={closeForm} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4b3b9b', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
