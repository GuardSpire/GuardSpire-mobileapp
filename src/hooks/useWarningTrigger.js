import { useState } from 'react';

export const useWarningTrigger = () => {
  const [showWarning, setShowWarning] = useState(false);

  // This would be called from your existing notification service
  // when backend detects spam (no changes needed to service)
  const triggerWarning = () => {
    setShowWarning(true);
  };

  return {
    showWarning,
    triggerWarning,
    onClose: () => setShowWarning(false)
  };
};