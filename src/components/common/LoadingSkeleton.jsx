// src/components/common/LoadingSkeleton.jsx
export function TournamentCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-ea-border animate-pulse"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 skeleton rounded-xl" />
        <div className="flex-1">
          <div className="h-4 skeleton rounded w-2/3 mb-2" />
          <div className="h-3 skeleton rounded w-1/3" />
        </div>
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0,1,2].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
      </div>
      <div className="h-1.5 skeleton rounded-full mb-4" />
      <div className="h-10 skeleton rounded-xl" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 border border-ea-border animate-pulse"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)' }}>
      <div className="h-4 skeleton rounded w-1/2 mb-3" />
      <div className="h-8 skeleton rounded w-2/3" />
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      {[1,2,3,4,5,6].map(j => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 skeleton rounded w-full" />
        </td>
      ))}
    </tr>
  ));
}
