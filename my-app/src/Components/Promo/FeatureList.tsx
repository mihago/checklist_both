import './FeatureList.css';

const features = [
  'Учёт страны поездки, индивидуальных особенностей и погодных условий',
  'Удобное деление по секциям: документы, техника, личная гигиена, хобби и т.д.',
  'Возможность редактирования списка под себя',
  'Предоставление советов по оптимизации пространства в чемодане',
];

const FeatureList = () => (
  <ul className="feature-list">
    {features.map((text, idx) => (
      <li key={idx} className="feature-list__item">
        <span className="feature-list__icon" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#90FD06" />
            <path
              d="M17 8L10 15L7 12"
              stroke="#292D32"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="feature-list__text">{text}</span>
      </li>
    ))}
  </ul>
);

export default FeatureList;
