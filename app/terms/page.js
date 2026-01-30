export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using this NFC Tag Manager service ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service allows you to create, manage, and configure NFC tags. You can link physical NFC tags to your account, customize the information displayed when tags are scanned, and manage multiple tag profiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>3.1. You are responsible for maintaining the confidentiality of your account credentials.</p>
              <p>3.2. You are responsible for all activities that occur under your account.</p>
              <p>3.3. You must provide accurate and complete information when creating an account.</p>
              <p>3.4. You must notify us immediately of any unauthorized use of your account.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Acceptable Use</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any malicious code, viruses, or harmful data</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service to spam, harass, or harm others</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Content and Data</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>5.1. You retain ownership of all content and data you submit to the Service.</p>
              <p>5.2. You grant us a license to use, store, and process your content to provide the Service.</p>
              <p>5.3. You are responsible for ensuring you have the right to use any content you submit.</p>
              <p>5.4. We reserve the right to remove content that violates these Terms or applicable laws.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Service Availability</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>7.1. We strive to provide reliable service but do not guarantee uninterrupted or error-free operation.</p>
              <p>7.2. We reserve the right to modify, suspend, or discontinue the Service at any time.</p>
              <p>7.3. We are not liable for any downtime or service interruptions.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Termination</h2>
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p>9.1. We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms.</p>
              <p>9.2. You may terminate your account at any time by contacting us.</p>
              <p>9.3. Upon termination, your right to use the Service will immediately cease.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through the support channels provided in the application.
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
