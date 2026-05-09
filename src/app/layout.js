import "./globals.css";

export const metadata = {
  title: "Smart Local Business Intelligence",
  description: "Sales, inventory, and AI insights for small businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
