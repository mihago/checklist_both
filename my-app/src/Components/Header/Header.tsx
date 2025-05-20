import styles from "./Header.module.css";
import Button from "../Button/Button";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

interface HeaderProps {
  saveChecklist: () => void;
  token: string;
}
const Header = ({ saveChecklist, token }: HeaderProps) => {
  return (
    <header className={styles.header}>
              <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSerjFNlP8XTfvH781htmFql2vkdgzWaQai003UzZ9mAfMfJiA/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
        >
      <Button color="#FFD966" className={styles.feedbackButton}>
          Оставить фидбэк
      </Button>
              </a>
      <DropdownMenu saveChecklist={saveChecklist} token={token}></DropdownMenu>
    </header>
  );
};

export default Header;
