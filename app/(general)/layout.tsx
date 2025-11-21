"use client";

export default function GeneralLayout({ children }: any) {
  return (
    <div className="flex flex-col">
      {/* <Header /> */}
      <main className="min-h-screen">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
