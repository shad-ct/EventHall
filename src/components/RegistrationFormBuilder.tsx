import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface FormQuestion {
  id?: string;
  questionCategory: string;
  questionKey: string;
  questionText: string;
  questionType: 'text' | 'email' | 'dropdown' | 'textarea' | 'url' | 'yes/no' | 'multi-select';
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
  isCustom: boolean;
}

interface PresetQuestion {
  key: string;
  text: string;
  type: 'text' | 'email' | 'dropdown' | 'textarea' | 'url' | 'yes/no' | 'multi-select';
  options?: string[];
}

interface RegistrationFormBuilderProps {
  questions: FormQuestion[];
  onQuestionsChange: (questions: FormQuestion[]) => void;
}

const PRESET_QUESTION_CATEGORIES: Record<string, PresetQuestion[]> = {
  'Basic Participant Information': [
    { key: 'fullName', text: 'What is your full name?', type: 'text' },
    { key: 'email', text: 'What is your email address?', type: 'email' },
    { key: 'phone', text: 'What is your phone number?', type: 'text' },
    { key: 'institution', text: 'Which institution/college are you from?', type: 'text' },
    { key: 'department', text: 'What is your department/field of study?', type: 'text' },
    { key: 'yearSemester', text: 'What is your current year/semester?', type: 'dropdown', options: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters', 'Other'] },
    { key: 'role', text: 'What is your role?', type: 'dropdown', options: ['Student', 'Research Scholar', 'Faculty', 'Professional'] },
    { key: 'gender', text: 'What is your gender?', type: 'dropdown', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    { key: 'district', text: 'What is your district/city?', type: 'text' },
  ],
  'Experience & Skill-Level Questions': [
    { key: 'proficiency', text: 'What is your proficiency level?', type: 'dropdown', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'experience', text: 'Do you have prior experience in this domain?', type: 'textarea' },
    { key: 'github', text: 'Share your GitHub profile link', type: 'url' },
    { key: 'linkedin', text: 'Share your LinkedIn profile link', type: 'url' },
    { key: 'programming', text: 'What programming languages/technologies do you know?', type: 'multi-select' },
    { key: 'previousEvents', text: 'Have you participated in similar events before?', type: 'yes/no' },
  ],
  'Event Logistics & Requirements': [
    { key: 'accommodation', text: 'Do you require accommodation?', type: 'yes/no' },
    { key: 'foodPreference', text: 'What is your food preference?', type: 'dropdown', options: ['Veg', 'Non-Veg', 'Vegan'] },
    { key: 'transportation', text: 'Do you need transportation?', type: 'yes/no' },
    { key: 'certificate', text: 'Do you require a participation certificate?', type: 'yes/no' },
    { key: 'materials', text: 'Do you need printed materials/handouts?', type: 'yes/no' },
  ],
  'Workshop / Hands-On Event Questions': [
    { key: 'laptop', text: 'Will you bring a laptop?', type: 'yes/no' },
    { key: 'software', text: 'Do you have the required software installed?', type: 'yes/no' },
    { key: 'os', text: 'What is your operating system?', type: 'dropdown', options: ['Windows', 'macOS', 'Linux'] },
    { key: 'toolExperience', text: 'Do you have prior experience with this tool/technology?', type: 'yes/no' },
  ],
};

export const RegistrationFormBuilder: React.FC<RegistrationFormBuilderProps> = ({
  questions,
  onQuestionsChange,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const addQuestion = (category: string, preset: any) => {
    const newQuestion: FormQuestion = {
      id: `${Date.now()}-${Math.random()}`,
      questionCategory: category,
      questionKey: preset.key,
      questionText: preset.text,
      questionType: preset.type,
      options: preset.options,
      isRequired: false,
      displayOrder: questions.length,
      isCustom: false,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const removeQuestion = (id: string | undefined) => {
    onQuestionsChange(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string | undefined, updates: Partial<FormQuestion>) => {
    onQuestionsChange(
      questions.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const addCustomQuestion = () => {
    const newQuestion: FormQuestion = {
      id: `${Date.now()}-${Math.random()}`,
      questionCategory: 'Custom Questions',
      questionKey: `custom_${Date.now()}`,
      questionText: '',
      questionType: 'text',
      options: undefined,
      isRequired: false,
      displayOrder: questions.length,
      isCustom: true,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const isQuestionAdded = (category: string, key: string) => {
    return questions.some(q => q.questionCategory === category && q.questionKey === key);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Registration Form Questions</h4>
        <p className="text-sm text-gray-600 mb-4">
          Select questions from below or add custom questions to include in your registration form.
        </p>
      </div>

      {/* Preset Question Categories */}
      {Object.entries(PRESET_QUESTION_CATEGORIES).map(([category, presets]) => (
        <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() =>
              setExpandedCategory(expandedCategory === category ? null : category)
            }
            className="w-full p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left"
          >
            <span className="font-medium text-gray-900">{category}</span>
            <span className="text-sm text-gray-500">
              {questions.filter(q => q.questionCategory === category).length > 0 
                ? `${questions.filter(q => q.questionCategory === category).length}/${presets.length}`
                : ''}
            </span>
          </button>

          {expandedCategory === category && (
            <div className="p-4 space-y-3 border-t border-gray-200">
              {presets.map((preset) => {
                const isAdded = isQuestionAdded(category, preset.key);
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => !isAdded && addQuestion(category, preset)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      isAdded
                        ? 'border-green-300 bg-green-50 text-gray-500 cursor-default'
                        : 'border-gray-300 bg-white hover:bg-blue-50 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{preset.text}</span>
                      {isAdded ? (
                        <span className="text-xs font-semibold text-green-700">✓ Added</span>
                      ) : (
                        <Plus className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    {preset.options && (
                      <div className="text-xs text-gray-500 mt-1">
                        Options: {preset.options.join(', ')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Custom Questions Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">Custom Questions</h4>
          <button
            type="button"
            onClick={addCustomQuestion}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>

        <div className="space-y-3">
          {questions
            .filter(q => q.isCustom)
            .map((question) => (
              <div key={question.id} className="border border-gray-300 rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-start">
                  <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(question.id, { questionText: e.target.value })
                    }
                    placeholder="Enter your question"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Type
                    </label>
                    <select
                      value={question.questionType}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          questionType: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="textarea">Text Area</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="url">URL</option>
                      <option value="yes/no">Yes/No</option>
                      <option value="multi-select">Multi-Select</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(e) =>
                        updateQuestion(question.id, { isRequired: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Required</span>
                  </label>
                </div>

                {(question.questionType === 'dropdown' || question.questionType === 'multi-select') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(question.options || []).join(', ')}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          options: e.target.value.split(',').map(o => o.trim()),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Selected Questions Summary */}
      {questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Total Questions Selected: {questions.length}
          </h4>
          <div className="space-y-1">
            {Object.entries(PRESET_QUESTION_CATEGORIES).map(([category]) => {
              const count = questions.filter(q => q.questionCategory === category).length;
              return count > 0 ? (
                <p key={category} className="text-sm text-blue-800">
                  {category}: {count}
                </p>
              ) : null;
            })}
            {questions.filter(q => q.isCustom).length > 0 && (
              <p className="text-sm text-blue-800">
                Custom Questions: {questions.filter(q => q.isCustom).length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
