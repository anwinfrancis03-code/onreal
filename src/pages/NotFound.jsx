import { Link } from '../utils/router';

export function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-brand-50 text-3xl font-extrabold text-brand-text">
        404
      </div>
      <h1 className="text-4xl">This plot is empty</h1>
      <p className="mx-auto mb-8 mt-3 max-w-md text-lg text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary btn-lg">
          Back to home
        </Link>
        <Link to="/properties" className="btn btn-outline btn-lg">
          Browse properties
        </Link>
      </div>
    </div>
  );
}
