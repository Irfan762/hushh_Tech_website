export const getNavLinks = (t: (key: string, defaultValue?: string) => string) => [
  { path: "/", label: t('nav.home', 'Home') },
  { path: "/about/leadership", label: t('nav.ourPhilosophy', 'Our Philosophy') },
  { path: "/discover-fund-a", label: t('nav.fundA', 'Fund A') },
  { path: "/community", label: t('nav.community', 'Community') },
  { path: "/a2a-playground", label: t('nav.kycStudio', 'KYC Studio') },
  { path: "/Contact", label: t('nav.contact', 'Contact') },
  { path: "/faq", label: t('nav.faq', 'FAQ') },
];
