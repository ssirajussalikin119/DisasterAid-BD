import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import WhoWeAreSection from '../components/home/WhoWeAreSection';
import OurImpactSection from '../components/home/OurImpactSection';
import LatestHeadlinesSection from '../components/home/LatestHeadlinesSection';
import GetInvolvedSection from '../components/home/GetInvolvedSection';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-white text-ink">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <WhoWeAreSection />
      <OurImpactSection />
      <LatestHeadlinesSection />
      <GetInvolvedSection />
      <Footer />
    </div>
  );
}
