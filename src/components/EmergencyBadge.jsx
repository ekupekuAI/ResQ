import { EMERGENCY_TYPES } from '../lib/utils';
import * as Icons from 'lucide-react';

export default function EmergencyBadge({ type, className = '' }) {
  const meta = EMERGENCY_TYPES[type] || EMERGENCY_TYPES.other;
  const Icon = Icons[meta.icon] || Icons.AlertTriangle;

  return (
    <div className={`px-2 py-1 rounded-md text-white font-bold text-xs uppercase flex items-center gap-1 ${meta.color} ${className}`}>
      <Icon size={14} strokeWidth={3} />
      {meta.label}
    </div>
  );
}
