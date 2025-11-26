interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
}

export function SidebarHeader({ title, subtitle }: NavigationHeaderProps) {
  return (
    <div className="nav-header">
      <h1>{title}</h1>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}
