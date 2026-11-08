# Eleva Academy Website Improvement Brief

## Instructions for Claude

You are working on the existing Eleva Academy website: https://www.elevaacademy.in/

Your task is to inspect the existing project and improve the website based on this brief.

**Important:** Do not rebuild the project blindly. First inspect the current codebase, framework, routes, components, styling system, integrations, and existing functionality. Preserve the current technology stack unless there is a compelling technical reason to change it. Make changes directly in the existing project.

Before implementation:
1. Identify the framework, package manager, app structure, styling approach, and deployment setup.
2. Review every existing page and reusable component.
3. Identify which requested features already exist and improve them rather than duplicating them.
4. Check existing form, email, WhatsApp, payment, analytics, and booking integrations.
5. Report any missing credentials or external services that require configuration. Never invent API keys, email addresses, phone numbers, prices, testimonials, student counts, qualifications, or success statistics.

The goal is a polished, trustworthy, mobile-friendly education website that converts visitors into genuine enquiries and makes course information easy to understand.

---

## 1. Product and brand positioning

Position Eleva Academy as a professional learning brand helping students, fresh graduates, and working professionals improve communication and become more confident in academic and workplace situations.

Suggested positioning:

**Build Confidence. Master Communication. Elevate Your Career.**

Suggested supporting copy:

"Practical live online training for students and professionals who want to communicate confidently, perform better in interviews, and succeed in the workplace."

Keep the brand name **Eleva Academy** consistent throughout the website. Maintain the existing brand identity where it is effective. Improve visual consistency, typography, spacing, hierarchy, readability, and calls to action.

Do not claim guaranteed jobs, guaranteed scores, or guaranteed career outcomes.

## 2. Homepage improvements

Create a clear, conversion-focused homepage.

### Hero section
- Use a strong headline and concise supporting paragraph.
- Primary CTA: **Book a Free Demo**.
- Secondary CTA: **Explore Programs**.
- Make the main CTA prominent on desktop and mobile.
- Include a relevant, authentic training/learning visual. Prefer real academy or trainer photographs if available in the project assets.
- Do not use generic stock imagery as though it depicts actual Eleva Academy students.

### Audience section
Clearly show who the academy serves:
- College students
- Fresh graduates
- Working professionals

### Programs section
Show the available programs in clear cards:
- Soft Skills & Business Communication
- IELTS & TOEFL Training

Each card should include a short description, key learning outcomes, duration if verified, and a clear link to the course details.

### How it works
Explain the student journey in a few simple steps:
1. Explore a program.
2. Book a free demo or counselling session.
3. Discuss learning goals and batch options.
4. Complete enrolment.
5. Attend classes and track progress.

Only describe processes that the academy can actually support.

### Founder/trainer section
Create a professional founder introduction section for Sneha Durgkar using existing verified biography and credentials. Add a photo or introduction video only if genuine assets are available. Do not invent qualifications or experience.

### Testimonials
Improve the presentation of existing testimonials. Use only genuine testimonials already supplied or approved by the academy. Do not fabricate names, photographs, reviews, or student outcomes. Provide a clear way for the site owner to add approved testimonials later.

### FAQ and final CTA
Include useful FAQs and a final demo/enquiry CTA. Make the contact options easy to find.

## 3. Course detail pages

Create or improve a dedicated detail page for each program.

### Soft Skills & Business Communication
Organise the course information into clear modules. Suggested topics, subject to confirmation by the academy:
- Spoken communication and confidence
- Public speaking and presentations
- Business and workplace communication
- Professional email writing
- Interview preparation
- Teamwork and leadership

### IELTS & TOEFL
Suggested topics, subject to confirmation:
- Listening
- Reading
- Writing
- Speaking
- Mock tests
- Feedback and exam strategies

### Information to display
For each program, provide structured sections for:
- Course overview
- Intended audience
- Learning outcomes
- Syllabus/modules
- Duration
- Batch size
- Class format
- Batch timings
- Course fee
- Learning materials
- Assessment and feedback
- Certificate details, if applicable
- Frequently asked questions
- Book a demo/enquire CTA

**Content accuracy rule:** Do not make up missing course fees, batch timings, duration, batch size, certificate details, or policies. If the information is unavailable, use a clearly editable placeholder in the content/configuration and flag it for the academy owner. Do not publish placeholder text to the public site.

The existing site has described daily group classes and individual sessions at particular times. Verify the actual current timetable before presenting those times as fixed schedules.

## 4. Enquiry and admissions conversion

Improve the enquiry flow so a prospective student can contact the academy without friction.

### Enquiry form
Recommended fields:
- Full name
- Phone number
- Email address
- Program of interest
- Preferred contact method (optional)
- Learning goal or message (optional)
- Consent to be contacted / privacy notice

Requirements:
- Validate required fields and email/phone formats.
- Show clear loading, success, and error states.
- Prevent accidental duplicate submissions where practical.
- Make the form accessible by keyboard and screen reader.
- Do not expose secrets or API keys in frontend code.
- Connect to the existing backend/integration if one exists.
- If no backend exists, implement a clean integration boundary and document what configuration is required. Do not pretend submissions are saved if they are not.

### WhatsApp
- Add a visible WhatsApp contact action if the academy's verified business number is available.
- Use a pre-filled message that can include the selected course.
- Do not invent a phone number.
- If the number is unavailable, make it configurable and document that it must be supplied.

### Demo booking
- Add a clear demo/counselling booking journey.
- Reuse an existing booking integration if available.
- If there is no calendar integration, provide a simple enquiry requesting preferred days/times rather than creating a fake live availability system.
- Do not show unverified availability.

### Admissions status
If a lead-management backend already exists, improve its integration. Otherwise, document a future integration rather than building a non-persistent mock dashboard.

## 5. Trust and consistency

Review the existing website content and fix inconsistencies.

Specifically:
- The public site has referenced both 8+ years of training experience and 10+ years in education. Confirm the correct distinction with the owner and use consistent wording.
- The site has shown different contact email addresses in different places. Confirm the primary public email and use it consistently.
- Check phone number, social links, address, course duration, fees, timings, and policies across all pages.
- Add genuine student reviews and verified outcomes only with permission.
- Add clear privacy, terms, refund/cancellation, and contact information where applicable. Do not invent legal policies; flag missing policy content for owner approval.

## 6. Student learning portal – prepare for a future phase

Do not build a large, insecure or fake student portal just to make the website look feature-rich.

If authentication and backend infrastructure already exist, assess whether the following can be added safely. Otherwise, document a recommended implementation plan separately.

Potential student features:
- My Courses
- Class schedule
- Attendance history
- Learning resources
- Assignments and submissions
- Trainer feedback
- Progress tracking
- Notifications
- Certificates, where applicable

Potential admin features:
- Course and batch management
- Student management
- Enquiry/admission tracking
- Attendance management
- Learning resource uploads
- Assignment and assessment management
- Payment records and reports

Security requirements:
- Authentication and role-based authorisation
- Students must only access their own records and enrolled course content.
- Admin functions must be protected.
- Validate and authorise all sensitive operations on the server.
- Never store payment card details.
- Do not expose private student information in public pages or client-side bundles.

## 7. AI features – future roadmap, not a prerequisite for launch

Design the website so future AI features can be integrated, but do not add non-functional demo controls or pretend AI functionality is live.

Potential future features:
1. **AI speaking practice:** microphone-based practice with feedback on fluency, pronunciation, grammar, and vocabulary.
2. **AI interview simulator:** practice questions and structured feedback.
3. **Course assistant:** answers approved questions about programs, fees, schedules, and enrolment.
4. **Lead categorisation:** help staff prioritise enquiries, with human review.

Before implementing any AI feature, explain its provider, data flow, cost implications, privacy considerations, and required credentials. Do not send student voice recordings or personal information to third parties without appropriate consent and disclosure.

## 8. SEO and content

Improve technical and on-page SEO without keyword stuffing.

- Give every important page a unique, descriptive title and meta description.
- Use one clear H1 per page and a logical heading hierarchy.
- Add descriptive image alt text.
- Use clean, readable URLs.
- Add canonical URLs where appropriate.
- Create and validate sitemap.xml and robots.txt.
- Add appropriate structured data only when the content qualifies and the data is accurate.
- Add social sharing metadata (Open Graph and relevant equivalents).
- Ensure internal links connect course pages, FAQs, and relevant articles.
- Avoid duplicate or thin pages.

Suggested future article topics:
- Communication mistakes fresh graduates can avoid
- How to introduce yourself in a job interview
- Ways to build confidence in spoken English
- Business email writing for beginners
- IELTS vs TOEFL: understanding the differences
- Why soft skills matter in the workplace

Do not generate and publish large volumes of unreviewed AI-written articles. Create a reusable blog structure if the project supports it.

## 9. Design and user experience

Use a modern, professional, warm education-brand aesthetic.

Priorities:
- Responsive layouts for mobile, tablet, and desktop.
- Consistent typography and spacing.
- Clear visual hierarchy.
- Strong contrast and readable text.
- Consistent buttons, cards, forms, and navigation.
- Subtle, purposeful animation only; respect reduced-motion preferences.
- Avoid clutter, excessive gradients, oversized text, and unnecessary decorative effects.
- Keep navigation simple and make the main CTA easy to find.
- Ensure mobile forms and buttons are comfortable to use.
- Use optimised images and avoid layout shifts.

Do not change the brand logo or core brand colours without a clear reason. If the project already contains design tokens, extend and reuse them.

## 10. Performance, accessibility, and quality

Check and improve:
- Image sizing, compression, and lazy loading where appropriate.
- Font loading and unnecessary third-party scripts.
- Avoidable JavaScript and large dependencies.
- Layout stability and loading states.
- Semantic HTML.
- Form labels and helpful validation messages.
- Keyboard navigation and visible focus indicators.
- Colour contrast.
- Alt text.
- Reduced motion support.
- Error handling for network/API failures.

Run the project's available linting, type checking, tests, and production build. Fix issues introduced by your changes. Do not claim tests passed unless you actually ran them.

## 11. Implementation priorities

Work in this order:

### Phase 1 – Public website and conversion
1. Inspect the existing project and document its architecture.
2. Improve homepage messaging and layout.
3. Improve course information and detail pages.
4. Improve founder/trainer and testimonial presentation using verified content.
5. Improve enquiry form and contact/WhatsApp actions using real configuration.
6. Fix inconsistent contact and experience information where confirmed.
7. Improve mobile responsiveness, accessibility, SEO, and performance.

### Phase 2 – Admissions operations
1. Demo/counselling booking integration.
2. Enquiry management and follow-up workflow.
3. Payment integration only after the owner confirms provider and policies.
4. Confirmation emails/notifications using configured services.

### Phase 3 – Learning portal
1. Authentication and roles.
2. Student dashboard.
3. Course and batch management.
4. Attendance, resources, assignments, and feedback.

### Phase 4 – AI capabilities
1. AI speaking practice.
2. AI interview practice.
3. Approved course-information assistant.
4. AI-supported lead categorisation.

Complete Phase 1 first unless the project already has some of these capabilities.

## 12. Acceptance checklist

Before finishing, verify:

- [ ] Existing routes and working features have not been accidentally removed.
- [ ] Homepage clearly explains what Eleva Academy offers and who it serves.
- [ ] Primary CTA is visible and works.
- [ ] Course pages explain the programs without invented facts.
- [ ] All public contact details are consistent and verified.
- [ ] Enquiry form validates input and gives honest success/error feedback.
- [ ] WhatsApp action uses the verified academy number, if configured.
- [ ] Navigation and layouts work on mobile, tablet, and desktop.
- [ ] Images are optimised and have appropriate alt text.
- [ ] Accessibility basics have been checked.
- [ ] SEO metadata and sitemap/robots configuration have been checked.
- [ ] No fake testimonials, statistics, pricing, availability, or AI features have been added.
- [ ] No secrets or API keys are exposed in frontend code.
- [ ] Lint, type checks, tests, and production build have been run where available.

## 13. Final handover from Claude

When implementation is complete, provide:
1. A concise summary of changes made.
2. A list of files/components created or modified.
3. Features that are fully functional versus UI-only.
4. Any information the academy owner must confirm (fees, timings, contact email, WhatsApp number, experience wording, testimonials, policies).
5. Any API keys, environment variables, integrations, or external accounts required.
6. Tests and build commands executed, with actual results.
7. Any known limitations or recommended next steps.

**Final instruction:** Prioritise a high-quality, trustworthy, conversion-focused public website. Build only functionality that works end-to-end. Do not fabricate content or silently replace existing working functionality.
