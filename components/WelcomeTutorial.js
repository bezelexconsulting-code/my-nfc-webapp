"use client";
import { useState, useEffect } from "react";

export default function WelcomeTutorial({ onComplete, tagCount }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show tutorial if user has no tags (first time user)
    if (tagCount === 0) {
      setIsVisible(true);
    }
  }, [tagCount]);

  const steps = [
    {
      title: "Welcome to NFC Tag Manager!",
      content: "Let's get you started. This quick tutorial will show you how to create and manage your NFC tags.",
      position: "center",
    },
    {
      title: "Create Your First Tag",
      content: "Tags are created by admins. Once you have a tag, you can customize its information like name, phone numbers, address, and more.",
      position: "top",
    },
    {
      title: "Customize Your Tag",
      content: "Fill in the tag details: name, phone numbers, address (optional), website URL, and instructions. All fields are editable.",
      position: "center",
    },
    {
      title: "Add an Image (Optional)",
      content: "You can upload an image for your tag. This will be displayed on the public tag page when someone scans your NFC tag.",
      position: "center",
    },
    {
      title: "View Your Public Page",
      content: "Click 'View Public Page' to see what others will see when they scan your NFC tag. This page is automatically generated.",
      position: "bottom",
    },
    {
      title: "Manage Multiple Tags",
      content: "You can have multiple tags in your account. Use search and filters to find specific tags, and bulk operations to manage them efficiently.",
      position: "center",
    },
  ];

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={() => {
            setIsVisible(false);
            onComplete?.();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStepData.title}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {currentStepData.content}
        </p>

        <div className="flex justify-between gap-4">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
            >
              Previous
            </button>
          )}
          <div className="flex-1" />
          {isLastStep ? (
            <button
              onClick={() => {
                setIsVisible(false);
                localStorage.setItem('tutorialCompleted', 'true');
                onComplete?.();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Get Started!
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
