import Container from '../common/Container';
import SectionTitle from '../common/SectionTitle';
import SectionWrapper from '../common/SectionWrapper';
import FeatureCard from '../ui/FeatureCard';
import Badge from '../ui/Badge';
import { featuredStories } from '../../data/homepage';

export default function NewsFeaturedStoriesSection() {
  const [featured, ...supporting] = featuredStories;

  return (
    <SectionWrapper id="news-featured-stories" className="bg-white">
      <Container>
        <SectionTitle
          eyebrow="News & Featured Stories"
          title="Stories that highlight response, preparedness, and community support."
          description="A larger editorial card anchors the section while smaller companion stories sit below for a balanced, magazine-like layout."
        />
        <div className="mt-14 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <img src={featured.image} alt={featured.title} className="h-[360px] w-full object-cover sm:h-[460px] xl:h-[520px]" />
            <div className="absolute right-6 top-6 max-w-lg rounded-[1.75rem] bg-amber-300 p-6 text-ink shadow-[0_18px_40px_rgba(251,191,36,0.28)] sm:right-10 sm:top-10 sm:p-8">
              <Badge className="border-amber-200 bg-amber-100 text-amber-900">{featured.category}</Badge>
              <h3 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">{featured.title}</h3>
              <p className="mt-4 max-w-md text-base leading-7 text-ink/80">{featured.excerpt}</p>
              <button type="button" className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm">
                Give today
              </button>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            {supporting.map((story) => (
              <FeatureCard key={story.title} {...story} />
            ))}
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
