import { Hero } from '../components/home/HeroSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { InsightShowcase } from '../components/home/InsightShowcase';
import { MarketPreview } from '../components/home/MarketPreview';
import { HowItWorks } from '../components/home/HowItWorks';
import { Benefits } from '../components/home/Benefits';
import { FinalCta } from '../components/home/FinalCta';
import { PropertyCard } from '../components/PropertyCard';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { SectionHead } from '../components/ui';
import { Link } from '../utils/router';
import { useApp } from '../context/AppContext';

export function Home() {
  const A = useApp();
  const featured = A.listings.filter((l) => l.status === 'Active').slice(0, 6);
  return (
    <>
      <Hero />
      <CategoryGrid />
      <section className="pb-16 sm:pb-20">
        <div className="wrap">
          <Reveal>
            <SectionHead
              eyebrow="Featured properties"
              title="Latest listings on ONREAL"
              sub="Owner-listed land and commercial spaces. Seeded listings are clearly marked as samples."
              action={
                <Link to="/properties" className="btn btn-outline">
                  View all properties
                  <Icon n="arrow" size={16} />
                </Link>
              }
            />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <PropertyCard key={p.id} p={p} i={i} />
            ))}
          </div>
        </div>
      </section>
      <InsightShowcase />
      <MarketPreview />
      <HowItWorks />
      <Benefits />
      <FinalCta />
    </>
  );
}
