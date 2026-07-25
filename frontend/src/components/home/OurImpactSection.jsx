import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import SectionWrapper from '../common/SectionWrapper';
import ImpactCard from '../ui/ImpactCard';
import { impactItems } from '../../data/homepage';

export default function OurImpactSection() {
  return (
    <SectionWrapper id="our-impact" className="bg-white">
      <Container>
        <SectionTitle
          eyebrow="Our Impact"
          title="Measured progress that reflects real support on the ground."
          description="The platform tracks the response pipeline from verification to relief distribution so each effort stays visible and accountable."
        />
        <div className="mt-14">
          <ImpactCard
            title="DisasterAid BD impact overview"
            description="Our operational model centers on verified reporting, volunteer coordination, emergency responses, and relief delivery across Bangladesh."
            items={impactItems}
          />
        </div>
      </Container>
    </SectionWrapper>
  );
}
