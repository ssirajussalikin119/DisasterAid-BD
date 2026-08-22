import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import SectionWrapper from '../common/SectionWrapper';
import StatCard from '../ui/StatCard';
import { whoWeAreStats } from '../../data/homepage';

export default function WhoWeAreSection() {
  return (
    <SectionWrapper id="who-we-are" className="bg-[#f8fafc]">
      <Container>
        <SectionTitle
          eyebrow="Who We Are"
          title="A humanitarian response platform designed for verified action."
          description="DisasterAid BD helps citizens, volunteers, organizations, and administrators coordinate response work in a secure and accountable environment."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {whoWeAreStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
