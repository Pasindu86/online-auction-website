import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export const metadata = {
  title: 'Main - Online Auction System',
  description: 'Auction management and bidding platform',
};
