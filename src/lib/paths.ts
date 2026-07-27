const base = import.meta.env.BASE_URL || '/';

export const sitePath = (path = '/') =>
  `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`.replace(/\/+/g, '/');
