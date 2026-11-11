import React from 'react';

export class Boundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = { e: null };
  }
  static getDerivedStateFromError(e) {
    return { e };
  }
  componentDidCatch(e) {
    console.error(e);
  }
  render() {
    if (!this.state.e) return this.props.children;
    return (
      <div className="mx-auto max-w-xl px-5 py-28 text-center">
        <h1 className="text-3xl">Something went wrong</h1>
        <p className="mt-3 text-muted">{String(this.state.e && this.state.e.message)}</p>
        <a
          className="btn btn-primary mt-6"
          href="/"
          onClick={() => setTimeout(() => window.location.reload(), 50)}
        >
          Reload
        </a>
      </div>
    );
  }
}
