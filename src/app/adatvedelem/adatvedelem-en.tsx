"use client";

/**
 * /adatvedelem — English version (informative translation).
 * The Hungarian original is the legally binding version (see notice at top).
 */
export function AdatvedelemEN() {
  return (
    <>
      <p style={{ fontStyle: "italic" }}>
        <strong>Notice:</strong> This English version is provided for ease of understanding. The{" "}
        <strong>Hungarian original is the legally binding version</strong> — in case of any
        discrepancy, the Hungarian text prevails. You can switch to it anytime using the language
        switcher above.
      </p>

      <p>
        This policy describes what personal data we process while providing the kinti.app service,
        on what legal basis, for how long, and what rights you have in relation to it. Processing
        is carried out under <strong>Regulation (EU) 2016/679 (GDPR)</strong> and the Swiss Federal
        Act on Data Protection (revFADP/nDSG).
      </p>

      <h2>1. Controller</h2>
      <p>
        Controller: <strong>Feedback Jobs S.R.L.</strong><br />
        Registered address: Cart. Bekecs, Bloc F, Ap. 15, 545500 Szováta (Sovata), Mureș County, Romania.<br />
        Company registration number: J2025098494007 · Tax ID (CUI): 53137115.<br />
        Contact: <a href="mailto:info@kinti.app">info@kinti.app</a> · Phone:{" "}
        <a href="tel:+40752607245">+40 752 607 245</a>
      </p>
      <p>
        Appointing a data protection officer is not legally required, as the processing does not
        meet the conditions of Article 37(1) GDPR.
      </p>

      <h2>2. What data do we process?</h2>

      <h3>2.0 Age limit</h3>
      <p>
        The Service may be used by persons who have reached the{" "}
        <strong>age of 18</strong> (adults). We do not knowingly collect data from younger users;
        if we nevertheless become aware of such a case, we delete the data concerned without delay.
      </p>

      <h3>2.1 Sign-in / account (Clerk)</h3>
      <p>
        Most of the platform is <strong>registration-free</strong>. We use the Clerk Inc. (USA)
        sign-in service in two cases: (1) for the <strong>administrator</strong> to sign in, and
        (2) for ordering and managing the <strong>Kinti PRO subscription</strong>, since we tie the
        subscription to the user account (see 2.14). Visitors / businesses / content submitters do
        not otherwise encounter Clerk registration. Clerk processes your email address (and the
        profile data you provide) for sign-in.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(b) GDPR — performance of a contract</li>
        <li><strong>Retention:</strong> until the account is deleted + 30 days (audit)</li>
        <li><strong>Processor:</strong> Clerk Inc. — <a href="https://clerk.com/privacy" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>2.2 Business / professional data (Directory)</h3>
      <p>
        The company and professional data shown in the Directory (company name or the
        professional's name, address, phone number, website, category, photo / logo) serve to make
        the business findable for the Hungarian community living abroad. This data may come from{" "}
        <strong>two sources</strong>, with different legal bases:
      </p>
      <ul>
        <li>
          <strong>(a) Self-registration</strong> — the business submits or claims its own profile.{" "}
          <strong>Legal basis:</strong> Article 6(1)(b) GDPR — performance of the service
          (display), or Article 6(1)(a) — consent.
        </li>
        <li>
          <strong>(b) Entries compiled by the operator from publicly available sources</strong>{" "}
          (e.g. official registers, the business's own website, professional and community
          directories, OpenStreetMap). Here we process exclusively{" "}
          <strong>public, occupation-related business contact data</strong> (not special
          categories). <strong>Legal basis:</strong> Article 6(1)(f) GDPR — legitimate interest:
          maintaining a professional directory available (also) in Hungarian, serving the Hungarian
          community living abroad. In the balancing test we took into account that we process only
          already-public, professional data, and that the data subject may object or request
          deletion at any time.
        </li>
      </ul>
      <p>
        <strong>Objection and deletion (for both sources):</strong> the professional / business can
        claim and correct their own entry using the <strong>"Claim your business"</strong> feature,
        or request its deletion or removal at <a href="mailto:info@kinti.app">info@kinti.app</a> /{" "}
        <a href="mailto:abuse@kinti.app">abuse@kinti.app</a> (right to object under Article 21
        GDPR) — we fulfil the request without delay. On the accuracy and source of displayed data,
        see also section 10 of the Terms of Use.
      </p>
      <ul>
        <li><strong>Retention:</strong> until the entry is deleted, or until the data subject's objection is fulfilled.</li>
      </ul>

      <h3>2.3 Content submission (without an account)</h3>
      <p>
        Posting community content (reviews, business submissions, etc.) does not require
        registration. Data provided at submission:
      </p>
      <ul>
        <li>Email address (solely for sending transactional confirmation links — never displayed publicly)</li>
        <li>The text and category of the submitted content</li>
        <li>Optional display name</li>
        <li><strong>Technical and contact processes</strong>:
          <ul>
            <li><strong>Contact</strong>: The submitter may provide their phone number or other public contact details. kinti.app does not operate an internal messaging service and does not relay messages between parties.</li>
            <li><strong>Image upload</strong>: Uploaded images are stored in Cloudflare R2 cloud storage and are physically deleted when the content expires / is deleted.</li>
            <li><strong>Spam protection</strong>: On submissions (e.g. reviews) we store the IP address in a one-way, irreversible (SHA-256) hash format — the original IP address cannot be reconstructed from it.</li>
            <li><strong>Secure content management</strong>: The identifier keys (tokens) needed to edit content later are stored exclusively in the user's browser (<code>localStorage</code>).</li>
          </ul>
        </li>
      </ul>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent</li>
        <li><strong>Retention:</strong> until the content expires or until deletion initiated by the submitter (the management link lives in the browser's localStorage).</li>
      </ul>

      <div style={{
        background: "var(--surface-alt, #f4ede0)",
        border: "1px solid var(--border, #e6ebe5)",
        borderRadius: 14,
        padding: "14px 16px",
        margin: "16px 0",
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>🔒 Automatic, irreversible deletion</p>
        <p style={{ margin: "6px 0 0" }}>
          Under the principle of data minimisation we store data only as long as necessary. An
          automatic daily script (Cloudflare cron) <strong>physically and permanently
          deletes</strong>:
        </p>
        <ul style={{ margin: "8px 0 0" }}>
          <li><strong>expired listings</strong> (job listing, "I'm looking for" and housing listing) once their expiry period has passed, together with the images uploaded to them;</li>
          <li>unconfirmed drafts and submissions (after 24 hours).</li>
        </ul>
        <p style={{ margin: "8px 0 0" }}>
          What we no longer hold cannot leak. Deletion is irreversible.
        </p>
      </div>

      <h3>2.4 Technical data (Cloudflare)</h3>
      <p>
        Cloudflare automatically processes request metadata (IP address, User-Agent, request
        timestamp) to provide DDoS protection and availability. We{" "}
        <strong>do not store this data in our own database</strong>.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(f) GDPR — legitimate interest (system security)</li>
        <li><strong>Processor:</strong> Cloudflare, Inc. — <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>2.5 Cloudflare Turnstile (CAPTCHA)</h3>
      <p>
        On submission forms, the Cloudflare Turnstile service protects the system from spam-bot
        attacks. Turnstile <strong>does not use cookies</strong> and{" "}
        <strong>does not collect personally identifiable data</strong>; it only evaluates the
        nature of the request (bot or human) based on the IP address.
      </p>

      <h3>2.6 Transactional emails and notifications (Resend)</h3>
      <p>
        We send user-requested confirmation links, backups, and expiry warnings via the service of
        Resend Inc. (USA). Resend also handles administrator notifications (moderation of new
        content, content reports). Email addresses pass through Resend's servers only for the
        duration of the technical delivery.
      </p>
      <div style={{
        background: "var(--surface-alt, #f4ede0)",
        border: "1px solid var(--border, #e6ebe5)",
        borderRadius: 14,
        padding: "14px 16px",
        margin: "16px 0",
      }}>
        <p style={{ margin: 0, fontWeight: 700 }}>🚫 No spam — marketing email only with separate opt-in</p>
        <p style={{ margin: "6px 0 0" }}>
          To the email address and phone number you provide when submitting content / making a
          purchase, we send <strong>transactional messages only</strong> (confirmation, deletion,
          expiry, invoice). You will receive marketing email (newsletter){" "}
          <strong>only if</strong> you have separately and expressly consented via{" "}
          <strong>double opt-in</strong> (see 2.16) — and you can unsubscribe from it at any time
          with one click. We never send SMS.
        </p>
      </div>
      <ul>
        <li><strong>Processor:</strong> Resend, Inc. — <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>2.7 Location data (GPS coordinates)</h3>
      <p>
        While using the Service — in order to display professionals, businesses, or community posts
        near you — you may enable your device's location function (GPS). Processing of location
        data is transient: we <strong>do not link it to your identity, do not store it in a
        server-side database</strong>, and do not use it for tracking or profiling. Location can be
        disabled at any time in your browser settings.
      </p>

      <h3>2.8 Moderation and blocklists (legitimate interest)</h3>
      <p>
        To ensure platform security, prevent spam attacks, and protect the community, we may store
        on an internal blocklist the technical identifiers (e.g. IP address hash, hashes of abusive
        email addresses) of users permanently banned by moderators for serious breaches of the
        Terms of Use.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(f) GDPR — legitimate interest (preventing abuse)</li>
        <li><strong>Retention:</strong> until the ban is lifted (typically indefinitely)</li>
      </ul>

      <h3>2.9 Artificial intelligence (AI) processing — Cloudflare Workers AI</h3>
      <p>
        The platform offers, in places, <strong>AI features based on large language models
        (LLM)</strong> (see Terms 13.1). Model calls run on the Cloudflare Workers AI
        infrastructure, on Cloudflare edge servers located in Europe (Meta Llama open-source model,
        without payload-level logging).
      </p>
      <p>Data processed by the AI features:</p>
      <ul>
        <li>
          <strong>Natural-language search</strong>: the search sentence entered by the user (max
          200 characters). Must NOT contain personal data.
        </li>
        <li>
          <strong>Business description assistant</strong>: the description text entered by the
          business (max 1000 characters), which becomes public on its profile anyway.
        </li>
        <li>
          <strong>German word dictionary</strong>: a single word or short phrase (max 60
          characters). Contains no personal data.
        </li>
      </ul>
      <ul>
        <li><strong>Legal basis</strong>: Article 6(1)(f) GDPR — legitimate interest (improving user experience).</li>
        <li><strong>Retention</strong>: Workers AI <strong>does not store</strong> the processed input and output (not even for training); AI responses are edge-cached for at most 7 days (German word dictionary).</li>
        <li><strong>Processor</strong>: Cloudflare, Inc. (Workers AI) —{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a>;{" "}
          <a href="https://developers.cloudflare.com/workers-ai/privacy/" target="_blank" rel="noreferrer">Workers AI data handling</a>.</li>
        <li><strong>Spam protection</strong>: AI calls are protected by an IP-hash-based rate limit; its log lives for at most 24 hours, after which it is deleted automatically.</li>
      </ul>
      <p>
        A plain-language description of all AI features, the models used, and their limits:{" "}
        <a href="/ai-atlathatosag">AI transparency page</a>.
      </p>

      <h3>2.10 Business analytics</h3>
      <p>
        We process the aggregated traffic data visible on the business's own management link
        (number of profile opens, number of phone-number clicks, broken down by day) as follows:
      </p>
      <ul>
        <li>The counters are <strong>anonymous aggregates</strong> — towards the business they contain no IP address, browser identifier, or any data traceable to individual visitors.</li>
        <li>To avoid duplication we store, for a short time (at most 7 days), the <strong>SHA-256 hash</strong> of the visitor's IP address + an hour-precision timestamp. The business does NOT see this; it solely ensures the accuracy of the counter.</li>
        <li><strong>Legal basis</strong>: Article 6(1)(f) GDPR — legitimate interest (informing the business about traffic to its own profile).</li>
        <li><strong>Retention</strong>: the aggregated counters for as long as the business record exists; the IP-hash records of the dedupe table for 7 days.</li>
      </ul>

      <h3>2.11 Saved salary offers (Salary calculator "My offers")</h3>
      <p>
        The "My offers" feature of the Salary calculator stores the salary offers entered by the
        user (company label + salary + canton + marital status + age range, etc.) exclusively in
        the user's own browser (<code>localStorage</code>).{" "}
        <strong>No data is uploaded</strong> to the operator's server, and other users cannot access
        it. The data can be permanently deleted at any time by clearing the browser storage.
      </p>

      <h3>2.12 Push notifications (canton-targeted)</h3>
      <p>
        In your browser you may enable push notifications so that we can tell you about new
        businesses, jobs, "I'm looking for" requests, and housing listings in your region (or on
        certain topics, e.g. daily reminder, seasonal tasks). Categories can be toggled
        individually on the Notifications page. On subscription we store in our database: the
        impersonal subscription <code>endpoint</code> URL generated by your browser, the associated
        public encryption keys (<code>p256dh</code>, <code>auth</code> — with which we encrypt the
        notification for you), and your chosen <strong>canton preference</strong> for targeting.
      </p>
      <p>
        <strong>Exchange-rate alert (money transfer home):</strong> if you enable it in the
        Transfer assistant, we store a <strong>flag</strong> against your impersonal push
        subscription indicating that you want to be notified when the exchange rate becomes
        favourable for transferring money home. This category is{" "}
        <strong>OFF by default</strong> (express opt-in), works independently of the other
        categories, and can be turned off at any time here or via your browser's notification
        permission. Whether a notification is sent is decided{" "}
        <strong>solely from public exchange-rate data</strong> (Frankfurter/ECB) —{" "}
        <strong>not</strong> from your transfers: the amount you set and the savings counter are{" "}
        <strong>stored exclusively on your own device</strong> (browser storage); we do not send
        them to the server and we do not see them. The notification is informational,{" "}
        <strong>not financial advice</strong> and not an offer.
      </p>
      <p>
        <strong>Data security:</strong> we send the content of the notification{" "}
        <strong>end-to-end encrypted</strong>. Although it passes through your browser's push
        service (Apple, Google, Mozilla), <strong>only your device can decrypt it</strong> — the
        push service does not see the content.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (at browser level and via the subscribe button)</li>
        <li><strong>Retention:</strong> until you block notifications in your browser or unsubscribe; we automatically delete expired (invalid) subscriptions.</li>
        <li><strong>Legal disclaimer (exchange rate):</strong> We accept no liability for the content of notifications (in particular for financial and exchange-rate data). The data is informational; kinti.app cannot be held liable for financial loss arising from delays or inaccuracies.</li>
      </ul>

      <h3>2.13 Deals map (store deal reporting) — DISCONTINUED</h3>
      <p>
        The Deals map feature was <strong>discontinued on 9 July 2026</strong>. The associated
        report data (GPS coordinate, store, discount, note) was, even while operational,
        automatically deleted by midnight the same day; with the feature's retirement the related
        data set was permanently deleted and no new data is collected. (The section is retained for
        continuity of numbering.)
      </p>

      <div className="web-only-payment">
        <h3>2.14 Kinti PRO subscription and payment (Paddle)</h3>
        <p>
          When purchasing the <strong>Kinti PRO</strong> subscription (and the Directory highlight /
          featured job), payment is handled by <strong>Paddle</strong> (Paddle.com Market Limited,
          United Kingdom) as <em>Merchant of Record</em>. Your card and billing data are processed
          directly by Paddle — <strong>kinti.app does not see or store card data</strong>.
        </p>
        <p>
          In our database we store only the <strong>status</strong> of the subscription in order to
          unlock features, tied to the signed-in user account (Clerk userId): subscription status,
          plan type, the Paddle subscription and customer identifier, and the end of the next
          billing period. We do not store invoice or card data.
        </p>
        <ul>
          <li><strong>Legal basis:</strong> Article 6(1)(b) GDPR — performance of a contract (providing the subscription); retention of accounting records: Article 6(1)(c) — legal obligation.</li>
          <li><strong>Retention:</strong> for the duration of the subscription, or until the accounting/tax retention deadline.</li>
          <li><strong>Processor / Merchant of Record:</strong> Paddle.com Market Limited —{" "}
            <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer">privacy policy</a>.</li>
        </ul>
      </div>
      <div className="android-only-payment">
        <h3>2.14 Kinti PRO subscription and payment (Google Play)</h3>
        <p>
          In the app, the <strong>Kinti PRO</strong> subscription (and the Directory highlight /
          featured job) can be purchased via the <strong>Google Play payment system</strong>{" "}
          (Google Ireland Limited). Your card and billing data are processed directly by Google —{" "}
          <strong>kinti.app does not see or store card data</strong>.
        </p>
        <p>
          In our database we store only the <strong>status</strong> of the subscription in order to
          unlock features, tied to the signed-in user account (Clerk userId): subscription status,
          plan type, the Google Play purchase identifier (purchase token), and the end of the next
          billing period. We do not store invoice or card data.
        </p>
        <ul>
          <li><strong>Legal basis:</strong> Article 6(1)(b) GDPR — performance of a contract (providing the subscription); retention of accounting records: Article 6(1)(c) — legal obligation.</li>
          <li><strong>Retention:</strong> for the duration of the subscription, or until the accounting/tax retention deadline.</li>
          <li><strong>Processor:</strong> Google Ireland Limited —{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">privacy policy</a>.</li>
        </ul>
      </div>

      <h3>2.15 Quote request and contact (lead)</h3>
      <p>
        If you send a message to businesses using the <strong>"Request a quote"</strong> feature, or
        claim an unconfirmed listing with the <strong>"Claim"</strong> button, we forward the data
        you provide (name, email, optional phone number, message) to the business concerned / to the
        administrator, and — in order to handle the enquiry — also record it in the database.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (by sending the enquiry).</li>
        <li><strong>Retention:</strong> <strong>at most 12 months</strong> from submission — after that we automatically and permanently delete the enquiry data; you may request earlier deletion at any time at <a href="mailto:info@kinti.app">info@kinti.app</a>.</li>
        <li><strong>Recipient:</strong> the contacted business (lead), or the moderating administrator (claim) — email forwarding takes place via Resend (see 2.6).</li>
      </ul>

      <h3>2.16 Newsletter (optional subscription)</h3>
      <p>
        If you subscribe to the newsletter, we store your <strong>email address</strong> and your
        optional <strong>country preference</strong> so that we can send you a periodic summary.
        Subscription uses <strong>double opt-in</strong>: we send a confirmation link to the
        address provided, and you are added to the list only after confirmation. Every newsletter
        contains a <strong>one-click unsubscribe</strong> link.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent.</li>
        <li><strong>Retention:</strong> until unsubscribed; unconfirmed subscriptions are deleted automatically.</li>
        <li><strong>Processor:</strong> Resend, Inc. (delivery) — see 2.6.</li>
      </ul>

      <h3>2.17 Job search and applications (Jobs module)</h3>
      <p>
        If you <strong>apply</strong> to a job listing, we record the data you provide
        (<strong>name, email address, optional phone number, message</strong>, and — if you upload
        one — your <strong>CV</strong>) and, <strong>on your initiative</strong>, forward it to the
        advertising employer so that they can contact you. The uploaded CV is stored in Cloudflare
        R2 and is not public — only the employer concerned (and, for technical reasons, the
        administration) can access it.
      </p>
      <p>
        Following the transfer, the employer processes your data as an{" "}
        <strong>independent controller</strong>, in line with their own data protection practice;
        the operator is not liable for this. In the Jobs module, Kinti operates a{" "}
        <strong>job listing service</strong> and does not create an employment relationship between
        the parties (see Terms 10.1).
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (by sending the application).</li>
        <li><strong>Recipient:</strong> the advertising employer (email forwarding via Resend, see 2.6).</li>
        <li><strong>Retention:</strong> until the application has been handled; you may request deletion at <a href="mailto:info@kinti.app">info@kinti.app</a>. You can track your previous applications in your browser in the "My applications" view.</li>
      </ul>

      <h3>2.18 Searchable candidate profile (candidate database)</h3>
      <p>
        If you create a <strong>candidate profile</strong> in the Jobs module and set it to{" "}
        <strong>"searchable"</strong>, we add your profile to a candidate search where the
        platform's <strong>approved (moderated) employers</strong> can search for and view it.
        Making the profile searchable is <strong>your express decision, revocable at any
        time</strong>; you can turn the toggle off in your profile or delete the profile.
      </p>
      <ul>
        <li><strong>Data processed / displayed:</strong> the name you provided, your canton, your professional category, your contact details, and — if you uploaded one — your <strong>CV</strong>.</li>
        <li><strong>Recipients:</strong> not a single employer, but <strong>all approved employers</strong> of the platform who use the candidate search (this differs from an application sent to a single advertiser under 2.17). The CV is stored in Cloudflare R2 and is not public; only a signed-in, approved employer (and, for technical reasons, the administration) can download it.</li>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (by making the profile searchable).</li>
        <li><strong>Retention:</strong> while your profile is searchable, or until the profile / CV is deleted. You can turn searchability off at any time, or request deletion at <a href="mailto:info@kinti.app">info@kinti.app</a>.</li>
      </ul>

      <h3>2.19 Deadline assistant (deadline reminders)</h3>
      <p>
        The deadlines you enter in the Deadline assistant are{" "}
        <strong>by default stored exclusively in your browser</strong> (<code>localStorage</code>) —
        in that case no data reaches our server.
      </p>
      <p>
        If you enable the <strong>push reminder</strong>, we store the{" "}
        <strong>title and date</strong> of your deadlines in our database, tied to your{" "}
        <strong>impersonal push subscription</strong> (without a user identifier — as with the push
        notifications in 2.12), so that we can notify you 14, 7, and 1 day before expiry.
      </p>
      <p>
        If you additionally enable the <strong>email reminder</strong> (optional, separate toggle),
        we also store your <strong>sign-in email address</strong> against these deadlines and also
        send an <strong>email</strong> before expiry (via the service of Resend, Inc. — see 2.6).
        This is express, separate consent; you can turn the toggle off at any time, which deletes
        the email address stored on the server and the deadlines tied to it.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (via the push and email toggles).</li>
        <li><strong>Recipient:</strong> for email reminders, Resend, Inc. (delivery) — see 2.6.</li>
        <li><strong>Retention:</strong> until you turn the reminder off, or your subscription becomes invalid; expired subscriptions are deleted automatically. The reminders are tied to <strong>Kinti PRO</strong>: the data stored on the server is renewed at each active-PRO sync, and if PRO expires (no further sync), it <strong>automatically expires within approximately 40 days</strong>.</li>
      </ul>

      <h3>2.20 Consent log (Article 7 GDPR)</h3>
      <p>
        When you accept the terms at sign-in (18+, Terms of Use, Privacy Policy), we also{" "}
        <strong>log</strong> the fact of consent on our server for the purpose of{" "}
        <strong>demonstrability</strong> (Article 7(1) GDPR): the <strong>time</strong> of
        acceptance, the <strong>version</strong> of the terms, the three accepted points, the
        (optional) selected country, and a <strong>random, device-level identifier</strong>{" "}
        (generated by your browser). <strong>We do NOT store IP addresses or personal data for
        this</strong> (the IP is only hashed for the anti-abuse hourly limit, not saved). This
        identifier is not used for tracking.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(c) GDPR — legal obligation (demonstrability of consent), and Article 6(1)(f) — legitimate interest (abuse prevention).</li>
        <li><strong>Retention:</strong> for as long as necessary to demonstrate consent.</li>
      </ul>

      <h3>2.21 B2B Hub (closed business project marketplace)</h3>
      <p>
        In the B2B Hub, Directory PRO businesses can publish project postings. For a posting we
        process the following data: the <strong>name of the posting business</strong>, the text of
        the posting (title, description, target country/city, profession sought), the{" "}
        <strong>contact phone number</strong> provided by the poster, and — server-side only, for
        permission checking — the poster's account identifier. The posting (including the phone
        number) is shown <strong>only to signed-in businesses with an active Directory PRO
        subscription</strong> — it is not publicly accessible and is not indexed by search engines.
        We do not disclose the account identifier to other members.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(b) GDPR — performance of the service (subscription); providing a phone number is the poster's decision.</li>
        <li><strong>Retention:</strong> until the posting is closed/removed; the poster can close their own posting at any time and request deletion at info@kinti.app.</li>
        <li><strong>Recipients:</strong> other Directory PRO members (the content of the posting); processor: Cloudflare (storage).</li>
      </ul>

      <h3>2.22 German CV builder</h3>
      <p>
        The PDF produced by the German CV builder is created{" "}
        <strong>exclusively in your browser</strong> — by default your CV data{" "}
        <strong>does not reach our server</strong>. Saving the profile is{" "}
        <strong>optional</strong> and happens only if, at the end, you{" "}
        <strong>explicitly tick</strong> the "Contact me with job offers" checkbox. In that case we
        save: your name, contact details (email and/or phone), place of residence, profession, and
        the CV data you filled in — <strong>for the purpose of Hungarian job placement (Feedback
        Jobs)</strong>.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — your <strong>consent</strong> (the checkbox). Without it we save nothing.</li>
        <li><strong>Withdrawal / deletion:</strong> consent can be withdrawn at any time; you can request deletion of the saved profile at <a href="mailto:info@kinti.app">info@kinti.app</a>.</li>
        <li><strong>Retention:</strong> until the placement purpose ceases, or until your deletion request.</li>
        <li><strong>Processor:</strong> Cloudflare (D1 database, storage). We do not publish the profile.</li>
      </ul>

      <h3>2.23 Life stories (user stories)</h3>
      <p>
        For a story submitted in the "Life stories" module we process the following data:
      </p>
      <ul>
        <li><strong>Publicly displayed</strong> (based on your decision): the name/nickname provided, the country and city, the text of the story, and the optional cover image.</li>
        <li><strong>Not public:</strong> the optionally provided email address — we use it solely for notification about publication and for contact regarding your story.</li>
        <li><strong>Technical:</strong> the irreversible hash of the submitter's IP address, solely for abuse protection (daily submission limit) — not for identification.</li>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — your consent given by submitting; moderation and abuse protection: Article 6(1)(f) — legitimate interest.</li>
        <li><strong>Retention:</strong> we permanently delete your story at your request at any time (<a href="mailto:info@kinti.app">info@kinti.app</a>); the image is deleted together with the story.</li>
        <li><strong>Moderation:</strong> every story appears only after manual editorial approval; images are additionally screened by automatic image moderation (Cloudflare Workers AI).</li>
      </ul>

      <h3>2.24 Kinti Telegram bot</h3>
      <p>
        When using the @KintiSzaknevsorBot Telegram bot, from the message received via Telegram we{" "}
        <strong>process only the text needed for the search, transiently</strong> — we{" "}
        <strong>do not store</strong> conversation content. For abuse protection (hourly search
        limit) we log a key derived from your Telegram identifier for a short time (at most 48
        hours), and no other data. Results come from public Directory data. The Telegram platform
        (Telegram FZ-LLC) is an independent controller under its own privacy policy.
      </p>

      <h3>2.25 Forwarding of "I'm looking for" listings</h3>
      <p>
        The contact field of your listing submitted to the "I'm looking for" board — as the
        submission form indicates in advance — is <strong>publicly displayed</strong>, and we{" "}
        <strong>forward</strong> the approved listing to businesses in the Directory matching the
        category so that they can respond (this is the purpose of the service — performance of a
        contract under Article 6(1)(b) GDPR). The listing expires automatically after 30 days and is
        removed from the board; you may request earlier deletion at{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a>.
      </p>

      <h3>2.26 Community leaderboard (opt-in)</h3>
      <p>
        You can join the leaderboard voluntarily with a <strong>freely chosen nickname</strong> — we
        do not store a real name, email address, or account identifier with it. Data stored: the
        nickname (publicly displayed), the scores (self-reported from your own device's
        gamification; the "Invitations" score is calculated by the server from the conversion count
        of your invite code — we do not store the code itself on the leaderboard), and a random,
        device-side token that serves as proof for editing your entry.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (via the join button).</li>
        <li><strong>Retention / deletion:</strong> you can leave the leaderboard at any time on the Leaderboard page — your entry (nickname + scores) is deleted immediately and permanently.</li>
      </ul>

      <h3>2.27 Job radar email alerts</h3>
      <p>
        In the Jobs module you can set up a <strong>job radar</strong>: you specify your search
        criteria (e.g. category, region, keyword) and receive notifications about new matching
        listings. Two channels are available: <strong>push notification</strong> (its data
        processing is described in 2.12) and/or <strong>email alert</strong>. For the email channel
        we store: the <strong>email address</strong> you provide, the radar's{" "}
        <strong>search criteria</strong>, and the technical timestamps needed to control sending
        (time of last alert, list of matches awaiting the daily summary) — so that you receive at
        most one immediate alert and one summary per day (spam protection).
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(a) GDPR — consent (by setting up the radar; providing an email address is voluntary).</li>
        <li><strong>Processors:</strong> Cloudflare (storage, see 2.4) and Resend (email delivery, see 2.6).</li>
        <li><strong>Retention / deletion:</strong> until the radar is deleted. <strong>Every alert email has a one-click unsubscribe link at the bottom</strong> — unsubscribing <strong>deletes the radar (together with your email address and criteria) immediately and permanently</strong>. You can also manage and delete your radars on the Jobs page.</li>
      </ul>

      <h3>2.28 Room and flat marketplace</h3>
      <p>
        In the housing marketplace, as a signed-in user you can post a housing listing (room/flat to
        rent, or a wanted listing); the listing becomes public after admin approval. For the listing
        we store: your account <strong>identifier</strong> (Clerk userId — to tie the listing to
        you, to delete your own listing, and for the daily posting limit), the{" "}
        <strong>content</strong> of the listing (type, country, region, locality, price,
        description), and the <strong>contact details you provide for contact</strong> (email or
        phone number). Your contact details are <strong>not public</strong>: they do not appear in
        the listing list and can be retrieved only by signed-in Kinti PRO members, expressly for the
        purpose of contacting you. If your contact detail is an email address, we may send service
        messages there <strong>about the status of your own listing</strong> (e.g. a pre-expiry
        reminder to renew) — we do not use it for marketing purposes.
      </p>
      <ul>
        <li><strong>Legal basis:</strong> Article 6(1)(b) GDPR — publishing the listing as a service requested by you; providing contact details is a condition of posting the listing (without them, interested parties could not reply).</li>
        <li><strong>Processor:</strong> Cloudflare (storage, see 2.4).</li>
        <li><strong>Retention / deletion:</strong> your listing is automatically removed from the list 60 days after posting; using the "Remove" button next to the listing you can <strong>delete it immediately and permanently</strong> at any time. Reported (allegedly unlawful) listings are hidden immediately for the duration of the review (see the DSA reporting point).</li>
      </ul>

      <h2>3. Cookies</h2>
      <p>
        We use exclusively <strong>strictly necessary</strong> (technical and security) cookies —
        under GDPR/ePrivacy these do NOT require consent, but we inform you about them for
        completeness. <strong>We do NOT use marketing, advertising, or tracking cookies</strong>,
        and we do not share data with advertising networks.
      </p>
      <p>
        Technical/security cookies that may be set <strong>even before sign-in</strong> (due to the
        infrastructure in front of the service):
      </p>
      <ul>
        <li><strong>Clerk (authentication):</strong> <code>__client</code>, <code>__client_uat</code> — for the operation of the sign-in system; Clerk sets them already on visit to manage session state, and on actual sign-in a session cookie is added (see 2.1).</li>
        <li><strong>Cloudflare (security / bot protection):</strong> <code>__cf_bm</code>, <code>_cfuvid</code> — set by Cloudflare, which sits in front of our service, for bot and abuse protection; short-lived, solely for security purposes (see 2.4).</li>
      </ul>
      <p>
        These are technical cookies of third parties (Clerk, Inc. and Cloudflare, Inc.), necessary
        solely for the secure operation of the service.
      </p>

      <h3>3.1 Cloudflare Web Analytics (Beacon)</h3>
      <p>
        The platform uses the cookie-free, GDPR-friendly visitor statistics tool{" "}
        <strong>Cloudflare Web Analytics</strong> (CF Beacon), provided the{" "}
        <code>NEXT_PUBLIC_CF_BEACON_TOKEN</code> environment variable is set. This tool{" "}
        <strong>does not use cookies</strong>, does not collect personally identifiable data
        (neither the full IP address nor the User-Agent string), and does not track users across
        pages.
      </p>
      <ul>
        <li><strong>Data processed:</strong> aggregated number of page loads, source country (anonymous), load times</li>
        <li><strong>Legal basis:</strong> Article 6(1)(f) GDPR — legitimate interest (measuring service performance) —{" "}
          <a href="https://developers.cloudflare.com/analytics/web-analytics/" target="_blank" rel="noreferrer">Cloudflare Web Analytics</a>{" "}
          is expressly a PECR/ePrivacy-free solution; consent is not required</li>
        <li><strong>Processor:</strong> Cloudflare, Inc. —{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">privacy policy</a></li>
      </ul>

      <h3>3.2 Swiss data protection provisions (revFADP)</h3>
      <p>
        As the Service specifically serves Hungarians living in Switzerland, and in doing so we also
        process personal data of Swiss-resident users, the revised Swiss Federal Act on Data
        Protection (revFADP / nDSG), which entered into force on 1 September 2023, also applies.
        Data subjects have rights similar to those under the GDPR: access, rectification, erasure,
        restriction, portability, objection. A complaint can be lodged with the Swiss Federal Data
        Protection and Information Commissioner (FDPIC / EDÖB,{" "}
        <a href="https://www.edoeb.admin.ch/" target="_blank" rel="noreferrer">edoeb.admin.ch</a>).
      </p>
      <p>
        <strong>Appointment of a Swiss representative</strong>: under Article 14 revFADP, a
        controller established outside Switzerland must, under certain conditions, appoint a Swiss
        representative. The operator continuously assesses this obligation and will document the
        appointment of a representative should the scale / regularity of processing make it
        necessary. In the meantime, to contact the FDPIC or to exercise a data subject right, write
        to <a href="mailto:info@kinti.app">info@kinti.app</a> — we will forward your request without
        delay.
      </p>

      <h3>3.3 Settings stored in your browser (localStorage)</h3>
      <p>
        We store your convenience and personalisation settings{" "}
        <strong>exclusively in your own browser</strong> (<code>localStorage</code> /{" "}
        <code>sessionStorage</code>) — these are <strong>not cookies</strong>, and they{" "}
        <strong>are never uploaded to the operator's server</strong> in any form, so other users
        cannot access them either. These are:
      </p>
      <ul>
        <li><strong>Selected country</strong> (<code>kinti.country</code>) — which country's Kinti you are viewing (Switzerland, Austria, Germany, the Netherlands). The map and content adjust accordingly.</li>
        <li><strong>Selected region / canton</strong> (<code>kinti.canton</code>) — for local filtering and canton-targeted push.</li>
        <li><strong>View and filter preferences</strong> — e.g. list or map view, the values last entered into the calculators (salary, customs, housing, exchange rate), selected filters.</li>
        <li><strong>Home screen personalisation</strong> (<code>kinti.personalize</code>) — the answers to the "Tailor it to me" wizard (how long you've lived abroad, your main challenge); exclusively on your device, the home screen recommendations adjust accordingly.</li>
        <li><strong>Saved salary offers</strong> — see 2.11.</li>
        <li><strong>Visit counter and status flags</strong> — e.g. how many times you've been here (for timing the subscription prompt), or whether you have already submitted content.</li>
        <li><strong>Content management tokens</strong> — for later editing of your own business/listing/review (see 2.1).</li>
        <li><strong>Downloaded offline guides</strong> — if you download the knowledge base for offline reading, it remains in your browser's cache.</li>
      </ul>
      <p>
        You can <strong>permanently delete</strong> all of this at any time by clearing your
        browser's storage (cookies and site data). The selected country and region are purely UX
        aids: they do not identify you, and there is no account attached.
      </p>

      <h3>3.4 Referral / affiliate links</h3>
      <p>
        On some surfaces of the platform there are external links marked{" "}
        <strong>"Referral"</strong> (e.g. money transfer providers). For these{" "}
        <strong>we use no tracking technology whatsoever</strong>: we do not set a cookie, do not
        measure the click, and do not pass any data about you to the partner. Clicking the link
        takes you to the external provider's site, where their privacy policy applies (the link
        contains our referral code, which carries no data about you).
      </p>

      <h2>4. Transfers of data to third countries</h2>
      <p>
        Clerk, Cloudflare, and Resend are companies registered in the USA that also use servers
        there. EU–USA data transfers take place on the basis of the 2023 EU–US Data Privacy
        Framework (DPF), or the standard contractual clauses (SCC) adopted by the European
        Commission, which ensure a high level of data protection consistent with the GDPR.{" "}
        <span className="web-only-payment">The payment processor{" "}
        <strong>Paddle</strong> is registered in the <strong>United Kingdom</strong>; EU–UK data
        transfer is covered by the European Commission's adequacy decision for the UK.</span>
        <span className="android-only-payment">The provider of{" "}
        <strong>Google Play</strong> payments (Google Ireland Limited) is registered in the{" "}
        <strong>EU (Ireland)</strong>.</span>
      </p>
      <p>
        <strong>Swiss data subjects</strong>: transfers of data from Switzerland to the USA are
        governed by the <strong>Swiss–U.S. Data Privacy Framework</strong> (the supplement
        recognised by the Swiss Federal Council), or the Swiss adaptation of the SCCs — ensuring the
        adequate level of protection required by the revFADP/nDSG.
      </p>

      <h2>5. Your rights</h2>
      <ul>
        <li><strong>Access (Art. 15)</strong> — you may request a copy of your data</li>
        <li><strong>Rectification (Art. 16)</strong> — correction of inaccurate data</li>
        <li><strong>Erasure (Art. 17)</strong> — deletion of your data ("right to be forgotten")</li>
        <li><strong>Restriction (Art. 18)</strong> — temporary suspension of processing</li>
        <li><strong>Portability (Art. 20)</strong> — release of your data in a structured format</li>
        <li><strong>Objection (Art. 21)</strong> — in particular against data processed on the basis of legitimate interest</li>
      </ul>
      <p>
        To exercise any of these rights, write to:{" "}
        <a href="mailto:info@kinti.app">info@kinti.app</a> — we respond{" "}
        <strong>within 30 days</strong> of receipt.
      </p>

      <h3>5.1 How can you request permanent deletion of your data?</h3>
      <p>
        You can initiate the permanent and irreversible deletion of your data stored on the platform
        in the following simple and automated ways:
      </p>
      <ul>
        <li>
          <strong>Deleting reviews</strong>: the confirmation email you receive after submitting
          your review contains a unique <em>review management link</em>, with which you can delete
          your submitted review immediately and permanently at any time.
        </li>
        <li>
          <strong>Deleting a business</strong>: using the unique <em>business management link</em>{" "}
          received after submission (and saved in your browser), you can delete your Directory
          profile immediately and permanently at any time, without needing a password or an account.
        </li>
        <li>
          <strong>Manual deletion request (by email)</strong>: if the automated links above are no
          longer available to you, you can write to us at any time at{" "}
          <a href="mailto:info@kinti.app">info@kinti.app</a> from the email address used at
          submission, and at your request our staff will permanently delete your reviews or business
          profile without delay (within at most 5 working days).
        </li>
        <li>
          <strong>Deleting the sign-in account (Clerk)</strong>: we have summarised the steps for
          deleting your account and the associated data — together with the data types deleted and
          retained — on a separate page: <a href="/fiok-torles">kinti.app/fiok-torles</a>.
        </li>
      </ul>

      <h2>6. Complaints</h2>
      <p>
        If you believe that our data processing infringes your rights, you may lodge a complaint
        with the supervisory authority at the controller's registered seat, the Romanian National
        Supervisory Authority for Personal Data Processing (ANSPDCP):
      </p>
      <ul>
        <li>Address: B-dul G-ral. Gheorghe Magheru nr. 28-30, Sector 1, 010336 Bucharest, Romania</li>
        <li>Email: <a href="mailto:anspdcp@dataprotection.ro">anspdcp@dataprotection.ro</a></li>
        <li>Web: <a href="https://www.dataprotection.ro" target="_blank" rel="noreferrer">dataprotection.ro</a></li>
      </ul>
      <p>
        As a user living in an EU member state, you may also turn to the data protection authority
        of your <strong>habitual residence</strong>.
      </p>

      <h2>7. Handling of data breaches</h2>
      <p>
        Although our system is account-free and practises minimised data processing (we hash IP
        addresses, content is auto-deleted), in the event of a possible data breach (e.g. hacker
        attack, compromise of the database) we act in accordance with Article 33 GDPR: we report the
        incident without undue delay and at the latest{" "}
        <strong>within 72 hours of becoming aware of it, to the competent supervisory authority
        (ANSPDCP)</strong>. If the incident poses a high risk to users' rights, we also inform data
        subjects by public notice and (where available) by email.
      </p>

      <h2>8. Changes</h2>
      <p>
        We update this policy as needed. We indicate changes on this page; the "Last updated" date
        at the top identifies the current version.
      </p>
    </>
  );
}
