'use client';

interface StatusMessageProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function StatusMessage({ message, type }: StatusMessageProps) {
  return (
    <div className={`status ${type}`}>
      {message}
    </div>
  );
}
