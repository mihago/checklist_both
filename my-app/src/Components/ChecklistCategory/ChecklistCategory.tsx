import { FC, PropsWithChildren, useState } from "react";
import styles from "./ChecklistCategory.module.css";

interface ChecklistCategoryProps {
  title: string; // Обязательный проп для заголовка
  containerColor: string; // Необязательный проп для цвета контейнера
  onAddItem: (name: string, hasCount: boolean) => void; // Новый проп для добавления пункта
}

const ChecklistCategory: FC<PropsWithChildren<ChecklistCategoryProps>> = ({
  title,
  containerColor,
  children,
  onAddItem,
}) => {
  const [newItemName, setNewItemName] = useState("");
  const [hasCount, setHasCount] = useState(false);
  const isDeletedCategory = title === "Удалённые";

  const handleAddItem = () => {
    onAddItem(newItemName, hasCount);
    setNewItemName("");
    setHasCount(false);
  };

  const isAddButtonDisabled = newItemName.trim().length === 0;

  return (
    <div
      className={styles.categoryWrapper}
      style={{ backgroundColor: containerColor }}
    >
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.itemsContainer}>{children}</div>
      {!isDeletedCategory&&<div className={styles.addNewItem}>
        <div className={styles.addNewItemInputs}><input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Название пункта"
        />
        <label>
          <input
            type="checkbox"
            checked={hasCount}
            onChange={() => setHasCount(!hasCount)}
          /><span>
          Количественный</span>
        </label>
        </div>
        <button
          onClick={handleAddItem}
          disabled={isAddButtonDisabled}
          style={{ backgroundColor: isAddButtonDisabled ? "#DDD" : "#4CAF50", cursor: isAddButtonDisabled ? "not-allowed" : "pointer" }}
        >
          Добавить
        </button>
      </div>}
    </div>
  );
};

export default ChecklistCategory;
