import ChecklistItem from "./../ChecklistItem/ChecklistItem";
import ChecklistCategory from "./../ChecklistCategory/ChecklistCategory";
import styles from "./Checklist.module.css";

interface ChecklistItemState {
  id: number;
  name: string;
  count?: number;
  completed: boolean;
  isDeleted: boolean;
  prevCategory?: string;
}

interface ChecklistProps {
  items: { [category: string]: ChecklistItemState[] };
  loading: boolean;
  error: string | null;
  onNameChange: (category: string, id: number, newName: string) => void;
  onCountChange: (category: string, id: number, newCount: number | undefined) => void;
  onDelete: (category: string, id: number) => void;
  onRestore: (id: number) => void;
  onToggleCompleted: (category: string, id: number) => void;
  onAddItem: (category: string, name: string, hasCount: boolean) => void;
}

const CategoryColors = [
  "rgba(184,253,97,0.05)",
  "rgba(253,184,97,0.05)",
  "rgba(97,184,253,0.05)",
  "rgba(253,97,184,0.05)",
  "rgba(97,253,184,0.05)",
  "rgba(184,97,253,0.05)"
];

const Checklist = ({
  items,
  loading,
  error,
  onNameChange,
  onCountChange,
  onDelete,
  onRestore,
  onToggleCompleted,
  onAddItem
}: ChecklistProps) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.checklist}>
      {Object.keys(items)
        .filter(category => category !== "Удалённые")
        .map((category, index) => (
          <ChecklistCategory
            key={category}
            title={category}
            containerColor={CategoryColors[index % 6]}
            onAddItem={(name, hasCount) => onAddItem(category, name, hasCount)}
          >
            {items[category].map(item => (
              <ChecklistItem
                key={item.id}
                name={item.name}
                count={item.count}
                completed={item.completed}
                isDeleted={item.isDeleted}
                onNameChange={(newName) => onNameChange(category, item.id, newName)}
                onCountChange={(newCount) => onCountChange(category, item.id, newCount)}
                onToggleCompleted={() => onToggleCompleted(category, item.id)}
                onDelete={() => onDelete(category, item.id)}
                onRestore={() => null}
              />
            ))}
          </ChecklistCategory>
        ))}

      <ChecklistCategory
        title="Удалённые"
        containerColor="#ccc"
        onAddItem={() => null}
      >
        {items["Удалённые"]?.map(item => (
          <ChecklistItem
            key={item.id}
            name={item.name}
            count={item.count}
            completed={item.completed}
            isDeleted={item.isDeleted}
            onNameChange={() => null}
            onCountChange={() => null}
            onToggleCompleted={() => null}
            onDelete={() => null}
            onRestore={() => onRestore(item.id)}
          />
        ))}
      </ChecklistCategory>
    </div>
  );
};

export default Checklist;
