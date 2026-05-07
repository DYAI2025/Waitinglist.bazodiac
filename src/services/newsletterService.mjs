import { randomBytes } from 'node:crypto';
import { validateNewsletterRequest } from '../validation.mjs';
import { subscribe } from '../providers/newsletterProvider.mjs';
import { loadFixture, FIXTURE_NAMES } from '../fixtures.mjs';

function newSubscriptionId() {
  return `sub_${randomBytes(3).toString('hex')}`;
}

export async function subscribeToNewsletter(rawBody, { config }) {
  const input = validateNewsletterRequest(rawBody);

  if (config.stubMode) {
    const fixture = await loadFixture(FIXTURE_NAMES.newsletterSuccess);
    fixture.subscription.email = input.email;
    return fixture;
  }

  const result = await subscribe({
    email: input.email,
    name: input.name,
    language: input.language,
    chartSessionId: input.chartSessionId,
    config,
  });

  if (result?.alreadySubscribed) {
    // Soft-success per contracts/public-api.md.
    return {
      ok: true,
      subscribed: true,
      subscription: {
        id: newSubscriptionId(),
        email: input.email,
        confirmedAt: new Date().toISOString(),
        doubleOptInRequired: false,
      },
    };
  }

  return {
    ok: true,
    subscribed: true,
    subscription: result,
  };
}
