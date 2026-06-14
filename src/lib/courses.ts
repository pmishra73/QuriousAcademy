export type Course = {
  id: string;
  title: string;
  category: "programming" | "maths" | "ai" | "science" | "technology";
  tagline: string;
  description: string;
  instructor: string;
  instructorBio: string;
  price: number;
  duration: string;
  schedule: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  spots: number;
  enrolled: number;
  startDate: string;
  syllabus: { week: string; topics: string[] }[];
  outcomes: string[];
  badge: string;
};

export const courses: Course[] = [
  {
    id: "python-fundamentals",
    title: "Python Fundamentals",
    category: "programming",
    tagline: "From zero to fluent in Python",
    description:
      "A comprehensive live course covering Python from absolute basics to building real projects. Ideal for students, professionals, and curious minds.",
    instructor: "Arjun Mehta",
    instructorBio:
      "Software engineer with 8 years of experience at top tech companies. Passionate about making programming accessible to everyone.",
    price: 2999,
    duration: "8 weeks",
    schedule: "Sat & Sun, 10 AM – 12 PM IST",
    level: "Beginner",
    spots: 20,
    enrolled: 14,
    startDate: "July 5, 2025",
    badge: "🐍",
    outcomes: [
      "Write Python scripts confidently",
      "Understand data structures & algorithms",
      "Build 3 real-world projects",
      "Work with APIs and files",
    ],
    syllabus: [
      { week: "Week 1–2", topics: ["Setup & basics", "Variables, data types", "Control flow"] },
      { week: "Week 3–4", topics: ["Functions", "Lists, dicts, sets", "File I/O"] },
      { week: "Week 5–6", topics: ["OOP concepts", "Error handling", "Modules"] },
      { week: "Week 7–8", topics: ["APIs & JSON", "Mini projects", "Final project"] },
    ],
  },
  {
    id: "calculus-for-engineers",
    title: "Calculus for Engineers",
    category: "maths",
    tagline: "Build the mathematical foundation you need",
    description:
      "Rigorous yet accessible calculus — limits, derivatives, integrals, and their applications in physics and engineering contexts.",
    instructor: "Dr. Priya Nair",
    instructorBio:
      "PhD in Applied Mathematics from IISc. Five years of teaching experience at university level with a focus on making abstract concepts concrete.",
    price: 2499,
    duration: "10 weeks",
    schedule: "Mon, Wed, Fri — 7 PM – 8:30 PM IST",
    level: "Intermediate",
    spots: 18,
    enrolled: 11,
    startDate: "July 7, 2025",
    badge: "∫",
    outcomes: [
      "Master limits and continuity",
      "Differentiate complex functions",
      "Solve definite and indefinite integrals",
      "Apply calculus to real engineering problems",
    ],
    syllabus: [
      { week: "Week 1–2", topics: ["Limits & continuity", "Epsilon-delta definition"] },
      { week: "Week 3–5", topics: ["Derivatives", "Chain rule, product rule", "Implicit differentiation"] },
      { week: "Week 6–8", topics: ["Integration", "Substitution", "Integration by parts"] },
      { week: "Week 9–10", topics: ["Applications", "Related rates", "Optimization problems"] },
    ],
  },
  {
    id: "intro-to-ai-ml",
    title: "Introduction to AI & ML",
    category: "ai",
    tagline: "Understand the technology shaping the world",
    description:
      "From perceptrons to large language models — a practical, code-first course on machine learning and modern AI systems.",
    instructor: "Siddharth Rao",
    instructorBio:
      "ML Engineer at a leading AI research lab. Previously built models deployed to millions of users. Guest lecturer at IIT Bombay.",
    price: 3999,
    duration: "12 weeks",
    schedule: "Sat, 2 PM – 5 PM IST",
    level: "Intermediate",
    spots: 15,
    enrolled: 9,
    startDate: "July 12, 2025",
    badge: "🤖",
    outcomes: [
      "Understand ML fundamentals end-to-end",
      "Train classification and regression models",
      "Work with neural networks and PyTorch",
      "Build and deploy a capstone AI project",
    ],
    syllabus: [
      { week: "Week 1–3", topics: ["What is ML", "Data & features", "Linear models"] },
      { week: "Week 4–6", topics: ["Decision trees", "Ensemble methods", "Model evaluation"] },
      { week: "Week 7–9", topics: ["Neural networks", "Backpropagation", "PyTorch basics"] },
      { week: "Week 10–12", topics: ["CNNs & transformers overview", "Deployment", "Capstone project"] },
    ],
  },
  {
    id: "physics-mechanics",
    title: "Classical Mechanics",
    category: "science",
    tagline: "Newton to Lagrangian — mechanics demystified",
    description:
      "A deep but accessible course on classical mechanics covering Newtonian physics, energy, momentum, and rotational dynamics.",
    instructor: "Prof. Kavita Sharma",
    instructorBio:
      "Former IIT professor with 12 years of teaching experience. Known for intuition-building approaches that make physics click.",
    price: 1999,
    duration: "8 weeks",
    schedule: "Tue & Thu, 6 PM – 7:30 PM IST",
    level: "Beginner",
    spots: 25,
    enrolled: 8,
    startDate: "July 8, 2025",
    badge: "⚛",
    outcomes: [
      "Solve Newtonian mechanics problems confidently",
      "Understand energy and momentum conservation",
      "Tackle rotational dynamics and torque",
      "Build intuition for physical systems",
    ],
    syllabus: [
      { week: "Week 1–2", topics: ["Kinematics", "Newton's laws", "Problem-solving frameworks"] },
      { week: "Week 3–4", topics: ["Work, energy, power", "Conservation laws"] },
      { week: "Week 5–6", topics: ["Momentum", "Collisions", "Centre of mass"] },
      { week: "Week 7–8", topics: ["Rotational motion", "Torque", "Angular momentum"] },
    ],
  },
  {
    id: "web-development",
    title: "Full-Stack Web Development",
    category: "technology",
    tagline: "Build and ship modern web apps",
    description:
      "A practical course covering the entire web stack — HTML/CSS, JavaScript, React, Node.js, databases, and deployment.",
    instructor: "Riya Kapoor",
    instructorBio:
      "Full-stack developer with 6 years at startups and scale-ups. Built products used by 100k+ users.",
    price: 4499,
    duration: "16 weeks",
    schedule: "Sat & Sun, 4 PM – 6 PM IST",
    level: "Beginner",
    spots: 20,
    enrolled: 17,
    startDate: "July 5, 2025",
    badge: "💻",
    outcomes: [
      "Build responsive, accessible UIs",
      "Write JavaScript & React applications",
      "Build REST APIs with Node.js",
      "Deploy full-stack apps to production",
    ],
    syllabus: [
      { week: "Week 1–4", topics: ["HTML", "CSS", "Flexbox & Grid", "Responsive design"] },
      { week: "Week 5–8", topics: ["JavaScript fundamentals", "DOM manipulation", "Async/Await"] },
      { week: "Week 9–12", topics: ["React", "State management", "React Router"] },
      { week: "Week 13–16", topics: ["Node.js", "Express", "MongoDB", "Deployment"] },
    ],
  },
  {
    id: "discrete-maths",
    title: "Discrete Mathematics",
    category: "maths",
    tagline: "The mathematics CS students actually need",
    description:
      "Sets, logic, proofs, graph theory, combinatorics — the mathematical toolkit for computer science and competitive programming.",
    instructor: "Dr. Priya Nair",
    instructorBio:
      "PhD in Applied Mathematics from IISc. Expert in combinatorics and graph theory.",
    price: 2299,
    duration: "8 weeks",
    schedule: "Sat, 11 AM – 1 PM IST",
    level: "Intermediate",
    spots: 20,
    enrolled: 6,
    startDate: "July 12, 2025",
    badge: "◇",
    outcomes: [
      "Write rigorous mathematical proofs",
      "Master combinatorics and counting",
      "Understand graph theory fundamentals",
      "Apply logic to algorithm reasoning",
    ],
    syllabus: [
      { week: "Week 1–2", topics: ["Propositional logic", "Sets and relations"] },
      { week: "Week 3–4", topics: ["Proofs", "Induction", "Number theory"] },
      { week: "Week 5–6", topics: ["Combinatorics", "Permutations & combinations"] },
      { week: "Week 7–8", topics: ["Graph theory", "Trees", "Algorithms on graphs"] },
    ],
  },
];

export const getCourse = (id: string) => courses.find((c) => c.id === id);

export const categoryLabels: Record<string, string> = {
  all: "All",
  programming: "Programming",
  maths: "Mathematics",
  ai: "AI & ML",
  science: "Science",
  technology: "Technology",
};
