export interface DashboardContentProps {
  children: React.ReactNode;
}

export default function DashboardContent({ children }: DashboardContentProps) {
  return (
    <div className="w-full first:w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {children}
    </div>
  );
}
