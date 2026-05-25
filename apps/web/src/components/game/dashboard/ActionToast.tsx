'use client';

export function ActionToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="go2-toast" role="status">
      {message}
    </div>
  );
}
