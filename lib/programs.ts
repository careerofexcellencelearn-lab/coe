// Program (service) data shared by the home page, program detail pages and the sitemap.
// Live programs come from the database (admin-editable); the fallbacks below are only
// used if the database is unreachable, so pages never break.

export type Service = {
  id: string
  title: string
  description: string
  objectives: string[]
  duration: string
  price: number
  offerPrice: number | null
  offerLabel: string
  classStart: string
  classEnd: string
  oneOnOneStart: string
  oneOnOneEnd: string
  certificateProvided: boolean
}

export const fallbackServices: Service[] = [
  {
    id: "soft-skills-business-communication",
    title: "Soft Skills & Business Communication",
    description:
      "One complete program covering the interpersonal and professional communication skills every career is built on — taught through live practice sessions.",
    objectives: [
      "Communicate clearly and confidently in any situation",
      "Write professional emails, reports and messages",
      "Speak up in meetings and deliver impactful presentations",
      "Master teamwork, time management and workplace etiquette",
    ],
    duration: "8 Weeks · Live Online",
    price: 0,
    offerPrice: null,
    offerLabel: "",
    classStart: "10:00",
    classEnd: "18:00",
    oneOnOneStart: "19:00",
    oneOnOneEnd: "20:00",
    certificateProvided: false,
  },
  {
    id: "ielts-toefl",
    title: "IELTS & TOEFL Training",
    description:
      "Complete preparation for both IELTS and TOEFL with score-boosting strategies, regular mock tests and personal feedback on every module.",
    objectives: [
      "Master Listening, Reading, Writing & Speaking modules",
      "Learn score-boosting strategies and time management",
      "Practise with regular mock tests and personal feedback",
      "Build the vocabulary and grammar for IELTS Band 7+ / TOEFL 100+",
    ],
    duration: "10 Weeks · Live Online",
    price: 0,
    offerPrice: null,
    offerLabel: "",
    classStart: "10:00",
    classEnd: "18:00",
    oneOnOneStart: "19:00",
    oneOnOneEnd: "20:00",
    certificateProvided: true,
  },
]

/** URL slug for a program, derived from its title (e.g. "ielts-toefl-training") */
export function programSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function programHref(service: Pick<Service, "title">): string {
  return `/programs/${programSlug(service.title)}`
}

export type ProgramKind = "exam" | "communication" | "general"

export function programKind(title: string): ProgramKind {
  const t = title.toLowerCase()
  if (t.includes("ielts") || t.includes("toefl")) return "exam"
  if (t.includes("soft") || t.includes("communication")) return "communication"
  return "general"
}

/** Who-it's-for, topics and assessment copy for each kind of program. */
export const programDetails: Record<
  ProgramKind,
  { audience: string[]; topics: { title: string; description: string }[]; assessment: string }
> = {
  communication: {
    audience: [
      "College students preparing for placements and internships",
      "Fresh graduates getting ready for interviews and their first job",
      "Working professionals who want to communicate with more confidence",
    ],
    topics: [
      { title: "Spoken communication & confidence", description: "Speak clearly, structure your thoughts and overcome hesitation." },
      { title: "Public speaking & presentations", description: "Plan, deliver and handle questions in meetings and presentations." },
      { title: "Business & workplace communication", description: "Communicate professionally with managers, teams and clients." },
      { title: "Professional email writing", description: "Write clear, polite and effective emails, reports and messages." },
      { title: "Interview preparation", description: "Introduce yourself well and answer common interview questions." },
      { title: "Teamwork & leadership", description: "Collaboration, time management and workplace etiquette." },
    ],
    assessment:
      "Every live session includes practice activities with feedback, and your personal one-on-one session is used to review your progress individually.",
  },
  exam: {
    audience: [
      "Students planning to study abroad",
      "Professionals applying for work or migration abroad",
      "Anyone who needs an IELTS or TOEFL score and wants structured preparation",
    ],
    topics: [
      { title: "Listening", description: "Question types, note-taking and accuracy under time pressure." },
      { title: "Reading", description: "Skimming, scanning and handling every reading question type." },
      { title: "Writing", description: "Task structure, coherence, vocabulary and grammar for higher bands." },
      { title: "Speaking", description: "Fluency, pronunciation and answering confidently on any topic." },
      { title: "Mock tests", description: "Regular practice tests in exam conditions." },
      { title: "Feedback & exam strategies", description: "Personal feedback on each module plus time-management strategies." },
    ],
    assessment:
      "Regular mock tests track your progress, and you receive personal feedback on each module in your one-on-one sessions.",
  },
  general: {
    audience: ["College students", "Fresh graduates", "Working professionals"],
    topics: [],
    assessment: "Practice activities with personal feedback in every live session and your one-on-one session.",
  },
}

/** Server-safe mapping of fetched services to the public shape used on pages */
export function findProgramBySlug(services: Service[], slug: string): Service | undefined {
  return services.find((s) => programSlug(s.title) === slug)
}
