// app/layout.tsx (or your RootLayout.tsx file)
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        Make the body a flex container that centers its child horizontally.
        min-h-screen ensures it takes at least the full viewport height.
        bg-gray-100 (optional) provides a background color around your centered page content.
      */}
      <body className="flex justify-center min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  );
}