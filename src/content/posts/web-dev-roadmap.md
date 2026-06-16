---
title: "The 2025 web development roadmap for beginners"
date: "2025-04-20"
category: "Technology"
readTime: "10 min"
excerpt: "HTML to full-stack in 6 months — a realistic, opinionated roadmap for getting your first developer job."
author: "Prasant Mishra"
---

There's no shortage of web development roadmaps on the internet. Most of them are overwhelming: giant diagrams with hundreds of technologies, long lists of "you should also know" items, and no sense of priority.

This is a different kind of roadmap. It's opinionated, it's focused, and it's designed around one goal: getting you to a point where you can build real things and get hired in approximately six months of consistent work.

I'm going to tell you what to learn, what to skip, and in what order.

## The honest prerequisite

You need about 1–2 hours per day, consistently. Not 10 hours on Sunday. Consistent daily practice is how your brain builds the muscle memory for debugging, for reading errors, for knowing where to look when something breaks.

If you can't commit to that, be honest with yourself. The roadmap will still be here when you can.

## Month 1: HTML and CSS — the foundation

### HTML (week 1–2)

HTML is the structure of every web page. It's not a programming language — it's a markup language. You're labelling content.

What you actually need:
- Document structure (`html`, `head`, `body`)
- Semantic elements: `header`, `nav`, `main`, `section`, `article`, `footer`
- Text: `h1`–`h6`, `p`, `a`, `strong`, `em`
- Media: `img`, `video`
- Forms: `form`, `input`, `button`, `select`, `textarea`
- Lists: `ul`, `ol`, `li`

That's most of it. HTML is not where people get stuck. Don't spend more than two weeks on it.

**Project:** Build a personal bio page. Your name, a short paragraph about you, a photo, and links to your social profiles. No styling yet — just structure.

### CSS (week 3–4)

CSS is where the visual design lives. It's also where most beginners spend too long — trying to perfect a design before they can actually build things.

What you need:
- Selectors: element, class (`.`), ID (`#`), pseudo-classes (`:hover`)
- The box model: `margin`, `padding`, `border`, `width`, `height`
- Typography: `font-family`, `font-size`, `font-weight`, `color`, `line-height`
- Flexbox — learn this well. It handles 80% of layouts.
- CSS Grid — for two-dimensional layouts
- Responsive design: `media queries`, `max-width`, `vw/vh` units

**Deliberately skip for now:** CSS animations, CSS variables (learn them when you need them), preprocessors like SASS.

**Project:** Style your bio page. Make it look clean and professional on both desktop and mobile.

## Month 2: JavaScript — the most important month

JavaScript is the programming language of the web, and it's where web development gets genuinely interesting — and genuinely hard.

This month is the steepest learning curve. Budget extra time.

### The core language (week 1–2)

- Variables: `let`, `const` (never use `var`)
- Data types: strings, numbers, booleans, `null`, `undefined`
- Arrays and objects
- Functions, arrow functions, higher-order functions
- Control flow: `if/else`, `for`, `while`, `forEach`, `map`, `filter`
- `async/await` and Promises — you'll need this for fetching data

### DOM manipulation (week 3)

The DOM (Document Object Model) is how JavaScript interacts with your HTML. This is where your pages start coming alive.

```javascript
// Get an element
const button = document.querySelector('#my-button');

// Listen for a click
button.addEventListener('click', () => {
  document.querySelector('#message').textContent = 'You clicked it!';
});
```

- `querySelector` and `querySelectorAll`
- `addEventListener`
- Changing content, classes, and styles
- Creating and removing elements

### Fetch and APIs (week 4)

Most web apps get their data from servers. The `fetch` API is how JavaScript retrieves data from the internet.

```javascript
const response = await fetch('https://api.example.com/data');
const data = await response.json();
console.log(data);
```

**Project:** Build a weather app. Enter a city, fetch real weather data from a free API (OpenWeatherMap has one), display it nicely. This combines HTML, CSS, DOM manipulation, and API calls.

## Month 3: React — the industry standard

React is the most widely used frontend library in the industry. Learning it opens more job opportunities than anything else you could learn at this stage.

**Why React and not Vue or Svelte?** Ecosystem, job market, and community. Vue and Svelte are excellent — but React is where most jobs are in 2025.

### Week 1–2: React fundamentals

- Components and JSX
- Props — passing data down
- State with `useState` — making components interactive
- Rendering lists and conditional rendering

### Week 3–4: Data and effects

- `useEffect` — running code in response to changes
- Fetching data inside components
- Lifting state up
- Simple component composition

**Project:** Rebuild your weather app in React. The logic is the same — the React version will teach you how much simpler state management becomes.

## Month 4: Backend basics with Node.js

To build complete applications, you need a server. Node.js lets you use JavaScript on the backend.

### What to learn

- Node.js fundamentals: modules, `fs`, `http`
- Express.js — the standard framework for Node servers
- Building a REST API: GET, POST, PUT, DELETE routes
- Handling JSON requests and responses
- Basic authentication with sessions or JWTs

### Databases

You need to store data. Start with one:

- **PostgreSQL** — relational database, excellent for structured data. Use with Prisma (a TypeScript ORM that makes queries readable).
- **MongoDB** — document database, flexible schema. Use with Mongoose.

I recommend PostgreSQL. Relational databases are a skill that transfers everywhere.

**Project:** Build a simple task manager API with Express and PostgreSQL. Create, read, update, delete tasks. No frontend yet.

## Month 5: Connecting frontend and backend

Now you put it together.

- Build a React frontend for your task manager
- Connect it to your Express API with `fetch`
- Add user authentication (register, login, logout)
- Deploy it

For deployment:
- **Frontend:** Vercel (free, excellent for React apps)
- **Backend:** Railway or Render (free tier available)
- **Database:** Supabase or Railway (managed PostgreSQL)

**Project:** A full-stack task manager with authentication, deployed to the internet. This is a real project you can show employers.

## Month 6: Polish, portfolio, and job prep

Stop learning new technologies. Focus on:

1. **Polish your projects.** Write a README. Fix bugs. Make the UI clean. Record a short demo video.

2. **Build one more project you're genuinely interested in.** Not a todo app — something you'd actually use. The enthusiasm shows in the quality.

3. **Learn Git and GitHub properly.** Commits, branches, pull requests. Every professional team uses this. Your GitHub profile is part of your portfolio.

4. **Start applying.** Don't wait until you feel "ready." You never will. Apply to junior developer roles, internships, and freelance gigs simultaneously.

## The things you should ignore (for now)

- TypeScript — learn it at your first job. Important but not urgent.
- Next.js / Remix — after you're solid in React
- Docker, Kubernetes — years away
- AWS, GCP, Azure — learn the basics when you need them
- Testing — start learning this once you have a job

## The most important thing

Build things you care about. Courses give you knowledge. Projects give you skills. The developer who's built five real projects — even imperfect ones — will always outcompete the developer who's completed fifteen courses but shipped nothing.

Every week, something should be live on the internet that wasn't there the week before.

That's the actual roadmap.
