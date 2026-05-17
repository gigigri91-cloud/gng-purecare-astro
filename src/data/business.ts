/** Date de contact și identitate — folosite în schema.org, header, footer, contact. */
export const business = {
  name: 'GNG PureCare',
  url: 'https://gngpurecare.ro',
  telephone: '+40747821384',
  telephoneDisplay: '0747 821 384',
  telephoneHref: 'tel:+40747821384',
  whatsappNumber: '40747821384',
  email: 'contact@gngpurecare.ro',
  logo: 'https://gngpurecare.ro/images/logo-gng-purecare.png',
  image: 'https://gngpurecare.ro/og-image.jpg',
  address: {
    streetAddress: 'București',
    addressLocality: 'București',
    addressRegion: 'București',
    postalCode: '032351',
    addressCountry: 'RO',
  },
  geo: {
    latitude: 44.4268,
    longitude: 26.1025,
  },
  sameAs: [
    'https://www.facebook.com/gngpurecare',
    'https://www.instagram.com/gngpurecare',
  ],
} as const;
