import { Folder, Home, Settings } from 'lucide-react';
import { Breadcrumbs } from '@apx-ui/ds';

export default function WithIcons() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '#home', icon: <Home aria-hidden="true" /> },
        { label: 'Projects', href: '#projects', icon: <Folder aria-hidden="true" /> },
        { label: 'Settings', icon: <Settings aria-hidden="true" /> },
      ]}
    />
  );
}