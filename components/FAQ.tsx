import * as React from 'react';

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-4"
      >
        <span className="font-semibold text-lg">{question}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: 'Is my data private?',
      answer: 'Absolutely. We prioritize your privacy. Uploaded photos are only used to generate your styles and are not stored long-term or used for any other purpose.',
    },
    {
      question: 'What kind of photos should I upload?',
      answer: 'For best results, use a clear, well-lit, full-body or half-body photo of yourself. For clothing, individual item photos on a plain background work best, but our AI is resilient and can handle various image types.',
    },
    {
      question: 'Does this work for all body types and skin tones?',
      answer: 'Yes! Our tool is built on an inclusive AI model that is designed to preserve your unique body type, skin tone, face, and hair, ensuring a realistic and authentic result.',
    },
    {
        question: 'Can I use clothes from online shopping sites?',
        answer: 'Definitely! Just save the product image from any e-commerce website and upload it to your wardrobe in the playground. It\'s a great way to "try before you buy".'
    }
  ];

  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <FaqItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;