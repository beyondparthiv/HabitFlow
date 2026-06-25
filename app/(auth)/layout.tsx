export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <span className="text-2xl">🌱</span>
        <span className="text-lg font-semibold tracking-tight">HabitFlow</span>
      </div>
      {children}
    </main>
  );
}
