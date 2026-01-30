"use client";
import { useState, useEffect } from "react";

export default function PasswordStrengthMeter({ password }) {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback([]);
      return;
    }

    const checks = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      checks.push("At least 8 characters");
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      checks.push("One uppercase letter");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      checks.push("One lowercase letter");
    }

    // Number check
    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      checks.push("One number");
    }

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      checks.push("One special character");
    }

    setStrength(score);
    setFeedback(checks);
  }, [password]);

  const getStrengthLabel = () => {
    if (strength === 0) return { text: "", color: "gray" };
    if (strength <= 2) return { text: "Weak", color: "red" };
    if (strength <= 4) return { text: "Medium", color: "yellow" };
    if (strength <= 5) return { text: "Strong", color: "green" };
    return { text: "Very Strong", color: "green" };
  };

  const getStrengthColor = () => {
    const { color } = getStrengthLabel();
    if (color === "red") return "bg-red-500";
    if (color === "yellow") return "bg-yellow-500";
    if (color === "green") return "bg-green-500";
    return "bg-gray-300";
  };

  const getBarWidth = () => {
    if (strength === 0) return "0%";
    return `${(strength / 6) * 100}%`;
  };

  if (!password) return null;

  const { text: labelText } = getStrengthLabel();

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: getBarWidth() }}
          />
        </div>
        {labelText && (
          <span
            className={`text-xs font-medium ${
              getStrengthLabel().color === "red"
                ? "text-red-600"
                : getStrengthLabel().color === "yellow"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {labelText}
          </span>
        )}
      </div>
      {feedback.length > 0 && (
        <div className="text-xs text-gray-600 mt-1">
          <p className="mb-1">Password should include:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {feedback.map((item, index) => (
              <li key={index} className="text-gray-500">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
