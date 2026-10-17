import mjml from 'mjml';
import { composeEmail } from '@shop/service';

// Only email handlers load the responsive renderer. Other workers do not send mail.
export async function responsiveEmail(to: string, subject: string, content: string) {
  const rendered = await mjml(`<mjml><mj-body><mj-section><mj-column><mj-text>${content}</mj-text></mj-column></mj-section></mj-body></mjml>`);
  if (rendered.errors.length) throw new Error('Invalid responsive email template');
  if (!rendered.html.includes(content)) throw new Error('Email body was lost while rendering');
  return composeEmail(to, subject, rendered.html);
}
