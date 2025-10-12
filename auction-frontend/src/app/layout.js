import './globals.css';

export const metadata = {
  title: 'Online Auction System',
  description: 'Bid and win amazing items at our online auction platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background-secondary">
        {children}
      </body>
    </html>
  );
}
