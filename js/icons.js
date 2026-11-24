export const svgIcon = (paths, cls = 'nav-icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  mark: '<path d="M12 2.8 19 6v6.2c0 4.4-2.9 7.4-7 9-4.1-1.6-7-4.6-7-9V6z"/><path d="m8.5 12 2.1 2.1 5-5"/><circle cx="12" cy="12" r="8.6"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>',
  control: '<path d="M4 4h16v12H4z"/><path d="M8 20h8M12 16v4M8 8h8M8 12h5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  panel: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M10 10v10"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  sites: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  review: '<path d="M8 4h10v16H6V6h2z"/><path d="M9 10h6M9 14h6M9 17h4"/>',
  plan: '<path d="m4 17 8-10 8 10M7 17h10M10 13l2 2 4-5"/>'
};