import React from 'react';
import clsx from 'clsx';

interface Step {
  id: string;
  label: string;
  completed?: boolean;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm',
                  index < currentStep
                    ? 'bg-green-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center max-w-[60px]">
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-1 mx-2 mt-5',
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
};
