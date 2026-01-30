export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy describes how we collect, use, and protect your personal information when you use our NFC Tag Manager service ("Service"). We are committed to protecting your privacy and ensuring the security of your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">2.1. Account Information</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Email address (required)</li>
                <li>Username or full name (optional)</li>
                <li>Password (encrypted and hashed)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">2.2. Tag Information</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Tag names and descriptions</li>
                <li>Contact information (phone numbers, addresses)</li>
                <li>Custom instructions and URLs</li>
                <li>NFC tag identifiers (if linked)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mt-4 mb-2">2.3. Usage Information</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Account activity and usage patterns</li>
                <li>Device information and IP addresses</li>
                <li>Browser type and version</li>
                <li>Access times and dates</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Authenticate your account and process your requests</li>
                <li>Send password reset emails and account notifications</li>
                <li>Improve and optimize the Service</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send marketing communications (only if you opt-in)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>4.1. We use industry-standard security measures to protect your data, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Encrypted password storage (bcrypt hashing)</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
              </ul>
              <p className="mt-3">4.2. Your data is stored on secure servers with appropriate safeguards.</p>
              <p>4.3. While we implement strong security measures, no method of transmission over the internet is 100% secure.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Sharing and Disclosure</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>With service providers who assist in operating the Service (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Public Tag Information</h2>
            <p className="text-gray-700 leading-relaxed">
              Information you configure for your NFC tags (such as contact details, addresses, and instructions) will be publicly accessible when someone scans your NFC tag. Only include information you are comfortable sharing publicly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Rights</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
                <li>Withdraw consent where applicable</li>
              </ul>
              <p className="mt-3">To exercise these rights, please contact us through the support channels in the application.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We may use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve the Service. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide the Service. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using the Service, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the support channels provided in the application.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href="/register"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            ← Back to Registration
          </a>
        </div>
      </div>
    </div>
  );
}
