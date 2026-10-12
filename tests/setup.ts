// Shared Vitest setup.
// - Firebase is never initialised in unit tests: the cloud service module is
//   replaced by a stub whose every method is a no-op (subscriptions return an
//   unsubscribe function). Pure-logic suites and component tests need nothing more.
// - jsdom's window.location.origin (http://localhost:3000) is what the public
//   pages use to build links; assertions use relative paths.
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

vi.mock('../services/cloud', () => {
  const noop = () => () => {};
  const cloudService: any = new Proxy({}, {
    get: (_t, key: string) => {
      if (key === 'isConfigured') return () => false;
      if (key === 'getConfig') return () => null;
      if (key === 'then') return undefined; // not a thenable
      return noop;
    },
  });
  return { cloudService };
});

afterEach(() => cleanup());
