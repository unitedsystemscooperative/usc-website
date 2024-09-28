import { SystemDashboard } from '@/app/admin/systems/_components/systemDashboard';
import { getSystems } from '@/app/api/systems/systems-api-utils';
import { runAdminAuthCheck } from '@/utils/runAuthCheck';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'USC | System Query ... System',
};

export default async function SystemQueryPage() {
  const data = await runAdminAuthCheck('admin_index', getSystems);
  return (
    <>
      <SystemDashboard init={data} />
    </>
  );
}
