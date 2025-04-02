
import styles from "./Header.module.css";
import Button from "../Button/Button";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

interface HeaderProps{
  saveChecklist:() => void
}
  const Header = ({saveChecklist}:HeaderProps) => {
    
    return <header className={styles.header}>
       <Button color="#FFD966">Заполнить анкету заново</Button>
       <DropdownMenu saveChecklist = {saveChecklist}></DropdownMenu>
    </header>
  };
  
export default Header;