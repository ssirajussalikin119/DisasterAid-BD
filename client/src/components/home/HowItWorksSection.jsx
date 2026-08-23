import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import SectionWrapper from '../common/SectionWrapper';
import StepCard from '../ui/StepCard';
import { steps } from '../../data/homepage';

export default function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="bg-white">
      <Container>
        <SectionTitle
          align="center"
          eyebrow="How It Works"
          title="From report to relief, every response is verified and coordinated."
          description="A simple four-step pipeline keeps emergency reporting, verification, volunteer assignment, and relief delivery organized."
        />
        <div className="relative mt-16">
          <div className="absolute left-0 top-10 hidden h-px w-full border-t border-dashed border-sky-200 lg:block" />
          <div className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {steps.map((step) => (
              <StepCard key={step.title} {...step} />
            ))}
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
