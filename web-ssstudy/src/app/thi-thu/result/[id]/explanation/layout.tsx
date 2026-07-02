'use client';

export default function ExplanationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-screen overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}

