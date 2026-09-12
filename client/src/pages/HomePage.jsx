import Navbar from '../components/layout/Navbar';
import HomeMap from '../components/map/HomeMap';
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
      <section className="px-3 pb-4 pt-2 sm:px-5 sm:pb-6 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-4">
        <div className="mx-auto max-w-7xl">
          <HomeMap />
        </div>
      </section>
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
