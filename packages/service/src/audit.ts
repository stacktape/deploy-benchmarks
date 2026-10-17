// Production integrations, exercised locally without sending network requests.
import { Client } from '@elastic/elasticsearch';
import { Scope } from '@sentry/node';
import { drive } from '@googleapis/drive';
import { calendar } from '@googleapis/calendar';
import { customerProfile } from '@shop/util';

const search = new Client({ node: 'https://search.shop.example' });
const archive = drive({ version: 'v3' });
const deliveries = calendar({ version: 'v3' });

export function auditEnvelope(operation: string) {
  const customer = customerProfile('US', '+12025550123', [25, 8]);
  const scope = new Scope();
  scope.setTag('operation', operation);
  scope.setContext('customer', customer);
  // Use the client's actual serializer, as the indexing transport does.
  const document = JSON.parse(search.serializer.serialize({ operation, customer })!);
  return {
    document,
    tags: scope.getScopeData().tags,
    archiveRequest: { method: 'POST', url: `${archive.context._options.rootUrl ?? 'https://www.googleapis.com/'}drive/v3/files`, body: { name: `${operation}.json`, mimeType: 'application/json' } },
    deliveryRequest: { method: 'POST', url: `${deliveries.context._options.rootUrl ?? 'https://www.googleapis.com/'}calendar/v3/calendars/primary/events`, body: { summary: operation, start: { date: '2025-01-16' }, end: { date: '2025-01-17' } } }
  };
}
