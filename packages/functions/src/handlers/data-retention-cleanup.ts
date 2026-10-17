import { receipt } from '../documents/receipt';
import { prisma, scheduledJob } from '@shop/service';
import { plusDays } from '@shop/util';
import { revision } from './data-retention-cleanup.revision';

// Shipments delivered more than 90 days ago are archived.
export const handler = scheduledJob({ name: 'data-retention-cleanup' }, async (now) => {
  const cutoff = plusDays(now, -90);
  const old = await prisma.shipment.findMany({ where: { status: 'delivered', updatedAt: { lt: cutoff } } });
  for (const s of old) await prisma.shipment.update({ where: { id: s.id }, data: { status: 'archived' } });
  return { receipt: await receipt('data-retention-cleanup'), revision, cutoff: cutoff.toISOString(), archived: old.length };
});
