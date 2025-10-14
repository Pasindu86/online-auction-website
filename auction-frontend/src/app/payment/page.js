'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '../../components/ui/Button';

export const metadata = {
  title: 'Payment - Online Auction System',
  description: 'Complete your auction payment',
};

export default function PaymentPlaceholderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get('auctionId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-md rounded-2xl p-10 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Coming Soon</h1>
        <p className="text-gray-600">
          Thanks for winning the auction{auctionId ? ` #${auctionId}` : ''}! We&apos;re preparing the
          payment experience. Once it&apos;s ready, you&apos;ll be able to securely complete your purchase here.
        </p>
        <p className="text-sm text-gray-500">Keep an eye on your email for updates about this order.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-center">
          <Button onClick={() => router.back()} variant="ghost" className="w-full sm:w-auto">
            Go Back
          </Button>
          <Link href="/main/auctions" className="w-full sm:w-auto">
            <Button className="w-full">Browse More Auctions</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
