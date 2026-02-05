import SyncStatus from '../components/Sync/SyncStatus';
import SyncLogs from '../components/Sync/SyncLogs';

export default function Sync() {
  return (
    <div className="grid gap-6">
      <SyncStatus />
      <SyncLogs />
    </div>
  );
}
