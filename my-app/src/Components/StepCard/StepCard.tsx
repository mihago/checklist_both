import React from 'react';
import './StepCard.css';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <div className="step-card">
      <div className="step-card__number">{number}</div>
      <div className="step-card__content">
        <div className="step-card__title">{title}</div>
        <div className="step-card__description">{description}</div>
      </div>
    </div>
  );
};

export default StepCard;
