import "./globals.css";
import AppChrome from "./components/AppChrome";

export const metadata = {
  title: {
    default: "CardXpert Pro",
    template: "%s | CardXpert Pro",
  },
  description: "General AI chat with on-demand credit-card expertise",
  icons: {
    icon: "/cardxpert-tab.svg",
    shortcut: "/cardxpert-tab.svg",
    apple: "/cardxpert-tab.svg",
  },
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
