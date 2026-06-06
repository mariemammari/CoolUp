import { Droplets, TreePine, Snowflake } from 'lucide-react';
import type { SpotCategory } from '../data/spots';

interface CategoryIconProps {
  category: SpotCategory;
  className?: string;
}

export default function CategoryIcon({ category, className = "w-4 h-4" }: CategoryIconProps) {
  switch (category) {
    case 'fontaine':
      return <Droplets className={className} />;
    case 'parc':
      return <TreePine className={className} />;
    case 'climatise':
      return <Snowflake className={className} />;
    default:
      return null;
  }
}
