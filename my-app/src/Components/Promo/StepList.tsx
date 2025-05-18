
import StepCard from '../StepCard/StepCard';

const steps = [
  {
    number: 1,
    title: 'Расскажи о себе и о своей поездке',
    description: 'Дата, время поездки, страна, особенности образа жизни.',
  },
  {
    number: 2,
    title: 'Получи персонализированный чек-лист',
    description:
      'На основе ответов специальный алгоритм составит список вещей, адаптированный под твои запросы.',
  },
  {
    number: 3,
    title: 'Отредактируй его под себя',
    description:
      'Если ты захочешь изменить список вещей в чек-листе, то сможешь это сделать прямо на сайте. Также готовый чек-лист можно будет отправить на другое устройство или скачать в pdf.',
  },
  {
    number: 4,
    title: 'Собери вещи по чек-листу',
    description:
      'Сможешь отмечать галочками пункты, чтобы точно ничего не забыть.',
  },
];

export default function StepList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {steps.map((step) => (
        <StepCard
          key={step.number}
          number={step.number}
          title={step.title}
          description={step.description}
        />
      ))}
    </div>
  );
}
