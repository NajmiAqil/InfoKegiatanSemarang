// React.memo untuk prevent unnecessary re-renders
import React, { memo } from 'react';

// Contoh optimalisasi component dengan React.memo
// Gunakan untuk component yang sering re-render tapi props jarang berubah

/*
Example usage in InfoDisplay.tsx atau components lain:

const ActivityCard = memo(({ activity, onClick }) => {
  return (
    <div className="activity-card" onClick={onClick}>
      <h3>{activity.judul}</h3>
      <p>{activity.tanggal}</p>
    </div>
  );
});

const ActivityList = memo(({ activities }) => {
  return (
    <div className="activity-list">
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} onClick={() => handleClick(activity.id)} />
      ))}
    </div>
  );
});
*/

// Performance optimization tips:
// 1. Use React.memo() for pure components that render often
// 2. Use useCallback() for event handlers passed as props
// 3. Use useMemo() for expensive calculations
// 4. Lazy load heavy components with React.lazy()
// 5. Implement virtual scrolling for long lists (react-window)

// Example: Lazy loading calendar component
/*
const CalendarMonth = React.lazy(() => import('./CalendarMonth'));

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <CalendarMonth activities={activities} />
    </Suspense>
  );
}
*/

// Example: useMemo for expensive filtering
/*
const filteredActivities = useMemo(() => {
  return activities.filter(a => {
    // Complex filtering logic
    return someExpensiveCalculation(a);
  });
}, [activities]); // Only recalculate when activities change
*/

// Example: Virtual scrolling for large lists
/*
import { FixedSizeList } from 'react-window';

const VirtualizedActivityList = ({ activities }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      {activities[index].judul}
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={activities.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
*/

export {};
