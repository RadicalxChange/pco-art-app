"use client";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function GeneralLayout({ children }: any) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
