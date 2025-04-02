
import styles from "./Header.module.css";
import Button from "../Button/Button";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

interface HeaderProps{
  saveChecklist:() => void,
  token:string,
}
  const Header = ({saveChecklist,token}:HeaderProps) => {
    
    return <header className={styles.header}>
       <Button color="#FFD966">Заполнить анкету заново</Button>
       <DropdownMenu saveChecklist = {saveChecklist} token={token}></DropdownMenu>
    </header>
  };
  
export default Header;