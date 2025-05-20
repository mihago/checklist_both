import Button from "../Button/Button.tsx";
import FeatureList from "./FeatureList.tsx";
import Heading from "./Heading.tsx";
import StepList from "./StepList.tsx";
import styles from "./Promo.module.css";
import ReactGA from "react-ga4";
import { useEffect } from "react";

export default function Promo() {
  const PromoButton = () => (
    <Button color="#B8FD61" className={styles.promoButton}>
      <a href="https://ypqrtzj-app.apms.io/checklist/">Получить чеклист</a>
    </Button>
  );
  useEffect(() => {
    ReactGA.initialize("G-55V95JTGT3");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);
  return (
    <div className={styles.page}>
      <Heading>Чек-лист - помощник по сбору вещей на мобильность</Heading>
      <p className={styles.description}>
        Поможем составить список вещей для твоей поездки
      </p>
      <PromoButton></PromoButton>
      <section className={styles.section}>
        <Heading>Как это происходит?</Heading>
        <StepList></StepList>
      </section>
      <section className={styles.section}>
        <Heading>В чём преимущества нашего чеклиста?</Heading>
        <FeatureList />
      </section>
      <PromoButton></PromoButton>
    </div>
  );
}
