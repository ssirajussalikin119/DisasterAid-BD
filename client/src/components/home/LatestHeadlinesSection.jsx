import React, { useState } from 'react';
import Container from '../common/Container';
import SectionWrapper from '../common/SectionWrapper';
import { headlines, featuredStories } from '../../data/homepage';

export default function LatestHeadlinesSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Top featured story content matching the requested UI design
  const featuredStory = {
    category: featuredStories?.[0]?.category || 'Emergency Response',
    title: 'How to help survivors of the earthquakes in Venezuela',
    excerpt: 'Two powerful earthquakes struck Venezuela, killing over 5,300 people. Learn how the IRC is scaling up its response—and how you can help survivors.',
    image: headlines?.[0]?.image || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
    cta: 'Give today',
    link: '#donate',
  };

  // Article card 1 (left)
  const articleCard = {
    category: 'Ebola',
    title: 'Ebola outbreak in DRC: What to know and how to help',
    image: featuredStories?.[3]?.image || 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80',
    cta: 'Read the article',
    link: '#article',
  };

  // Video card 2 (right)
  const videoCard = {
    category: 'Our work in action',
    title: 'Who we are',
    image: featuredStories?.[1]?.image || 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=900&q=80',
    cta: 'Watch the video',
    link: '#video',
  };

  return (
    <SectionWrapper id="latest-headlines" className="bg-[#f3f4f6]">
      <Container>
        {/* Section Header */}
        <div className="flex items-center mb-8 sm:mb-10">
          <span className="w-1.5 h-7 md:h-8 bg-[#ffc20e] mr-3.5 inline-block shrink-0" />
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            News and featured stories
          </h2>
        </div>

        {/* Top Featured Hero Layout */}
        <div className="relative mb-10 sm:mb-12 lg:mb-14 pb-4 lg:pb-8">
          {/* Main Large Image */}
          <div className="w-full lg:w-[72%] h-[300px] sm:h-[380px] lg:h-[450px] relative overflow-hidden shadow-sm">
            <img
              src={featuredStory.image}
              alt={featuredStory.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlapping Yellow Feature Box */}
          <div className="w-full lg:w-[44%] bg-[#ffc20e] p-6 sm:p-8 lg:p-10 text-slate-950 lg:absolute lg:top-10 lg:right-0 shadow-md lg:shadow-xl z-10 flex flex-col justify-between">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-900 mb-2 sm:mb-3">
                {featuredStory.category}
              </p>
              <h3 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold text-slate-950 leading-tight mb-3 sm:mb-4 font-display">
                {featuredStory.title}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-900/90 leading-relaxed mb-6 font-medium">
                {featuredStory.excerpt}
              </p>
            </div>
            <div>
              <a
                href={featuredStory.link}
                className="inline-block text-sm sm:text-base font-extrabold text-slate-950 underline underline-offset-4 hover:no-underline cursor-pointer"
              >
                {featuredStory.cta}
              </a>
            </div>
          </div>
        </div>

        {/* Two Columns Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Card 1: Article */}
          <div className="flex flex-col bg-white shadow-sm overflow-hidden group">
            <div className="relative w-full h-[240px] sm:h-[270px] overflow-hidden">
              <img
                src={articleCard.image}
                alt={articleCard.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6 sm:p-8 bg-white flex-1 flex flex-col justify-between border-t border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {articleCard.category}
                </p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-snug mb-4 font-display">
                  {articleCard.title}
                </h4>
              </div>
              <div className="mt-4">
                <a
                  href={articleCard.link}
                  className="inline-block text-sm font-extrabold text-slate-950 underline underline-offset-4 hover:no-underline cursor-pointer"
                >
                  {articleCard.cta}
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Video */}
          <div className="flex flex-col bg-white shadow-sm overflow-hidden group">
            <div
              className="relative w-full h-[240px] sm:h-[270px] overflow-hidden cursor-pointer"
              onClick={() => setIsVideoOpen(true)}
            >
              <img
                src={videoCard.image}
                alt={videoCard.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-90"
              />
              {/* Central Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 ml-1 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Overlay Watermark/Text on image bottom */}
              <div className="absolute bottom-3 left-4 text-white font-extrabold text-xl sm:text-2xl tracking-wide opacity-90 drop-shadow-md">
                Who We Are
              </div>
            </div>
            <div className="p-6 sm:p-8 bg-white flex-1 flex flex-col justify-between border-t border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {videoCard.category}
                </p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-snug mb-4 font-display">
                  {videoCard.title}
                </h4>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-block text-sm font-extrabold text-slate-950 underline underline-offset-4 hover:no-underline cursor-pointer bg-transparent border-0 p-0 text-left"
                >
                  {videoCard.cta}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Centered Link */}
        <div className="mt-12 sm:mt-16 text-center">
          <a
            href="#all-stories"
            className="inline-block text-xs font-extrabold tracking-widest text-slate-950 uppercase border-b-2 border-slate-950 pb-0.5 hover:text-amber-600 hover:border-amber-600 transition-colors"
          >
            SEE THE LATEST
          </a>
        </div>
      </Container>

      {/* Video Modal (if user clicks watch video) */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="bg-slate-950 text-white rounded-lg overflow-hidden max-w-3xl w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="font-bold text-lg">Who We Are - Response in Action</h3>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Who We Are"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}

