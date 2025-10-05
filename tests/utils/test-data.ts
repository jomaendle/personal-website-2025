/**
 * Test data for form submissions and API testing
 */

export const validContactFormData = {
  name: 'Test User',
  email: 'test@example.com',
  topic: 'This is a test message for automated testing purposes. It meets the minimum length requirement.',
};

export const validNewsletterData = {
  email: 'newsletter@example.com',
};

export const invalidEmailFormats = [
  'invalid',
  'invalid@',
  '@example.com',
  'invalid@.com',
  'invalid..email@example.com',
  'invalid email@example.com',
];

export const edgeCaseEmails = [
  'test+tag@example.com', // Plus addressing
  'test.name@example.com', // Dots in local part
  'test@sub.example.com', // Subdomain
  'test@example.co.uk', // Multiple TLD
];

export const testBlogSlugs = [
  'animations',
  'align-dates-in-tables',
  'animated-sign-up-button',
  'focus-zoom-at-property',
  'html-popover',
  'css-carousel',
];

export const mockApiResponses = {
  contact: {
    success: {
      status: 200,
      body: { success: true, message: 'Message sent successfully' },
    },
    error: {
      status: 500,
      body: { error: 'Failed to send message', details: 'Server error' },
    },
    validation: {
      status: 400,
      body: { error: 'Validation failed', details: 'Invalid input' },
    },
  },
  newsletter: {
    success: {
      status: 200,
      body: { success: true, message: 'Subscribed successfully' },
    },
    alreadySubscribed: {
      status: 400,
      body: { error: 'Email already subscribed' },
    },
    error: {
      status: 500,
      body: { error: 'Subscription failed', details: 'Server error' },
    },
  },
  viewTracking: {
    increment: {
      status: 200,
      body: { slug: 'test-post', views: 42 },
    },
    list: {
      status: 200,
      body: [
        { slug: 'animations', views: 100 },
        { slug: 'html-popover', views: 50 },
      ],
    },
  },
};

export const testViewportSizes = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 }, // Full HD
  ultrawide: { width: 3440, height: 1440 }, // Ultrawide
};

export const commonSelectors = {
  navigation: {
    header: 'header',
    nav: 'nav',
    footer: 'footer',
  },
  forms: {
    contact: {
      name: 'input[name="name"]',
      email: 'input[type="email"]',
      message: 'textarea',
      submit: 'button[type="submit"]',
    },
    newsletter: {
      email: 'input[type="email"]',
      submit: 'button[type="submit"]',
    },
  },
  blog: {
    article: 'article',
    heading: 'h1',
    content: '.prose',
    viewCounter: '[data-testid="view-counter"]',
  },
};

export const accessibilityTestConfig = {
  wcagTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  disabledRules: [] as string[], // Add rules to skip if needed
  context: {
    include: [['body']],
    exclude: [['.third-party-widget']], // Exclude third-party content
  },
};

export const performanceThresholds = {
  fcp: 2000, // First Contentful Paint (ms)
  lcp: 2500, // Largest Contentful Paint (ms)
  cls: 0.1, // Cumulative Layout Shift
  fid: 100, // First Input Delay (ms)
  ttfb: 600, // Time to First Byte (ms)
};
