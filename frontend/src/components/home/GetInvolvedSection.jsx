import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import SectionWrapper from '../common/SectionWrapper';
import FeatureCard from '../ui/FeatureCard';
import { involvedCards } from '../../data/homepage';

export default function GetInvolvedSection() {
  return (
    <SectionWrapper id="get-involved" className="bg-[#f8fafc]">
      <Container>
        <SectionTitle
          eyebrow="Get Involved"
          title="Three ways to support DisasterAid BD."
          description="Volunteer, request relief, or partner as an NGO using the same clean response language from the screenshots."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {involvedCards.map((card) => (
            <div key={card.title} className="relative">
              <FeatureCard category={card.title} title={card.title} excerpt={card.description} image={card.image} linkLabel="Learn more" showBadge={false} />
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
