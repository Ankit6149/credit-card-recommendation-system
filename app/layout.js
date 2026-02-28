import "./globals.css";
import AppChrome from "./components/AppChrome";

export const metadata = {
  title: "CardXpert",
  description: "Credit card recomender AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="transition-all">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
