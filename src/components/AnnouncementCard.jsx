import { formatDistanceToNow } from 'date-fns';
import { Info } from 'lucide-react';

export default function AnnouncementCard({ announcement }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 shadow-sm mb-4">
      <div className="flex items-start gap-3">
        <div className="bg-blue-500 rounded-full p-2 mt-1 shrink-0">
          <Info className="text-white w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1 block">
            Society Notice
          </span>
          <p className="text-foreground text-sm font-medium leading-relaxed mb-2">
            {announcement.message}
          </p>
          <span className="text-xs text-blue-500/80 dark:text-blue-400/60 font-medium">
            {announcement.created_at ? formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true }) : 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
}
