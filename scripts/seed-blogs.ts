import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { putBlogBody } from "../src/lib/blog-r2";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }) });

const AUTHOR = "Prasant Mishra";
const AUTHOR_ID = process.env.SEED_AUTHOR_ID ?? "";

const blogs = [
  {
    slug: "ai-explained-simply",
    title: "AI Explained Simply: What It Is and Why It Matters",
    excerpt: "Artificial intelligence sounds intimidating. It doesn't have to be. Here's a plain-English breakdown of what AI actually is, how it works, and why it's reshaping every industry.",
    category: "AI & ML",
    published: true,
    body: `# AI Explained Simply: What It Is and Why It Matters

You've heard it everywhere — AI is changing everything. But what actually *is* artificial intelligence? And why should you care?

Let's break it down without the jargon.

## What AI Really Means

At its core, **artificial intelligence is software that learns from examples instead of following explicit rules**.

Traditional software is a set of instructions: *if X happens, do Y*. A calculator doesn't learn — it just executes rules you wrote. AI is different. Instead of writing rules, you feed it thousands (or millions) of examples, and it figures out the patterns on its own.

That's it. Everything else — machine learning, neural networks, large language models — is a variation of this idea.

## A Simple Example

Imagine you want software that can tell a cat apart from a dog in a photo.

The old way: write rules. *"If the ears are pointed and the nose is small, it's a cat."* This breaks instantly with unusual angles, lighting, or breeds.

The AI way: show the model 100,000 photos labelled "cat" or "dog". The model finds patterns you'd never think to write down — subtle texture differences, proportions, shapes. After training, it gets it right 98% of the time.

That's machine learning in one paragraph.

## The Three Waves of AI

**Wave 1 — Rule-based systems (1950s–1990s):** Experts wrote rules by hand. Chess engines, early medical diagnosis tools. Fast but brittle.

**Wave 2 — Statistical learning (1990s–2010s):** Let the data speak. Spam filters, recommendation engines, fraud detection. Powerful but needed hand-crafted features.

**Wave 3 — Deep learning (2010s–now):** Neural networks with millions of parameters that learn features automatically. This is what powers GPT, image generators, voice assistants, and self-driving cars.

## Why It Matters Right Now

The reason AI feels like a big deal *right now* is a convergence of three things that happened simultaneously:

1. **Data** — the internet generated enough labelled data to train useful models
2. **Compute** — GPUs became powerful enough to train large models affordably
3. **Algorithms** — the transformer architecture (2017) unlocked a new level of capability

The result: tools like ChatGPT, Gemini, and Copilot that can write, reason, code, and create — at a level that wasn't possible five years ago.

## What AI Is Still Bad At

AI gets a lot right, but it's important to understand its limits:

- **It doesn't "understand" — it predicts.** A language model doesn't know what it's saying. It predicts the most statistically likely next word. This is why it confidently says wrong things (hallucinations).
- **It needs data.** AI learns from examples. No data, no intelligence.
- **It reflects its training.** Biased data produces biased models.
- **It can't reason from first principles.** It pattern-matches. Novel problems that require genuine reasoning are still hard for AI.

## How to Think About It Going Forward

The most useful mental model: **AI is a powerful autocomplete for everything**.

It autocompletes text (ChatGPT), code (Copilot), images (Midjourney), and decisions (recommendation engines). The autocomplete is surprisingly good — good enough to be genuinely useful in almost every field.

Your job isn't to compete with AI at pattern-matching. It's to provide the context, judgement, and direction that autocomplete can't supply on its own.

The people who understand AI well enough to direct it effectively are the ones who will benefit most from it. That starts with understanding what it actually is — which you now do.
`,
  },
  {
    slug: "dsa-beginners",
    title: "Data Structures & Algorithms: A Beginner's Honest Guide",
    excerpt: "Every great programmer understands data structures and algorithms. Here's how to start — without the overwhelm, without the gatekeeping.",
    category: "Data Structures",
    published: true,
    body: `# Data Structures & Algorithms: A Beginner's Honest Guide

If you've tried to learn DSA and felt like you were drowning — you're not alone. Most resources either over-simplify or throw you into a deep-end of theory. This guide is neither.

Here's what DSA actually is, why it matters, and how to build real competence.

## Why DSA Feels Hard (And Why That's Normal)

DSA is essentially **mathematics applied to programming**. You're not just writing code — you're reasoning about *how efficient* your code is. That's a different skill than most beginners have developed.

The good news: it's learnable. The bad news: it takes time and deliberate practice. Anyone telling you otherwise is selling something.

## What Are Data Structures?

A **data structure** is a way of organising data so it can be used efficiently.

Think of it like storage systems in a kitchen:
- A **rack** (array) — fixed slots, you know exactly where everything is
- A **stack of plates** (stack) — you only access the top
- A **queue at a coffee shop** (queue) — first in, first out
- A **filing cabinet** (hash map) — find anything instantly by its label
- A **family tree** (tree) — hierarchical relationships

The data structure you choose determines how fast your program runs.

## The Core Data Structures You Must Know

### Arrays
The simplest structure — a list of elements in order. Fast to access by index (O(1)), slow to insert in the middle (O(n)).

### Linked Lists
Each element points to the next. Fast to insert/delete (O(1) at known position), slow to access by index (O(n)). Great for understanding pointers.

### Hash Maps
The workhorse of interviews. Store key-value pairs, with O(1) average access. Almost every "optimise this" problem uses a hash map.

### Stacks and Queues
Stack = LIFO (last in, first out). Queue = FIFO (first in, first out). Appear everywhere — undo operations, browser history, scheduling.

### Trees and Graphs
Trees model hierarchical data (file systems, DOM, organisation charts). Graphs model relationships (social networks, maps, dependencies). Binary Search Trees, Heaps, and Tries are key variants.

## What Are Algorithms?

If data structures are how you store things, **algorithms are how you process them**.

The most important concept to understand is **Big O notation** — a way of describing how your algorithm's speed scales with input size.

- **O(1)** — constant time. Doesn't matter how big the input is. Hash map lookup.
- **O(log n)** — logarithmic. Input doubles, work increases by 1 step. Binary search.
- **O(n)** — linear. Work grows proportionally with input. Loop through an array.
- **O(n²)** — quadratic. Nested loops. Gets slow fast.

## The Algorithms You Actually Need

**Sorting:** Know how merge sort and quick sort work and why they're O(n log n). Understand when to use each.

**Searching:** Binary search is essential. Understand why it requires a sorted structure.

**Graph traversal:** BFS (breadth-first search) and DFS (depth-first search). These unlock trees, graphs, and most "find a path" problems.

**Dynamic Programming:** The hardest category. Start with recursion + memoisation before tackling bottom-up DP.

**Two pointers and sliding window:** Pattern-based techniques that solve many array/string problems in O(n).

## A Practical Learning Path

1. **Week 1–2:** Arrays, strings, and basic complexity analysis. Solve 20–30 easy problems on LeetCode.
2. **Week 3–4:** Hash maps, stacks, queues. Pattern: "how would a hash map speed this up?"
3. **Week 5–6:** Linked lists, trees, BFS/DFS.
4. **Week 7–8:** Sorting algorithms from scratch. Binary search variants.
5. **Week 9–12:** Graphs and dynamic programming. These need sustained practice.

Consistency beats intensity. 45 minutes daily beats 8-hour weekend marathons.

## The Mindset Shift That Changes Everything

Stop trying to *memorise solutions*. Start trying to *recognise patterns*.

Most DSA problems are one of about 14 core patterns dressed in different clothes. Once you've seen the pattern enough times, you'll spot it even in new problems. That's the skill interviewers are testing — not your ability to memorise code.

DSA is hard, but it's a finite problem. Every concept in this guide can be understood with enough practice. Start with arrays. Stay consistent. The rest follows.
`,
  },
  {
    slug: "learn-python-2025",
    title: "How to Learn Python in 2025 (The Right Way)",
    excerpt: "Python is the most beginner-friendly programming language in the world. Here's a clear, opinionated roadmap for learning it effectively — without wasting months on the wrong things.",
    category: "Programming",
    published: true,
    body: `# How to Learn Python in 2025 (The Right Way)

Python has been the world's most popular programming language for several years running. It's used in web development, data science, machine learning, automation, scripting, and more. If you're going to learn one language — Python is the right bet.

But popularity also means there's a flood of bad advice about how to learn it. Here's the opinionated, no-nonsense guide.

## Why Python Is the Best First Language

- **Readable syntax.** Python reads almost like English. You spend less time fighting the language and more time thinking about the problem.
- **No boilerplate.** A Python "Hello World" is one line: \`print("Hello, World!")\`. Compare that to Java's 7-line class structure.
- **Massive ecosystem.** Whatever you want to build, there's a Python library for it.
- **Industry demand.** Python developers are hired across software engineering, data science, DevOps, and research.

## What NOT to Do

Before the roadmap, avoid these common mistakes:

**Don't tutorial-hop.** Watching 40 hours of YouTube videos without writing code teaches you nothing. Reading about swimming doesn't make you a swimmer.

**Don't try to learn everything at once.** Python has dozens of frameworks and libraries. You don't need to know them all. Pick a direction and go deep.

**Don't skip the fundamentals.** Jumping to Django or pandas without understanding functions, loops, and data structures creates fragile knowledge that collapses under pressure.

## The Roadmap

### Stage 1: The Fundamentals (4–6 weeks)

Learn these, in order:

1. **Variables and data types** — strings, integers, floats, booleans
2. **Control flow** — if/elif/else, for loops, while loops
3. **Functions** — defining, calling, parameters, return values
4. **Lists, tuples, dictionaries, sets** — Python's core data structures
5. **File I/O** — reading and writing files
6. **Error handling** — try/except
7. **Modules and imports** — using Python's standard library

At this stage, write code every day. Small exercises beat big projects. A good resource: *Automate the Boring Stuff with Python* (free online).

### Stage 2: Object-Oriented Python (2–3 weeks)

Learn classes, objects, inheritance, and dunder methods. You don't need to master every OOP concept — just understand enough to read and write class-based code, because most Python libraries use it.

### Stage 3: Pick Your Direction

Python is too broad to learn "generally" beyond a point. After Stage 2, choose your track:

**Web Development**
- Learn Flask first (simpler), then Django (more complete)
- Understand HTTP, REST APIs, and databases (SQLite/Postgres)

**Data Science / ML**
- NumPy → pandas → matplotlib → scikit-learn
- Work through a real dataset, not toy examples

**Automation / Scripting**
- Learn \`os\`, \`pathlib\`, \`subprocess\`, \`requests\`
- Build tools that solve your own problems

**Backend / APIs**
- FastAPI is the modern choice — fast, async, with automatic docs

### Stage 4: Build Real Projects

This is where learning becomes skill. Build things you actually want to use.

Ideas that work well for a portfolio:
- A web scraper that extracts data from a site you care about
- A CLI tool that automates something you do repeatedly
- A REST API with authentication and a database
- A data analysis notebook on a real dataset (Kaggle is a good source)

Projects force you to solve problems you didn't anticipate. That's where real learning happens.

## The Python Mental Model

One thing that confuses beginners: **Python passes objects by reference, not by value** — with a twist. Mutable objects (lists, dicts) can be modified inside functions. Immutable objects (strings, integers) cannot. Understanding this early saves hours of debugging later.

Also learn to love the REPL. The interactive Python shell is one of the language's greatest strengths — use it to experiment, test ideas, and understand behaviour before writing a script.

## How Long Will It Take?

Honest answer:

- **Basic scripts you're proud of:** 2–3 months of consistent practice
- **Employment-ready:** 6–12 months, including projects and DSA practice
- **Genuinely good:** 2–3 years of building real things

The ceiling is high. But the floor is also very accessible. Python is one of the few languages where you can build something genuinely useful within your first month.

Start today. The best time to begin was last year. The second best time is now.
`,
  },
  {
    slug: "physics-intuition",
    title: "Building Physics Intuition: How to Think Like a Physicist",
    excerpt: "Memorising formulas won't make you good at physics. Building intuition will. Here's how to develop a genuine feel for the physical world — and why it changes how you see everything.",
    category: "Science",
    published: true,
    body: `# Building Physics Intuition: How to Think Like a Physicist

Most students learn physics by memorising formulas and plugging in numbers. They can solve textbook problems but feel completely lost when asked, "What's actually happening here?"

That gap — between formula-fluency and genuine understanding — is what we call *intuition*. And it's the difference between a student who passes physics and an engineer who designs real things.

Here's how to build it.

## Why Formulas Are Not Physics

A formula is a compressed summary of a physical insight. F = ma doesn't *define* physics — it captures a relationship that took centuries of observation, argument, and experimentation to establish.

When you memorise F = ma without understanding it, you have a tool you don't know how to use. You can only apply it in situations that look exactly like the examples you've seen.

Intuition means understanding *why* F = ma is true, what it predicts, where it breaks down, and what it feels like in the real world. With that, you can apply it in situations you've never seen before.

## Start With Extreme Cases

The single most powerful technique in a physicist's toolkit: **check the extremes**.

Take any formula or concept and ask: *what happens when this variable is very large? Very small? Zero? Infinite?*

For example — gravitational force between two objects: F = Gm₁m₂/r²

- What happens as r → ∞? Force → 0. Objects infinitely far apart don't affect each other. ✓
- What happens as r → 0? Force → ∞. Objects can't occupy the same space. (This tells you the formula breaks down — which leads to interesting physics.)
- What if one mass is zero? Force = 0. You can't pull on something that doesn't exist. ✓

Each of these checks either confirms the formula makes sense or reveals something worth thinking about. This habit — checking extremes — is how physicists catch errors and build understanding simultaneously.

## Dimensional Analysis: Physics' Built-in Error Checker

Every physical quantity has **dimensions** — combinations of mass (M), length (L), and time (T).

- Speed: L/T (metres per second)
- Force: ML/T² (kilogram-metres per second squared, i.e., Newtons)
- Energy: ML²/T²

If you're ever unsure whether a formula is right, check that the dimensions on both sides match. If they don't, something is wrong. No exceptions.

This is so powerful that physicists often derive approximate formulas purely from dimensional analysis — without solving any equations at all.

## Build Mental Models From Everyday Life

Physics intuition comes from connecting abstract concepts to things you've already experienced.

**Inertia:** You feel it every time a car accelerates and you're pushed back in your seat. The more massive the car, the more you feel it. That's F = ma.

**Conservation of energy:** A pendulum swings back to the same height it was released from (ignoring air resistance). All the potential energy at the top converts to kinetic energy at the bottom and back — no energy appears or disappears.

**Pressure:** Why does a nail go into wood easier than a flat board? Same force, smaller area = more pressure. P = F/A isn't just a formula, it's why knives are sharp.

Every time you see something physical happen in your day — a car stopping, a ball bouncing, water flowing — ask: *what's the physics here?* That habit, sustained over months, builds the strongest kind of intuition.

## The Estimation Habit (Fermi Problems)

Physicists love estimation. Not because precision doesn't matter, but because a good estimate tells you whether you're in the right ballpark before you do any detailed calculation.

Enrico Fermi was famous for this. Classic Fermi problems:
- How many piano tuners are in Chicago?
- How many golf balls fit in this room?
- How high would a stack of a million dollars in $100 bills reach?

These problems train you to break complex questions into simpler estimates, reason from what you know, and get comfortable with approximation. In real physics and engineering, this skill is more valuable than many precise calculations.

## Visualise Before You Calculate

Before writing any equation, draw a diagram. Mark forces, directions, and reference frames. Physicists rarely start with equations — they start with pictures.

This isn't just a study technique. Visualisation is how physicists *think*. Einstein famously said he thought in images and feelings, and only later translated those insights into mathematics.

The diagram makes the physics visible. The equation just quantifies what the picture already showed you.

## The Payoff

Physics intuition isn't just useful for physics problems. It trains a way of thinking:

- Break complex systems into components
- Check your answers at the extremes
- Reason from first principles when you don't have a formula
- Estimate before you calculate

These habits transfer everywhere — engineering, programming, medicine, economics. Physics is one of the best trainers of rigorous thinking precisely because nature doesn't let you get away with sloppy reasoning.

The goal isn't to memorise more formulas. It's to understand the world well enough that the formulas feel *obvious* once you see them.
`,
  },
  {
    slug: "web-dev-roadmap",
    title: "The Web Developer Roadmap for 2025",
    excerpt: "With hundreds of frameworks and tools competing for your attention, knowing where to start in web development is genuinely hard. This roadmap cuts through the noise and gives you a clear, honest path.",
    category: "Technology",
    published: true,
    body: `# The Web Developer Roadmap for 2025

The web development landscape in 2025 is both exciting and overwhelming. There are more tools, frameworks, and learning paths than ever — and everyone on the internet has a hot take on the "right" stack.

This roadmap is opinionated, practical, and focused on getting you employed or shipping products — not on covering every possible option.

## The Big Picture: What Web Development Actually Is

Web development splits into three broad areas:

**Frontend** — what users see and interact with. HTML, CSS, JavaScript, React.

**Backend** — the server, database, and business logic. Node.js, Python, databases, APIs.

**Full-stack** — both. Most jobs and products require both.

The roadmap below is roughly full-stack, because that's what the market demands and what gives you the most options.

## Stage 1: The Non-Negotiable Foundation

Before any framework, before React, before Node — you must understand the web's building blocks.

### HTML (1–2 weeks)
Learn semantic HTML. Understand the document structure, common tags, forms, and accessibility basics. HTML is not where beginners struggle — but skipping it creates gaps you'll feel later.

### CSS (3–4 weeks)
CSS has a reputation for being frustrating. That reputation is earned. Learn:
- The box model
- Flexbox (essential for layouts)
- Grid (essential for complex layouts)
- Responsive design and media queries
- Custom properties (CSS variables)

Don't try to memorise CSS. Learn where to look things up, and build things. Clone a real webpage — a landing page, a blog layout — and you'll learn more in a day than a week of reading.

### JavaScript (6–8 weeks)
This is where you'll spend the most time, and rightly so. Learn:
- Variables, types, functions, loops
- The DOM — selecting elements, handling events
- Fetch API and async/await
- ES6+ features: arrow functions, destructuring, spread, modules
- How the event loop works (you don't need to master it, but understand the basics)

JavaScript is the only language that runs natively in browsers. Everything else — TypeScript, JSX, Webpack — compiles down to it. Understand JavaScript before layering anything on top.

## Stage 2: React (6–8 weeks)

React is not the only frontend framework, but it is the most in-demand. It's worth learning first.

Core React concepts:
- Components and JSX
- Props and state
- useEffect, useState, useContext
- Lifting state up
- React Router for navigation

Build 3–4 projects with plain React before touching Next.js. A to-do app is fine for learning, but interview the real world: a movie search app using a public API, a personal portfolio, a simple e-commerce UI.

### Then: Next.js
Next.js is React with server-side rendering, file-based routing, and API routes built in. It's the dominant production framework for React apps in 2025. Once you're comfortable with React, Next.js feels natural.

## Stage 3: Backend Basics (4–6 weeks)

### Node.js and Express
Learn how HTTP works — requests, responses, status codes, headers. Build a simple REST API with Express: routes, middleware, request body parsing.

### Databases
Learn SQL. Specifically, learn:
- SELECT, INSERT, UPDATE, DELETE
- JOINs
- Indexing basics

Use PostgreSQL. It's the industry standard relational database and what most serious projects use. Tools like Prisma make working with it in JavaScript/TypeScript much more pleasant.

### Authentication
Understand sessions vs. tokens. Learn how JWTs work conceptually. Use an auth library (NextAuth, Clerk, or Auth.js) in a project before trying to implement auth from scratch.

## Stage 4: The Modern Toolchain

By now you're building real things. Understand these tools:

- **TypeScript** — you should be using this by now. Type safety catches bugs before they reach users.
- **Git and GitHub** — not optional. Learn branching, pull requests, and merge conflicts.
- **Vercel or Railway** — deploy your projects. Something running on a real URL is worth 10 local demos.
- **Environment variables** — understand .env files, why secrets don't go in code.

## What to Build

The portfolio matters more than certifications. Build three things:

1. **A full-stack app with auth** — users can sign up, log in, and do something that persists in a database
2. **Something that solves a real problem** — even a small one. Scratch your own itch.
3. **An API integration project** — use a public API (weather, finance, sports) and build something interesting with it

Put all three on GitHub with READMEs. Deploy all three. These are what you show in interviews.

## The Timeline (Realistic)

- **3 months:** Comfortable with HTML, CSS, JS. Can build static pages.
- **6 months:** Building React apps, understanding state management.
- **9–12 months:** Full-stack projects deployed. Ready for junior roles.
- **18–24 months:** Confident with the full toolchain. Mid-level territory.

## The Most Important Advice

**Build things you care about.** Learning web development purely for the job is harder than learning it to build something you actually want to exist. The motivation to push through bugs and confusion is much stronger when you have a real goal.

The fundamentals are unglamorous — HTML, CSS, JavaScript — but they're what separates developers who can adapt to any framework from those who only know one. Invest in them.

The stack in this roadmap will be relevant for the next 5–7 years at minimum. Start with foundations. Build consistently. Ship things.
`,
  },
  {
    slug: "why-calculus-matters",
    title: "Why Calculus Matters More Than You Think",
    excerpt: "Most people think calculus is just a painful school subject you forget immediately after the exam. In reality, it's the mathematical language that describes how everything in the universe changes — and its ideas are everywhere once you know how to look.",
    category: "Mathematics",
    published: true,
    body: `# Why Calculus Matters More Than You Think

Most people remember calculus as something like this: a teacher writing cryptic symbols on a whiteboard, a painful exam, and then a relief when it's over. Something you did once and never used again.

This view is almost entirely wrong.

Calculus is not a set of techniques to memorise. It's a way of thinking about *change* — and change is everywhere. Here's why calculus is one of the most powerful ideas human beings have ever developed.

## What Calculus Actually Is

Calculus is the mathematics of change and accumulation. It has two fundamental operations:

**Differentiation** answers: *How fast is something changing right now?*

**Integration** answers: *How much has accumulated over time?*

These two operations are inverses of each other — one of the most beautiful facts in mathematics (called the Fundamental Theorem of Calculus).

That's it. All of calculus — every technique, every application — is an extension of these two ideas.

## The Problem That Invented Calculus

In the 17th century, Newton wanted to understand planetary motion. The problem: a planet's speed is constantly changing as it moves in its elliptical orbit. The mathematics of the time could only handle constant speeds. There was no way to calculate instantaneous speed — speed at a single moment.

Newton's insight: approximate the curve of position vs. time with tiny straight lines. As those lines get shorter and shorter (infinitely small), the approximation becomes exact. This is the definition of a derivative — the limit of a ratio as the interval shrinks to zero.

Newton called it "the method of fluxions". Leibniz independently discovered the same idea and gave us the notation we use today (dy/dx). They argued about credit for decades. The world got calculus from both.

## Where Calculus Lives in the Real World

Once you know what calculus is, you start seeing it everywhere.

**Physics:** Newton's laws of motion are differential equations. F = ma is actually F = m(d²x/dt²) — force equals mass times the second derivative of position. Every equation of classical mechanics is a statement about rates of change.

**Engineering:** The stress in a bridge beam, the flow of current through a circuit, the heat distribution in a material — all described by differential equations derived from calculus.

**Economics:** Marginal cost and marginal revenue (the cost/revenue of producing *one more* unit) are derivatives. Optimisation — finding the minimum cost or maximum profit — is calculus.

**Machine learning:** Training a neural network means minimising a loss function. The algorithm used (gradient descent) moves in the direction of the negative gradient — the derivative of the loss with respect to every parameter. Every time a model learns something, calculus is happening thousands of times per second.

**Medicine:** Pharmacokinetics — how drugs are absorbed, distributed, and eliminated — is modelled by differential equations. The decay curve of a drug in your bloodstream is exponential, described by calculus.

## The Two Key Intuitions

### The Derivative: Zoom In Enough and Every Curve Becomes Straight

If you zoom into any smooth curve at a single point — keep zooming — eventually it looks like a straight line. The slope of that line is the derivative.

This is remarkable: a tool for understanding curved, changing things, built entirely from straight lines and limits. The power of abstraction.

### The Integral: Infinity of Thin Slices Add Up to Something Exact

Integration is the opposite operation — but its intuition is equally beautiful. Want the area under a curve? Divide it into infinitely many infinitely thin rectangles. Each has area = height × width. Add them all up. As the width → 0, the sum → an exact area.

This idea — summing infinitely many infinitely small pieces to get a finite answer — is one of the most profound in all of mathematics.

## Calculus and Intuition

The greatest physicists and engineers don't crunch derivatives symbol-by-symbol. They *feel* what a function is doing — they see a steep curve and think "high derivative", a flat region and think "local minimum", a rapidly growing area and think "large integral".

This intuition is what calculus gives you after the techniques are internalised: a way to look at a changing system and *understand* it without calculating, the way a musician hears a chord and knows its structure without counting intervals.

## You Don't Need to Be a Mathematician

You don't need to solve differential equations to benefit from understanding calculus. What you need is the conceptual framework:

- **Rates of change** are derivatives. When someone says "the rate of inflation is slowing down", that's a statement about the second derivative of prices.
- **Accumulation** is integration. When you track total CO₂ emissions over 50 years, you're integrating a rate over time.
- **Optimisation** is finding where the derivative equals zero. Every algorithm that finds a "best" answer is doing calculus in some form.

These ideas appear in every quantitative field. Understanding them makes you more capable of reasoning about the world — not just in mathematics, but in economics, engineering, biology, technology, and beyond.

## The Bigger Point

Calculus was invented to describe the physical universe, and it worked almost unreasonably well. The same mathematics that describes a falling apple describes the orbit of a planet and the curvature of spacetime. This is not a coincidence — it's a hint that calculus has discovered something deep about the structure of reality.

That's why calculus matters. Not the techniques. The ideas behind them.

When you understand calculus, you gain access to a language that nature itself seems to be written in. That's worth more than any exam grade.
`,
  },
];

async function main() {
  for (const blog of blogs) {
    await db.blogPost.upsert({
      where: { slug: blog.slug },
      create: {
        slug: blog.slug,
        title: blog.title,
        excerpt: blog.excerpt,
        category: blog.category,
        author: AUTHOR,
        authorId: AUTHOR_ID || null,
        body: "",
        published: blog.published,
      },
      update: {
        title: blog.title,
        excerpt: blog.excerpt,
        category: blog.category,
        published: blog.published,
      },
    });
    await putBlogBody(blog.slug, blog.body);
    console.log(`✓ ${blog.slug}`);
  }
  console.log(`\nDone — ${blogs.length} posts seeded`);
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
