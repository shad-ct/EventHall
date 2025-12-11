import React, { useState, useEffect } from 'react';
import { RegistrationFormQuestion } from '../types';
import { X, AlertCircle } from 'lucide-react';

interface RegistrationFormModalProps {
  isOpen: boolean;
  eventTitle: string;
  questions: RegistrationFormQuestion[];
  onSubmit: (responses: any[]) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const RegistrationFormModal: React.FC<RegistrationFormModalProps> = ({
  isOpen,
  eventTitle,
  questions,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize form data
      const initialData: Record<string, string | string[]> = {};
      questions.forEach(q => {
        if (q.questionType === 'multi-select') {
          initialData[q.id] = [];
        } else {
          initialData[q.id] = '';
        }
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, questions]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    questions.forEach(q => {
      if (q.isRequired) {
        const value = formData[q.id];
        if (
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[q.id] = `${q.questionText} is required`;
        }
      }

      // Email validation
      if (q.questionType === 'email' && formData[q.id]) {
        const email = formData[q.id] as string;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors[q.id] = 'Please enter a valid email address';
        }
      }

      // URL validation
      if (q.questionType === 'url' && formData[q.id]) {
        const url = formData[q.id] as string;
        try {
          new URL(url);
        } catch {
          newErrors[q.id] = 'Please enter a valid URL';
        }
      }

      // Phone number validation - check if question is asking for phone
      const questionTextLower = q.questionText.toLowerCase();
      if ((questionTextLower.includes('phone') || questionTextLower.includes('mobile') || questionTextLower.includes('contact')) && formData[q.id]) {
        const phone = (formData[q.id] as string).replace(/\D/g, ''); // Remove non-digits
        if (phone.length !== 10) {
          newErrors[q.id] = 'Please enter a valid 10-digit phone number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Convert form data to response format
      const responses = questions.map(q => ({
        questionId: q.id,
        answer: Array.isArray(formData[q.id])
          ? (formData[q.id] as string[]).join(', ')
          : (formData[q.id] as string),
      }));

      await onSubmit(responses);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value,
    }));
    // Clear error for this field
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{eventTitle}</h2>
            <p className="text-sm text-gray-600 mt-1">Please complete the registration form</p>
          </div>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {questions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No questions to display</p>
          ) : (
            questions.map(question => (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  {question.questionText}
                  {question.isRequired && <span className="text-red-600 ml-1">*</span>}
                </label>

                {question.questionType === 'text' && (
                  <input
                    type={
                      question.questionText.toLowerCase().includes('phone') || 
                      question.questionText.toLowerCase().includes('mobile')
                        ? "tel"
                        : "text"
                    }
                    value={(formData[question.id] as string) || ''}
                    onChange={e => {
                      const isPhone = question.questionText.toLowerCase().includes('phone') || 
                                      question.questionText.toLowerCase().includes('mobile');
                      // For phone fields, only allow digits and limit to 10
                      if (isPhone) {
                        const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleInputChange(question.id, numericValue);
                      } else {
                        handleInputChange(question.id, e.target.value);
                      }
                    }}
                    required={question.isRequired}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      question.questionText.toLowerCase().includes('phone') || 
                      question.questionText.toLowerCase().includes('mobile')
                        ? "Enter 10-digit phone number"
                        : "Enter your answer"
                    }
                    maxLength={
                      question.questionText.toLowerCase().includes('phone') || 
                      question.questionText.toLowerCase().includes('mobile')
                        ? 10
                        : undefined
                    }
                    pattern={
                      question.questionText.toLowerCase().includes('phone') || 
                      question.questionText.toLowerCase().includes('mobile')
                        ? "[0-9]{10}"
                        : undefined
                    }
                    title={
                      question.questionText.toLowerCase().includes('phone') || 
                      question.questionText.toLowerCase().includes('mobile')
                        ? "Please enter a 10-digit phone number"
                        : undefined
                    }
                  />
                )}

                {question.questionType === 'email' && (
                  <input
                    type="email"
                    value={(formData[question.id] as string) || ''}
                    onChange={e => handleInputChange(question.id, e.target.value)}
                    required={question.isRequired}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                )}

                {question.questionType === 'url' && (
                  <input
                    type="url"
                    value={(formData[question.id] as string) || ''}
                    onChange={e => handleInputChange(question.id, e.target.value)}
                    required={question.isRequired}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                )}

                {question.questionType === 'textarea' && (
                  <textarea
                    value={(formData[question.id] as string) || ''}
                    onChange={e => handleInputChange(question.id, e.target.value)}
                    required={question.isRequired}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your answer"
                  />
                )}

                {question.questionType === 'dropdown' && (
                  <select
                    value={(formData[question.id] as string) || ''}
                    onChange={e => handleInputChange(question.id, e.target.value)}
                    required={question.isRequired}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select an option</option>
                    {(question.options || []).map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.questionType === 'yes/no' && (
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value="Yes"
                        checked={(formData[question.id] as string) === 'Yes'}
                        onChange={e => handleInputChange(question.id, e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value="No"
                        checked={(formData[question.id] as string) === 'No'}
                        onChange={e => handleInputChange(question.id, e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">No</span>
                    </label>
                  </div>
                )}

                {question.questionType === 'multi-select' && (
                  <div className="space-y-2">
                    {(question.options || []).map(option => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData[question.id] as string[]).includes(option)}
                          onChange={e => {
                            const current = (formData[question.id] as string[]) || [];
                            const updated = e.target.checked
                              ? [...current, option]
                              : current.filter(o => o !== option);
                            handleInputChange(question.id, updated);
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {errors[question.id] && (
                  <div className="flex gap-2 mt-1 text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{errors[question.id]}</span>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isLoading || questions.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
