export default function SectionWrapper({ id, children, className = '', padding = 'py-20 sm:py-24' }) {
  return (
    <section id={id} className={`${padding} ${className}`}>
      {children}
    </section>
  );
}
