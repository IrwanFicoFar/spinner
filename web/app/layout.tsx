import type { Metadata } from "next";
import "./globals.css";
import "./public.css";
import "./bulk.css";

export const metadata: Metadata = {
  title: "Spinora — Lucky Draw Platform",
  description: "Panggung undian hadiah yang cerah, meriah, dan tersinkron.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id"><body>{children}</body></html>;
}
