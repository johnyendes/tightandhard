export default function PrivacyPage() {
  return (
    <div className='max-w-3xl mx-auto py-12 px-6 prose prose-invert'>
      <h1>Privacy Policy</h1>
      <p className='text-sm text-muted-foreground'>Last updated: April 20, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li><strong>Account information:</strong> email address, name, and authentication data via Clerk.</li>
        <li><strong>Payment information:</strong> billing details processed by Stripe. We do not store your full card number on our servers.</li>
        <li><strong>Usage data:</strong> conversation history, companion preferences, feature usage.</li>
        <li><strong>Technical data:</strong> IP address, browser type, device information, access timestamps.</li>
        <li><strong>Age verification record:</strong> a hashed confirmation timestamp when you confirm you are 18+.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide and improve the Service;</li>
        <li>Process payments and manage subscriptions;</li>
        <li>Communicate about your account and Service updates;</li>
        <li>Enforce Terms of Service and prevent abuse;</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We share data only with essential service providers:</p>
      <ul>
        <li>Clerk (authentication);</li>
        <li>Stripe (payment processing);</li>
        <li>OpenAI, Replicate (AI content generation — conversation content may be transmitted);</li>
        <li>Cloud infrastructure providers (hosting and databases).</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>4. Data Retention</h2>
      <p>
        Account and conversation data is retained for as long as your account
        remains active. You may request deletion at any time via the Settings
        page; upon request we delete personal data within 30 days, except where
        retention is required for legal or financial compliance.
      </p>

      <h2>5. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have rights to access, correct,
        export, or delete your personal data. Contact privacy@tightandhard.com to
        exercise these rights.
      </p>

      <h2>6. Security</h2>
      <p>
        We use industry-standard safeguards (TLS encryption, encrypted data at
        rest, access controls). No system is perfectly secure; use strong passwords
        and do not share your credentials.
      </p>

      <h2>7. Children</h2>
      <p>
        The Service is strictly for adults aged 18+. We do not knowingly collect
        data from minors. If we discover a minor has registered, we will delete
        the account immediately.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy. Material changes will be announced via email or
        on-site notice.
      </p>

      <h2>9. Contact</h2>
      <p>Questions about privacy? privacy@tightandhard.com</p>
    </div>
  );
}
