import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Privacy Policy Page
 * Displays VYBE's privacy policy and data handling practices
 */
export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy - VYBE</title>
        <meta name="description" content="VYBE Privacy Policy - How we collect, use, and protect your information at vybebd.store" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last Updated: March 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to VYBE ("we," "our," or "us"). This Privacy Policy explains how <strong>vybebd.store</strong> collects, uses, and protects your information when you visit or make a purchase from our website.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              By using our website, you agree to the practices described in this policy.
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Personal Information
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Full Name</li>
              <li>Phone Number</li>
              <li>Delivery Address</li>
              <li>Order Details</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This information is collected when you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Place an order</li>
              <li>Fill out the checkout form</li>
              <li>Verify your phone number using OTP</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-6">
              Automatically Collected Data
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may automatically collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Pages visited</li>
              <li>Usage data</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              This information helps us improve our website performance and user experience.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Process and confirm orders</li>
              <li>Deliver products to your address</li>
              <li>Verify your phone number using OTP</li>
              <li>Communicate order updates</li>
              <li>Improve website performance and security</li>
              <li>Prevent fraudulent or fake orders</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              We do not sell or rent your personal data to third parties.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              3. Phone Number Verification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To prevent fraudulent orders, vybebd.store may send a verification code (OTP) to your phone number during checkout.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This OTP is used only for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Verifying your identity</li>
              <li>Confirming your order</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              Your phone number will not be used for spam or promotional SMS without consent.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement reasonable security measures to protect your data.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your information may be stored securely in our systems and protected against unauthorized access, disclosure, or misuse.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our website may use third-party services to operate properly, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Payment processors</li>
              <li>SMS verification providers</li>
              <li>Analytics tools</li>
              <li>Hosting providers</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              These third parties may have access to limited data required to perform their services.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              6. Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our website may use cookies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Improve user experience</li>
              <li>Remember cart items</li>
              <li>Analyze website performance</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can disable cookies through your browser settings.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              However, some website features may not work properly if cookies are disabled.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We keep customer information only as long as necessary to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Process orders</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              After this period, information may be deleted or anonymized.
            </p>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. User Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Users may request to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
              <li>Access their personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of their data</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Requests can be made through our contact channels.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy occasionally.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When changes occur, the updated version will be posted on this page with a revised date.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Continued use of our website means you accept the updated policy.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this Privacy Policy, please contact us through our website:
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
