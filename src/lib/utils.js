import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const EMERGENCY_TYPES = {
  fire: { color: 'bg-emergency-fire', label: 'FIRE', icon: 'Flame' },
  medical: { color: 'bg-emergency-medical', label: 'MEDICAL', icon: 'Stethoscope' },
  gas: { color: 'bg-emergency-gas', label: 'GAS LEAK', icon: 'CloudFog' },
  theft: { color: 'bg-emergency-theft', label: 'THEFT', icon: 'ShieldAlert' },
  flood: { color: 'bg-emergency-flood', label: 'FLOOD', icon: 'Waves' },
  other: { color: 'bg-emergency-other', label: 'OTHER', icon: 'AlertTriangle' },
};
