import { FC} from "react";
import styles from "./Header.module.css";
import Button from "../Button/Button";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

  
  const Header: FC = () => {
    
    return <header className={styles.header}>
       <Button color="#FFD966">Заполнить анкету заново</Button>
       <DropdownMenu></DropdownMenu>
    </header>
  };
  
export default Header;