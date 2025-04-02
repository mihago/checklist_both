import { ButtonHTMLAttributes, FC} from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    children: React.ReactNode;
    color?:string// Тип для children
  }
  
  const Button: FC<ButtonProps> = ({ children,color,...rest }) => {
    return <button style={{backgroundColor:color}} {...rest} className={styles.button+" "+rest.className} >{children}</button>;
  };
  
export default Button;