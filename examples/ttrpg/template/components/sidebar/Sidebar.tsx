import { SidebarHeader } from './SidebarHeader';
import { NavigationTree } from './NavigationTree';
import { MobileMenuToggle } from './MobileMenuToggle';

interface NavigationProps {
  currentPath: string;
  siteTitle: string;
  siteSubtitle?: string;
}

export function Sidebar({ currentPath, siteTitle, siteSubtitle }: NavigationProps) {
  return (
    <nav className="left-page" id="leftPage">
      <div className="left-page__content">
        <SidebarHeader title={siteTitle} subtitle={siteSubtitle} />
        <NavigationTree currentPath={currentPath} />
      </div>
      <MobileMenuToggle action="close" />
    </nav>
  );
}
