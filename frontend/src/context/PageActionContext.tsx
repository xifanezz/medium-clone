// src/context/PageActionContext.tsx

import { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';

interface PageActionContextType {
  isSaving: boolean;
  executeSaveAction: () => Promise<void>;
  setSaveAction: (action: (() => Promise<void>) | null) => void;
}

const PageActionContext = createContext<PageActionContextType | undefined>(undefined);

export const PageActionProvider = ({ children }: { children: ReactNode }) => {
  const [isSaving, setIsSaving] = useState(false);
  // Use a ref to hold the function, preventing re-renders when it's set
  const saveActionRef = useRef<(() => Promise<void>) | null>(null);

  const setSaveAction = useCallback((action: (() => Promise<void>) | null) => {
    saveActionRef.current = action;
  }, []);

  const executeSaveAction = async () => {
    if (saveActionRef.current) {
      setIsSaving(true);
      try {
        await saveActionRef.current();
      } catch (error) {
        // The page's own error handling will manage the UI
        console.error("Save action failed:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const value = { isSaving, executeSaveAction, setSaveAction };

  return (
    <PageActionContext.Provider value={value}>
      {children}
    </PageActionContext.Provider>
  );
};

export const usePageAction = () => {
  const context = useContext(PageActionContext);
  if (context === undefined) {
    throw new Error('usePageAction must be used within a PageActionProvider');
  }
  return context;
};
