import React from "react";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 9 }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className={styles.progressBar}>
      {/* Mobile view: numbers */}
      <div className={styles.progressMobile}>
        {currentStep}/{totalSteps}
      </div>

      {/* Desktop view: dots */}
      <div className={styles.progressDesktop}>
        {steps.map((step) => (
          <div
            key={step}
            className={`${styles.dot} ${
              step === currentStep
                ? styles.active
                : step < currentStep
                ? styles.completed
                : styles.inactive
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
