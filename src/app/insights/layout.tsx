import "@/components/insights/insights.css";

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.cdnfonts.com/css/glacial-indifference"
      />
      <div className="insights-page min-h-screen">{children}</div>
    </>
  );
}
