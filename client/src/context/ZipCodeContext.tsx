import { createContext, useContext, useState, ReactNode } from 'react';

interface ZipCodeContextType {
  zipCode: string;
  setZipCode: (zipCode: string) => void;
}

const ZipCodeContext = createContext<ZipCodeContextType | undefined>(undefined);

export const ZipCodeProvider = ({ children }: { children: ReactNode }) => {
  const [zipCode, setZipCode] = useState('');

  return (
    <ZipCodeContext.Provider value={{ zipCode, setZipCode }}>
      {children}
    </ZipCodeContext.Provider>
  );
};

export const useZipCode = () => {
  const context = useContext(ZipCodeContext);
  if (context === undefined) {
    throw new Error('useZipCode must be used within a ZipCodeProvider');
  }
  return context;
};