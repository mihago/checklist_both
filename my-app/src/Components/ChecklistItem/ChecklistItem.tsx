// ChecklistItem.tsx
import React, { FC, useState, useRef, useEffect } from "react";
import styles from "./ChecklistItem.module.css";
import plus from "./../../assets/plus.svg";
import minus from "./../../assets/minus.svg";
import bin from "./../../assets/delete.svg";

interface ChecklistItemProps {
  name: string;
  count?: number;
  completed: boolean;
  isDeleted: boolean;
  onNameChange: (newName: string) => void;
  onCountChange: (newCount: number | undefined) => void;
  onToggleCompleted: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

const ChecklistItem: FC<ChecklistItemProps> = ({
  name,
  count,
  completed,
  isDeleted,
  onNameChange,
  onCountChange,
  onToggleCompleted,
  onDelete,
  onRestore,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingCount, setIsEditingCount] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempCount, setTempCount] = useState(count);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const countInputRef = useRef<HTMLInputElement>(null);

  // Обработчики редактирования имени
  const handleNameEditStart = () => {
    setIsEditingName(true);
    setTempName(name);
    nameInputRef.current?.focus();
  };

  const handleNameEditEnd = () => {
    setIsEditingName(false);
    onNameChange(tempName);
  };

  // Обработчики редактирования количества
  const handleCountEditStart = () => {
    if (count !== undefined) {
      setIsEditingCount(true);
      setTempCount(count);
      countInputRef.current?.focus();
    }
  };

  const handleCountEditEnd = () => {
    setIsEditingCount(false);
    const newCount = tempCount === undefined ? undefined : tempCount;
    onCountChange(newCount);
  };

  // Обработчики ввода
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newCount = parseInt(value, 10);
    setTempCount(newCount > 0 ? newCount : undefined);
  };

  // Обработчики клавиатуры
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (isEditingName) {
        handleNameEditEnd();
      } else if (isEditingCount) {
        handleCountEditEnd();
      }
    }
  };

  // Обработчики наведения
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // useEffect для обработки клика вне инпута
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditingName && nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setIsEditingName(false);
        onNameChange(tempName);
      }
      if (isEditingCount && countInputRef.current && !countInputRef.current.contains(event.target as Node)) {
        setIsEditingCount(false);
        onCountChange(tempCount);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingName, isEditingCount, tempName, tempCount]);

  const handleIncrement = () => {
    if (count !== undefined) {
      onCountChange(count + 1);
    }
  };

  const handleDecrement = () => {
    if (count !== undefined && count > 0) {
      onCountChange(count - 1);
    }
  };

  return (
    <div
      className={`${styles.item} ${isDeleted ? styles.deleted : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={onToggleCompleted}
        className={styles.checkbox}
        disabled={isDeleted}
      />
      
      {isEditingName ? (
        <input
          type="text"
          value={tempName}
          onChange={handleNameChange}
          onBlur={handleNameEditEnd}
          onKeyDown={handleKeyDown}
          ref={nameInputRef}
          className={styles.nameInput}
        />
      ) : (
        <div className={styles.name} onClick={handleNameEditStart}>
          {name}
        </div>
      )}

      {!isDeleted && (
        <span className={styles.count}>
          {count !== undefined && (
            <>
              {isEditingCount ? (
                <input
                  type="number"
                  value={tempCount || ""}
                  onChange={handleCountChange}
                  onBlur={handleCountEditEnd}
                  onKeyDown={handleKeyDown}
                  ref={countInputRef}
                  className={styles.editInput}
                />
              ) : (
                <span onClick={handleCountEditStart}>
                  X {count}
                </span>
              )}
            </>
          )}
          {count === undefined && (
            <></> // Не отображаем ничего, если count не указано
          )}
        </span>
      )}

      {isHovered && !isDeleted && (
        <div className={styles.actions}>
          {count !== undefined && (
            <>
              <button className={styles.actionButton} onClick={handleIncrement}>
                <img src={plus} alt="+" />
              </button>
              <button className={styles.actionButton} onClick={handleDecrement}>
                <img src={minus} alt="-" />
              </button>
            </>
          )}
          <button className={styles.actionButton} onClick={onDelete}>
            <img src={bin} alt="🗑️" />
          </button>
        </div>
      )}

      {isDeleted && isHovered && (
        <button className={styles.restoreButton} onClick={onRestore}>
          Восстановить
        </button>
      )}
    </div>
  );
};

export default ChecklistItem;
