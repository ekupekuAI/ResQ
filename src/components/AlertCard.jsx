import EmergencyBadge from './EmergencyBadge';
import { formatDistanceToNow } from 'date-fns'; // need to install this or write custom
import { useAuth } from '../context/AuthContext';
import { Users, CheckCircle } from 'lucide-react';

export default function AlertCard({ alert, onHelp, onResolve }) {
  const { user } = useAuth();
  const isCreator = user?.id === alert.sent_by;
  const isAdmin = user?.role === 'admin';
  const isResolved = alert.status === 'resolved';

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-4 transition-all duration-300
      ${isResolved ? 'opacity-70 bg-gray-50 dark:bg-gray-800/50' : 'glass-card shadow-lg ring-1 ring-black/5 dark:ring-white/10'}
    `}>
      {/* Decorative pulse border for active alerts */}
      {!isResolved && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 pointer-events-none" />
      )}
      
      <div className="relative">
        <div className="flex justify-between items-start mb-3">
          <EmergencyBadge type={alert.type} />
          
          <div className="text-right">
            <span className="block font-bold text-lg dark:text-white">Flat {alert.flat}</span>
            <span className="text-xs text-muted-foreground">
              {/* Fallback to simple date parsing if date-fns not installed yet */}
              {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </div>

        <p className="text-foreground text-sm font-medium mb-4 leading-relaxed">
          {alert.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Users size={16} className={alert.help_count > 0 ? "text-primary" : ""} />
            {alert.help_count || 0} helping
          </div>

          <div className="flex gap-2">
            {!isResolved && !isCreator && user?.role !== 'guard' && (
              <button 
                onClick={() => onHelp(alert.id)}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all"
              >
                I'm Coming
              </button>
            )}

            {!isResolved && (isCreator || isAdmin) && (
              <button 
                onClick={() => onResolve(alert.id)}
                className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
              >
                <CheckCircle size={14} /> Resolve
              </button>
            )}

            {isResolved && (
              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle size={14} /> Resolved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
