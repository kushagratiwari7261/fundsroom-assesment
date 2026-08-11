const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ id: '1', role: 'ADMIN' }, 'your_super_secret_jwt_key', { expiresIn: '1d' });
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const custRes = await fetch('http://localhost:5000/api/customers', { method: 'POST', body: JSON.stringify({ name: 'Test Customer', mobile: '1234567890', type: 'RETAIL', status: 'ACTIVE' }), headers });
    const custData = await custRes.json();
    const customerId = custData.id;

    const prodRes = await fetch('http://localhost:5000/api/products', { method: 'POST', body: JSON.stringify({ name: 'Test Product', sku: 'TEST-001', category: 'TEST', unitPrice: 100, currentStock: 50, minStockAlert: 10 }), headers });
    const prodData = await prodRes.json();
    const productId = prodData.id;

    const challanRes = await fetch('http://localhost:5000/api/challans', { method: 'POST', body: JSON.stringify({ customerId, items: [{ productId, quantity: 1 }] }), headers });
    
    if (!challanRes.ok) {
      const errorText = await challanRes.text();
      throw new Error(errorText);
    }
    const challanData = await challanRes.json();
    console.log('Success:', challanData);
  } catch (error) {
    console.error('Error response:', error.message);
  }
}

test();
