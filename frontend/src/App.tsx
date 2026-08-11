import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import ChallansPage from './pages/ChallansPage';
import InvoicesPage from './pages/InvoicesPage';

import { FormProvider } from './context/FormContext';

function App() {
  return (
    <FormProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="inventory" element={<ProductsPage />} />
            <Route path="challans" element={<ChallansPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FormProvider>
  );
}

export default App;
