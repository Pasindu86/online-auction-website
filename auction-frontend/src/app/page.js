import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Welcome to Online Auction System
        </h1>
        <p className="text-text-secondary mb-8">
          Your premier destination for online auctions
        </p>
        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-accent-main text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-background-primary text-text-primary border border-border-medium rounded-lg hover:bg-secondary-main transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
