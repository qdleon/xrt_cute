import React, { useState } from 'react';
import { Member } from '../../types/project';

interface MemberAvatarProps {
  member?: Member;
  size?: number;
  className?: string;
  showName?: boolean;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  member,
  size = 20,
  className = '',
  showName = false,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!member) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 text-[10px] shrink-0 ${className}`}
        title="未指派"
      >
        ?
      </div>
    );
  }

  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950/70 border border-slate-200/60 dark:border-slate-750 flex items-center justify-center shrink-0"
        title={`${member.name} (${member.role})`}
      >
        {!imageError && member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            style={{ fontSize: Math.max(9, Math.floor(size * 0.42)) }}
            className="font-medium text-indigo-700 dark:text-indigo-300 select-none"
          >
            {initials}
          </span>
        )}
      </div>
      {showName && (
        <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
          {member.name}
        </span>
      )}
    </div>
  );
};
