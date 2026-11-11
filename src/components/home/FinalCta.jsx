import { Icon } from '../Icon';
import { Reveal } from '../Reveal';
import { Link } from '../../utils/router';

export function FinalCta() {
  return (
    <section className="pb-4 pt-2">
      <div className="wrap">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-deep px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-lime/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl !text-white sm:text-5xl">Ready to find, or list, your next space?</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/75 sm:text-lg">
                Browse properties with location context, or create a listing in a few guided steps.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/properties" className="btn btn-lime btn-lg">
                  Explore Properties
                  <Icon n="arrow" size={18} />
                </Link>
                <Link to="/sell" className="btn btn-lg border-white/25 text-white hover:bg-white/10">
                  List Your Property
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
