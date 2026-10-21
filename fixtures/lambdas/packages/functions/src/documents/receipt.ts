// Each entry point renders a customer-facing receipt and a partner export.
import mjml from 'mjml';
import Handlebars from 'handlebars';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

const template = Handlebars.compile('<article><h1>{{operation}}</h1>{{{details}}}</article>');
export async function receipt(operation: string) {
  const details = sanitizeHtml(marked.parse('**Order summary**: two coffees and one mug.', { async: false }));
  const rendered = template({ operation, details });
  const email = await mjml(`<mjml><mj-body><mj-section><mj-column><mj-text>${rendered}</mj-text></mj-column></mj-section></mj-body></mjml>`);
  if (email.errors.length) throw new Error('Invalid responsive email template');
  const html = email.html;
  const csv = stringify([{ operation, total: '33.00', currency: 'USD' }], { header: true });
  const [row] = parse(csv, { columns: true });
  const xml = new XMLBuilder().build({ receipt: row });
  const decoded = new XMLParser({ parseTagValue: false }).parse(xml);
  if (decoded.receipt.total !== '33.00') throw new Error('Invalid partner export');
  return { html, csv, xml };
}
