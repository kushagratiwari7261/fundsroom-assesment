import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface FormContextType {
  activeForm: 'customer' | 'product' | 'challan' | null;
  isMinimized: boolean;
  refreshTrigger: number;
  toast: { message: string, type: 'SUCCESS' | 'ERROR' } | null;
  openForm: (formType: 'customer' | 'product' | 'challan') => void;
  closeForm: () => void;
  toggleMinimize: () => void;
  triggerRefresh: () => void;
  showToast: (message: string, type: 'SUCCESS' | 'ERROR') => void;
  hideToast: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeForm, setActiveForm] = useState<'customer' | 'product' | 'challan' | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [toast, setToast] = useState<{ message: string, type: 'SUCCESS' | 'ERROR' } | null>(null);

  const openForm = (formType: 'customer' | 'product' | 'challan') => {
    setActiveForm(formType);
    setIsMinimized(false);
  };

  const closeForm = () => setActiveForm(null);
  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  const showToast = (message: string, type: 'SUCCESS' | 'ERROR') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const hideToast = () => setToast(null);

  return (
    <FormContext.Provider value={{ activeForm, isMinimized, refreshTrigger, toast, openForm, closeForm, toggleMinimize, triggerRefresh, showToast, hideToast }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used within FormProvider');
  return context;
};
