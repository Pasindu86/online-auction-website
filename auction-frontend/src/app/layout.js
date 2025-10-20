import './globals.css';

export const metadata = {
  title: 'Online Auction System',
  description: 'Bid and win amazing items at our online auction platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
