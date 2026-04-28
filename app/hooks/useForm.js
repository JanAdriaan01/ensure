// hooks/useForm.js
'use client';

import { useState, useCallback } from 'react';

export default function useForm(initialValues = {}, options = {}) {
  const {
    validate,
    onSubmit,
    onError,
    resetOnSubmit = false
  } = options;
  
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  
  const validateField = useCallback(async (name, value) => {
    if (!validate) return null;
    
    try {
      const error = await validate[name]?.(value, values);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return null;
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [name]: error.message }));
      return error.message;
    }
  }, [validate, values]);
  
  const validateForm = useCallback(async () => {
    if (!validate) return true;
    
    const validationErrors = {};
    let hasErrors = false;
    
    for (const [name, value] of Object.entries(values)) {
      if (validate[name]) {
        const error = await validate[name](value, values);
        if (error) {
          validationErrors[name] = error;
          hasErrors = true;
        }
      }
    }
    
    setErrors(validationErrors);
    setIsValid(!hasErrors);
    return !hasErrors;
  }, [validate, values]);
  
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  }, [touched, validateField]);
  
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  }, [values, validateField]);
  
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);
  
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
  }, [initialValues]);
  
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    const isValidForm = await validateForm();
    if (!isValidForm) {
      if (onError) onError(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      if (resetOnSubmit) {
        resetForm();
      }
    } catch (error) {
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit, onError, resetOnSubmit, resetForm, errors]);
  
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: errors[name],
    touched: touched[name]
  }), [values, errors, touched, handleChange, handleBlur]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateForm,
    getFieldProps
  };
}