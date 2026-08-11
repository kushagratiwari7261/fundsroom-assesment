import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../../utils/auth';
import { useFormContext } from '../../context/FormContext';

const CustomerForm: React.FC = () => {
  const { closeForm, triggerRefresh, showToast } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', businessName: '', gstNumber: '', type: 'RETAIL', address: '', status: 'LEAD', notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://fundsroom-assesment-production.up.railway.app/api/customers', formData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      triggerRefresh();
      closeForm();
      showToast(`Customer onboarded successfully! ID: ${res.data.id.split('-')[0].toUpperCase()}`, 'SUCCESS');
    } catch (error) {
      showToast('Failed to create customer', 'ERROR');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Full Name *</label>
          <input required name="name" type="text" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Mobile *</label>
          <input required name="mobile" type="text" value={formData.mobile} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Email Address</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Customer Type</label>
          <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Business Name</label>
          <input name="businessName" type="text" value={formData.businessName} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>GST Number</label>
          <input name="gstNumber" type="text" value={formData.gstNumber} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Complete Address</label>
        <textarea name="address" value={formData.address} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>Internal Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eef2f9' }}>
        <button type="button" onClick={closeForm} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#4a5568', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#4b3b9b', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
