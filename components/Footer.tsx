import * as React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Fashion Playground. Become your own fashion icon.</p>
      </div>
    </footer>
  );
};

export default Footer;