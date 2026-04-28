// hooks/useWizard.js
'use client';

import { useState, useCallback } from 'react';

export default function useWizard(steps = [], initialStep = 0, options = {}) {
  const {
    onStepChange,
    onComplete,
    validateStep
  } = options;
  
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepData, setStepData] = useState({});
  const [stepErrors, setStepErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isComplete, setIsComplete] = useState(false);
  
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepInfo = steps[currentStep];
  
  const validateCurrentStep = useCallback(async () => {
    if (!validateStep) return true;
    
    try {
      const errors = await validateStep(currentStep, stepData);
      if (errors && Object.keys(errors).length > 0) {
        setStepErrors(prev => ({ ...prev, [currentStep]: errors }));
        return false;
      }
      
      setStepErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentStep];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      setStepErrors(prev => ({ ...prev, [currentStep]: { _error: error.message } }));
      return false;
    }
  }, [currentStep, stepData, validateStep]);
  
  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return false;
    
    // Mark current step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    
    // Save step data
    setStepData(prev => ({ ...prev, [currentStep]: stepData[currentStep] || {} }));
    
    if (isLastStep) {
      setIsComplete(true);
      if (onComplete) onComplete(stepData);
      return true;
    }
    
    const newStep = currentStep + 1;
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep, currentStep);
    return true;
  }, [currentStep, isLastStep, stepData, validateCurrentStep, onStepChange, onComplete]);
  
  const prevStep = useCallback(() => {
    if (isFirstStep) return;
    
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    if (onStepChange) onStepChange(newStep, currentStep);
  }, [currentStep, isFirstStep, onStepChange]);
  
  const goToStep = useCallback(async (step) => {
    if (step < 0 || step >= totalSteps) return false;
    
    // Validate all steps up to the target
    for (let i = 0; i < step; i++) {
      if (!completedSteps.has(i)) {
        // Need to validate previous steps
        const isValid = await validateStep?.(i, stepData);
        if (!isValid) return false;
      }
    }
    
    setCurrentStep(step);
    if (onStepChange) onStepChange(step, currentStep);
    return true;
  }, [totalSteps, completedSteps, stepData, validateStep, currentStep, onStepChange]);
  
  const updateStepData = useCallback((data) => {
    setStepData(prev => ({
      ...prev,
      [currentStep]: { ...prev[currentStep], ...data }
    }));
  }, [currentStep]);
  
  const getStepData = useCallback((step = currentStep) => {
    return stepData[step] || {};
  }, [stepData, currentStep]);
  
  const getStepError = useCallback((step = currentStep, field = null) => {
    const stepError = stepErrors[step];
    if (!stepError) return null;
    if (field) return stepError[field];
    return stepError;
  }, [stepErrors, currentStep]);
  
  const isStepValid = useCallback((step = currentStep) => {
    return !stepErrors[step] || Object.keys(stepErrors[step]).length === 0;
  }, [stepErrors, currentStep]);
  
  const isStepCompleted = useCallback((step) => {
    return completedSteps.has(step);
  }, [completedSteps]);
  
  const getProgress = useCallback(() => {
    return (completedSteps.size / totalSteps) * 100;
  }, [completedSteps.size, totalSteps]);
  
  const resetWizard = useCallback(() => {
    setCurrentStep(initialStep);
    setStepData({});
    setStepErrors({});
    setCompletedSteps(new Set());
    setIsComplete(false);
  }, [initialStep]);
  
  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    isComplete,
    currentStepInfo,
    stepData,
    stepErrors,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    updateStepData,
    getStepData,
    getStepError,
    isStepValid,
    isStepCompleted,
    getProgress,
    resetWizard
  };
}