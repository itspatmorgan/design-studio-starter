// The quote card's text rules. No browser APIs here, so Node can test them (text.test.ts).
export const MAX_QUOTE = 600;

// A quote without its own quotation marks or stray spacing, cut to a length a card can hold.
export const cleanQuote = (text: string) =>
  text.replace(/\s+/g, ' ').trim().replace(/^["“”']+|["“”']+$/g, '').trim().slice(0, MAX_QUOTE);

// The downloaded file's name, from the customer's name.
export const fileName = (spec: { customer: string }) => {
  const who = spec.customer.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `quote-card${who ? `-${who}` : ''}.png`;
};
