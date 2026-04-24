const AppConfig = {
  API_BASE: window.location.origin,
  DEFAULT_SKIN: 'retail',

  USERS: [
    {
      key: 'user-robert-001',
      name: 'Robert',
      role: 'Customer',
      initial: 'R',
      context: {
        kind: 'multi',
        user: { key: 'user-robert-001', name: 'Robert', role: 'customer', state: 'Texas', country: 'US' },
        device: { key: 'device-robert-001', type: 'desktop', os: 'Windows 11', browser: 'Chrome' },
      },
    },
    {
      key: 'user-jennifer-002',
      name: 'Jennifer',
      role: 'Customer',
      initial: 'J',
      context: {
        kind: 'multi',
        user: { key: 'user-jennifer-002', name: 'Jennifer', role: 'customer', state: 'California', country: 'US' },
        device: { key: 'device-jennifer-002', type: 'mobile', os: 'iOS 17', browser: 'Safari' },
      },
    },
    {
      key: 'user-alex-003',
      name: 'Alex',
      role: 'Developer',
      initial: 'A',
      context: {
        kind: 'multi',
        user: { key: 'user-alex-003', name: 'Alex', role: 'developer', state: 'Oregon', country: 'US' },
        device: { key: 'device-alex-003', type: 'laptop', os: 'macOS Sonoma', browser: 'Firefox' },
      },
    },
  ],
};
