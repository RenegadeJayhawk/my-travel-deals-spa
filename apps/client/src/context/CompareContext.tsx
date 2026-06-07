import { createContext, useContext, useState, ReactNode } from 'react';
import type { TravelDeal } from '../types/deals';

interface CompareContextType {
  selectedDeals: TravelDeal[];
  selectedDealIds: string[];
  toggleCompare: (deal: TravelDeal) => void;
  clearComparison: () => void;
  isMaxSelected: boolean;
}

const MAX_COMPARE_LIMIT = 3;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedDeals, setSelectedDeals] = useState<TravelDeal[]>([]);

  const selectedDealIds = selectedDeals.map((d) => d.id);
  const isMaxSelected = selectedDeals.length >= MAX_COMPARE_LIMIT;

  const toggleCompare = (deal: TravelDeal) => {
    setSelectedDeals((prev) => {
      const isSelected = prev.some((d) => d.id === deal.id);
      if (isSelected) {
        return prev.filter((d) => d.id !== deal.id);
      }
      if (prev.length >= MAX_COMPARE_LIMIT) {
        alert(`You can only compare up to ${MAX_COMPARE_LIMIT} deals at a time.`);
        return prev;
      }
      return [...prev, deal];
    });
  };

  const clearComparison = () => {
    setSelectedDeals([]);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedDeals,
        selectedDealIds,
        toggleCompare,
        clearComparison,
        isMaxSelected,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareSelection() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompareSelection must be used within a CompareProvider');
  }
  return context;
}
