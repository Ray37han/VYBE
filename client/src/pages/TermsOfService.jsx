import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Terms of Service Page
 * Displays VYBE's terms and conditions for using the website
 */
export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Terms of Service - VYBE</title>
        <meta name="description" content="VYBE Terms of Service - Rules and guidelines for using vybebd.store" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last Updated: March 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms of Service govern your use of VYBE and the website <strong>vybebd.store</strong>.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By accessing or using our website, you agree to these terms.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Use of the Website
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to use the website only for lawful purposes.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You must not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Attempt to hack or disrupt the website</li>
              <li>Use automated systems to abuse services</li>
              <li>Submit false or misleading information</li>
              <li>Place fraudulent or fake orders</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Violation of these rules may result in account restriction or order cancellation.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. Orders and Verification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When placing an order:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>You must provide accurate information</li>
              <li>You may be required to verify your phone number using OTP</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Orders may be canceled if:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>The phone number cannot be verified</li>
              <li>The delivery address is invalid</li>
              <li>Fraudulent activity is suspected</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Pricing and Product Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We attempt to ensure that all product descriptions and prices are accurate.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              However, errors may occasionally occur.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Correct pricing errors</li>
              <li>Cancel orders affected by incorrect information</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Order Confirmation
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              After placing an order, you will receive a confirmation message.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              This confirmation does not guarantee acceptance of the order until it has been processed and verified.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Delivery
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Delivery times may vary depending on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Location</li>
              <li>Courier service</li>
              <li>Product availability</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              We are not responsible for delays caused by external delivery services.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Returns and Refunds
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Return and refund policies may vary depending on product condition and circumstances.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Customers should contact support for assistance regarding damaged or incorrect products.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All content on vybebd.store including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Images</li>
              <li>Product designs</li>
              <li>Text</li>
              <li>Graphics</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              is the property of VYBE and may not be copied, reproduced, or redistributed without permission.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We are not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Indirect or incidental damages</li>
              <li>Loss resulting from misuse of our website</li>
              <li>Service interruptions caused by technical issues</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Use of our website is at your own risk.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to update these Terms of Service at any time.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Updated terms will be posted on this page.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Continued use of the website indicates acceptance of the updated terms.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Contact
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions regarding these terms, please contact us through:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Website:</strong> <a href="https://vybebd.store" className="text-blue-600 dark:text-blue-400 hover:underline">vybebd.store</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Email:</strong> <a href="mailto:vybe.in911@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">vybe.in911@gmail.com</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                <strong>Phone:</strong> <a href="tel:+8801410809138" className="text-blue-600 dark:text-blue-400 hover:underline">+880 1410 809138</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
