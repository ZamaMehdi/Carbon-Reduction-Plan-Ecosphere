// src/hooks/useBranchHandler.js
import { useCallback } from 'react';

export default function useBranchHandler(formData, setFormData) {
  const addBranch = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      branches: [...prev.branches, { name: '', address: '', financial: '', operational: '' }],
    }));
  }, [setFormData]);

  const removeBranch = useCallback((indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.filter((_, index) => index !== indexToRemove),
    }));
  }, [setFormData]);

  const handleBranchChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedBranches = [...prev.branches];
      updatedBranches[index][field] = value;
      return { ...prev, branches: updatedBranches };
    });
  }, [setFormData]);

  return {
    addBranch,
    removeBranch,
    handleBranchChange,
  };
}
