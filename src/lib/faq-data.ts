export type FaqItem = {
  id: string;
  question: string;
  /** Plain-text answer for JSON-LD and accessibility fallbacks. */
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "book-service",
    question: "How do I book a service with Urbanmove?",
    answer:
      "Go to Get a quote, then select the desired service, time, and manpower needed for your move, making the process quick and convenient.",
  },
  {
    id: "belongings-insured",
    question: "Are my belongings insured during the move?",
    answer:
      "Yes. We provide insurance cover for your items against unexpected accidents or damage, so you can move with peace of mind.",
  },
  {
    id: "packing-materials",
    question: "Do you offer packing materials?",
    answer:
      "Yes. Urbanmove supplies quality packing materials so your belongings are packed securely for transport, and we can arrange full-service packing on request.",
  },
  {
    id: "large-heavy-items",
    question: "Can Urbanmove handle large or heavy items, such as pianos or safes?",
    answer:
      "Yes. Our team is trained and equipped to move large or heavy items carefully, using specialist equipment to keep your valuables safe in transit.",
  },
  {
    id: "service-areas",
    question: "What areas does Urbanmove serve?",
    answer:
      "Urbanmove covers local, national, and international moves. Get in touch and we'll advise on coverage for your route and how we can help.",
  },
  {
    id: "change-cancel-booking",
    question: "Can I change or cancel my booking?",
    answer:
      "Yes, you can change or cancel a booking. Fees may apply depending on how much notice you give. Contact our team for details of the cancellation policy.",
  },
  {
    id: "book-in-advance",
    question: "How far in advance should I book my move with Urbanmove?",
    answer:
      "Book as early as you can to secure your preferred date. Plans change, and we'll do our best to fit in last-minute moves when we have availability.",
  },
  {
    id: "weekends-holidays",
    question: "Do you offer services on weekends and holidays?",
    answer:
      "Yes. Urbanmove works weekends and holidays where it suits your schedule. Spaces can be limited at busy times, so booking ahead helps lock in your preferred slot.",
  },
];
