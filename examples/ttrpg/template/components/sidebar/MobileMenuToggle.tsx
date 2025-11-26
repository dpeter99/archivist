'use client'

import { FoldIcon } from '../../icons/FoldIcon';

interface MobileMenuToggleProps {
  action: 'open' | 'close';
}

export function MobileMenuToggle({ action }: MobileMenuToggleProps) {
  const handleClick = () => {
    const leftPage = document.getElementById('leftPage');
    if (!leftPage) return;

    if (action === 'open') {
      leftPage.classList.add('show');
    } else {
      leftPage.classList.remove('show');
    }
  };

  return (
    <button className="mobile-menu-toggle" onClick={handleClick}>
      <FoldIcon />
    </button>
  );
}
