// ==============================================================================
// EduLearn — Automated Demo Courses Seed Script (REST Client)
// File: scripts/seed_demo_courses.js
//
// Automatically seeds the two presentation-ready demo courses into Supabase:
// 1. "Web Development Foundations — HTML & CSS" (Instructor 1)
// 2. "Cloud Computing and Web Hosting Essentials" (Instructor 2)
//
// Fully idempotent: Resolves existing courses, lessons, quizzes, questions, options,
// and answer keys, updating them in-place without creating duplicates.
// ==============================================================================

const SUPABASE_URL = 'https://pbpnsyumlfkrhiwtrjbn.supabase.co';
const ANON_KEY = 'sb_publishable_piicbKQCnM73cS7ttkRDTg_IQYitLaX';

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Authentication failed for ${email}: ${JSON.stringify(data)}`);
  }
  return { token: data.access_token, user: data.user };
}

async function apiFetch(path, options, token) {
  const headers = {
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

// Course A definition
const COURSE_A = {
  title: 'Web Development Foundations — HTML & CSS',
  description: 'A beginner-friendly, practical introduction to building structured, styled, responsive web pages using HTML5 and CSS3.',
  is_published: true,
  lessons: [
    {
      position: 1,
      title: 'HTML Fundamentals and Document Structure',
      content: `# Lesson 1: HTML Fundamentals and Document Structure

Welcome to Web Development Foundations. In this lesson, you will learn the core building blocks of the World Wide Web: HyperText Markup Language (HTML). Every website—from a personal blog to a complex web application—relies on HTML to define its document structure, display content, and provide semantic meaning to browsers, search engines, and assistive technologies.

---

## 1. What is an HTML Document?

An HTML document is a plain-text file interpreted by web browsers (such as Chrome, Firefox, Safari, or Edge) to render visual interfaces. HTML uses a system of tags, elements, and attributes:

- Tag: An opening <tagname> or closing </tagname> identifier enclosed in angle brackets.
- Element: The complete unit comprising the opening tag, content, and closing tag (e.g., <p>Hello world</p>). Some elements are self-closing or void elements (e.g., <img>, <input>, <br>).
- Attribute: Key-value pairs placed inside the opening tag that provide additional instructions or metadata to the element (e.g., <a href="https://example.com" target="_blank">).

---

## 2. The Core Document Skeleton

Every standard HTML5 document follows a strict, predictable boilerplate hierarchy:

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My First Web Page</title>
  </head>
  <body>
    <header>
      <h1>Web Development Journey</h1>
    </header>
    <main>
      <p>Welcome to modern web development! HTML provides the bones of every site.</p>
    </main>
    <footer>
      <p>&copy; 2026 Web Development Foundations</p>
    </footer>
  </body>
</html>

### Explaining Each Component:
1. <!DOCTYPE html>: Tells the web browser to render the page in modern standards mode rather than backwards-compatible quirks mode.
2. <html lang="en">: The root element wrapping all document code; the lang attribute declares the primary language for accessibility tools and translation engines.
3. <head>: Contains machine-readable metadata, the document title, stylesheet links, and scripts not rendered directly on the page canvas.
4. <meta charset="UTF-8" />: Declares standard UTF-8 character encoding, supporting international languages and symbols.
5. <meta name="viewport" content="width=device-width, initial-scale=1.0" />: Essential for mobile responsiveness, matching the viewport width to the device screen.
6. <body>: Contains all visible content rendered to the user.

---

## 3. Essential Content Elements

### Headings and Paragraphs
HTML provides six levels of section headings: <h1> through <h6>. A page should have exactly one <h1> representing the primary document topic, followed by hierarchical subheadings.

<h1>Main Course Title</h1>
<h2>Module Overview</h2>
<h3>Key Concepts</h3>
<p>Paragraphs represent distinct blocks of text separated by vertical margin.</p>

### Links and Hypertext
Hyperlinks connect documents across the web using the <a> (anchor) element:

<!-- Internal relative link -->
<a href="/about">About Us</a>

<!-- External secure link opening in a new tab -->
<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">MDN Web Docs</a>

Security Note: When using target="_blank", always include rel="noopener noreferrer" to prevent the opened page from tampering with your window via the window.opener object.

### Media and Images
Images are embedded using the void <img> element:

<img src="/images/diagram.png" alt="Overview diagram of the HTML document tree" width="600" height="400" />

Accessibility Note: The alt (alternative text) attribute is required. It communicates image context to visually impaired users using screen readers and displays fallback text if image loading fails.

---

## 4. Key Takeaways
- HTML creates the underlying document hierarchy and content structure.
- Always include <!DOCTYPE html> and proper <meta> tags in <head>.
- Use heading tags hierarchically (<h1> to <h6>) without skipping levels for visual styling alone.
- Always supply descriptive alt text for images and secure rel attributes for external links.`
    },
    {
      position: 2,
      title: 'Semantic HTML and Accessible Forms',
      content: `# Lesson 2: Semantic HTML and Accessible Forms

In this lesson, you will learn why semantic markup matters for modern web applications, how assistive technologies interact with page structure, and how to build accessible, user-friendly forms.

---

## 1. What is Semantic HTML?

A semantic element clearly describes its meaning and role to both the browser and the developer. Contrast this with non-semantic elements:

- Non-semantic: <div> and <span> tell us nothing about their content. They are generic containers.
- Semantic: <header>, <nav>, <main>, <article>, <section>, <aside>, and <footer> clearly declare their functional role.

### Why Semantics Matter:
1. Accessibility (a11y): Screen readers create landmark navigation menus from semantic elements, allowing keyboard and screen-reader users to jump directly to <main> or <nav>.
2. SEO (Search Engine Optimization): Search engine indexers weigh content within <main> and <article> higher than generic divisions.
3. Maintainability: Semantic code is self-documenting and easier for engineering teams to inspect and debug.

---

## 2. Semantic Document Landmarks

Here is a semantic page structure:

<header>
  <nav aria-label="Primary Navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/courses">Courses</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <header>
      <h1>Understanding Web Semantics</h1>
      <p>Published on October 18, 2026</p>
    </header>
    <section>
      <h2>Why Accessibility Comes First</h2>
      <p>Building accessible interfaces ensures every learner can participate.</p>
    </section>
  </article>

  <aside aria-label="Related Topics">
    <h3>Related Reading</h3>
    <ul>
      <li><a href="/a11y">Web Accessibility Guidelines</a></li>
    </ul>
  </aside>
</main>

<footer>
  <p>&copy; 2026 EduLearn. All rights reserved.</p>
</footer>

---

## 3. Accessible Interactive Forms

Forms allow users to submit information: registering accounts, updating settings, or attempting quizzes. An accessible form requires explicit programmatic associations between controls and their text descriptions.

### The Critical Role of <label>
Never rely solely on placeholder attributes for input descriptions. Placeholders disappear when the user begins typing, creating severe usability barriers. Instead, use an explicit <label> with a matching for attribute:

<form action="/api/register" method="POST">
  <fieldset>
    <legend>Account Registration</legend>

    <div class="form-group">
      <label for="user-fullname">Full Legal Name</label>
      <input 
        type="text" 
        id="user-fullname" 
        name="fullName" 
        required 
        minlength="2" 
        autocomplete="name" 
      />
    </div>

    <div class="form-group">
      <label for="user-email">Email Address</label>
      <input 
        type="email" 
        id="user-email" 
        name="email" 
        required 
        autocomplete="email" 
      />
    </div>

    <div class="form-group">
      <label for="user-role">Account Type</label>
      <select id="user-role" name="role" required>
        <option value="">-- Select an option --</option>
        <option value="student">Student Learner</option>
        <option value="instructor">Course Instructor</option>
      </select>
    </div>

    <button type="submit">Complete Registration</button>
  </fieldset>
</form>

### Key Form Practices:
- fieldset and legend: Group related controls (such as radio buttons or shipping address fields) together with a common caption.
- Built-in HTML validation: Use required, minlength, maxlength, pattern, and correct type attributes (email, number, url) to give immediate feedback.
- Autocomplete attributes: Specifying autocomplete="email" or autocomplete="current-password" helps password managers and mobile autofill work smoothly.

---

## 4. Key Takeaways
- Use landmark elements (<header>, <nav>, <main>, <footer>) to create navigable document hierarchy.
- Every form input must have a programmatic <label> connected via for and id.
- Never use placeholder text as a replacement for accessible labels.`
    },
    {
      position: 3,
      title: 'CSS Fundamentals and the Box Model',
      content: `# Lesson 3: CSS Fundamentals and the Box Model

Cascading Style Sheets (CSS) transforms plain HTML documents into visually polished, well-spaced, branded digital experiences. In this lesson, you will master selector specificity, cascade inheritance, typography, and the foundational CSS Box Model.

---

## 1. Syntax, Selectors, and Specificity

A CSS rule set consists of a selector and a declaration block:

.primary-button {
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
}

### Specificity Hierarchy
When multiple conflicting rules target the same element, the browser calculates specificity to decide which styles apply:

1. Inline styles (style="..."): Weight 1,0,0,0
2. ID selectors (#hero-title): Weight 0,1,0,0
3. Class selectors, attributes, and pseudo-classes (.button, [type="text"], :hover): Weight 0,0,1,0
4. Element selectors and pseudo-elements (h1, p, ::before): Weight 0,0,0,1
5. Universal selector (*): Weight 0,0,0,0

Best Practice: Avoid over-relying on ID selectors in CSS. Prefer modular, reusable class names to keep specificity manageable and predictable.

---

## 2. The CSS Box Model Explained

Every rendered HTML element is treated as a rectangular box. The Box Model comprises four concentric layers:

+------------------------------------------+
|                 MARGIN                   |  <-- Transparent spacing outside element
|  +------------------------------------+  |
|  |              BORDER                |  |  <-- Stroke surrounding padding & content
|  |  +------------------------------+  |  |
|  |  |           PADDING            |  |  |  <-- Inner spacing around content
|  |  |  +------------------------+  |  |  |
|  |  |  |        CONTENT         |  |  |  |  <-- Text, image, or child elements
|  |  |  |   (width x height)     |  |  |  |
|  |  |  +------------------------+  |  |  |
|  |  +------------------------------+  |  |
|  +------------------------------------+  |
+------------------------------------------+

### content-box vs border-box
- Default box-sizing: content-box: The width and height properties apply ONLY to the content area. Padding and border are added ON TOP of the specified width, making elements unexpectedly expand and break layout grids.
- Modern box-sizing: border-box: The width and height properties include content, padding, AND border. If you set width: 300px; padding: 20px; border: 2px solid black;, the total rendered element width remains exactly 300px.

### The Essential Universal Reset:
Every modern CSS foundation begins with this universal box-sizing declaration:

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

---

## 3. Typography and Units of Measurement

Modern web layouts use scalable, relative units rather than rigid absolute pixels:

- rem (Root EM): Relative to the root <html> font size (default 16px). 1rem = 16px, 1.5rem = 24px, 0.75rem = 12px. Using rem respects the user's browser accessibility font scaling.
- em: Relative to the font size of the immediate parent element. Great for padding buttons proportionally to their text size.
- %: Relative to the parent element's dimensions.
- vw / vh: Viewport width and height units (100vw = 100% of browser width).

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #1f2937;
}

h1 {
  font-size: 2.25rem; /* 36px */
  line-height: 1.25;
  margin-bottom: 1rem;
}

---

## 4. Key Takeaways
- Always reset your CSS with box-sizing: border-box.
- Structure stylesheets using moderate-specificity class selectors.
- Use rem for font sizes and spacing to preserve accessibility.`
    },
    {
      position: 4,
      title: 'Layouts with Flexbox and CSS Grid',
      content: `# Lesson 4: Layouts with Flexbox and CSS Grid

For years, web developers wrestled with floats, clearfixes, and inline-block hacks to position elements on a screen. Today, CSS provides two robust, native layout engines: Flexbox (Flexible Box Layout) and CSS Grid. In this lesson, you will learn the distinct purpose of each technique and how to implement clean, production-ready layouts.

---

## 1. When to Use Flexbox vs CSS Grid

| Feature | Flexbox (1-Dimensional) | CSS Grid (2-Dimensional) |
| :--- | :--- | :--- |
| Primary Axis | Single axis: rows OR columns | Dual axes: rows AND columns simultaneously |
| Design Approach | Content-driven (elements determine space) | Layout-driven (grid defines areas, items fit in) |
| Best For | Navigation bars, button groups, tag lists, card headers | Page layouts, dashboard grids, photo galleries, data tables |

---

## 2. Flexbox in Practice

Flexbox operates on a container (flex container) and its direct children (flex items).

.navbar {
  display: flex;
  flex-direction: row;            /* default: main axis is horizontal */
  justify-content: space-between; /* distributes items along main axis */
  align-items: center;            /* centers items along cross axis */
  gap: 1.5rem;                    /* modern spacing between items */
  padding: 1rem 2rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  list-style: none;
}

### Essential Flexbox Properties:
- justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly
- align-items: stretch | center | flex-start | flex-end | baseline
- flex-wrap: nowrap (default) | wrap (allows items to wrap to a new line)
- flex: 1: Shorthand for flex-grow: 1; flex-shrink: 1; flex-basis: 0%;, causing a child item to expand and fill available space.

---

## 3. CSS Grid in Practice

CSS Grid allows you to define rows and columns on the parent container, placing child elements into explicit cells or spans.

.dashboard-grid {
  display: grid;
  /* Creates flexible columns that collapse automatically on smaller screens */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.stat-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Feature card spanning two columns on wide screens */
.stat-card.featured {
  grid-column: span 2;
}

### Power of the fr Unit and repeat():
- 1fr: Represents one fraction of available free space.
- repeat(3, 1fr): Equivalent to 1fr 1fr 1fr.
- minmax(280px, 1fr): Guarantees that columns will never shrink below 280px and will expand equally to share available room.
- auto-fit with minmax: Creates an inherently responsive column grid that automatically wraps without requiring media queries!

---

## 4. Key Takeaways
- Use Flexbox for linear components: horizontal bars, vertical lists, centered items.
- Use CSS Grid for two-dimensional page structures: dashboards, catalogues, multi-column articles.
- Leverage gap for clean, consistent spacing between items on both Flex and Grid containers.`
    },
    {
      position: 5,
      title: 'Responsive Web Design and Final Practice',
      content: `# Lesson 5: Responsive Web Design and Final Practice

In this concluding lesson, you will synthesize everything you have learned about HTML and CSS to create modern, responsive, mobile-first web experiences that look and function gracefully across devices of any size.

---

## 1. Core Principles of Responsive Design

Responsive Web Design (RWD) ensures your application adapts fluidly to mobile phones, tablets, laptops, and ultra-wide desktop monitors without sacrificing usability.

### The Three Pillars of RWD:
1. Fluid Grids: Using proportional sizing (%, fr, vw) rather than fixed pixel widths.
2. Flexible Media: Preventing images and video from overflowing their containers:
   img, video {
     max-width: 100%;
     height: auto;
     display: block;
   }
3. CSS Media Queries: Applying targeted styling rules based on device characteristics (such as viewport width).

---

## 2. Mobile-First vs Desktop-First

In modern software engineering, mobile-first is the industry standard:
- You write default CSS styles optimized for small screens with minimal visual noise and linear vertical stacks.
- You layer on layout enhancements (like multiple columns, larger typography, and sidebars) using min-width media queries as the viewport widens:

/* 1. Base Styles: Mobile Small Screen (Default) */
.course-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

/* 2. Tablet Screen Enhancement */
@media (min-width: 640px) {
  .course-card {
    flex-direction: row;
    padding: 1.5rem;
  }
}

/* 3. Desktop Screen Enhancement */
@media (min-width: 1024px) {
  .course-card {
    padding: 2rem;
    max-width: 960px;
    margin: 0 auto;
  }
}

Why Mobile-First? Mobile devices have limited processing power and network bandwidth. Serving lean base styles first ensures fast initial page loads.

---

## 3. Practical Accessibility & Focus Indicators

A website cannot be considered high-quality if it is not accessible to keyboard and screen-reader users:
- Focus Rings: Never declare outline: none without providing an explicit replacement. Keyboard users rely on focus indicators to know which element is currently active.
  a:focus-visible, button:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
- Color Contrast: Maintain a minimum contrast ratio of 4.5:1 for normal text against its background (WCAG AA standard).

---

## 4. Final Practice Exercise: The Responsive Profile Card

Test your skills by reviewing this production-ready responsive card component:

HTML:
<article class="user-card">
  <div class="user-avatar-wrap">
    <img src="/avatars/instructor.jpg" alt="Photo of Dr. Sarah Connor" class="user-avatar" />
  </div>
  <div class="user-content">
    <span class="badge">Instructor</span>
    <h2 class="user-name">Dr. Sarah Connor</h2>
    <p class="user-bio">
      Senior Software Architect specializing in web technologies, frontend accessibility,
      and distributed systems education.
    </p>
    <a href="/instructor/courses" class="profile-link">View Published Courses &rarr;</a>
  </div>
</article>

CSS:
.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  gap: 1rem;
}

.user-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
}

@media (min-width: 640px) {
  .user-card {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
    gap: 2rem;
  }
}

### Expected Behavior:
- On mobile (< 640px), the avatar, heading, bio, and link stack vertically centered.
- On tablet and desktop (>= 640px), the layout smoothly switches to a two-column row with the avatar on the left and left-aligned text on the right.

Congratulations! You have completed the five lessons of Web Development Foundations. Proceed to the course quiz to verify your comprehension!`
    }
  ],
  quiz: {
    title: 'Web Development Foundations Assessment',
    questions: [
      {
        position: 1,
        text: 'What is the primary function of the <!DOCTYPE html> declaration at the beginning of an HTML file?',
        correctIndex: 0,
        options: [
          'It instructs the browser to render the document in modern HTML5 standards mode.',
          'It links external CSS stylesheets and fonts automatically.',
          'It initializes the browser JavaScript runtime engine.',
          'It sets the language code and database character encoding.'
        ]
      },
      {
        position: 2,
        text: 'When opening an external link in a new tab with target="_blank", which security attribute combination is strongly recommended?',
        correctIndex: 0,
        options: [
          'rel="noopener noreferrer"',
          'rel="external-security"',
          'target="sandbox-mode"',
          'type="application/secure-link"'
        ]
      },
      {
        position: 3,
        text: 'Why is using semantic <main> preferred over a generic <div id="main"> container?',
        correctIndex: 0,
        options: [
          '<main> provides an accessible landmark for assistive technologies and search engine indexers.',
          '<main> automatically centers all child text content horizontally.',
          '<main> enables CSS Grid layout by default without requiring CSS.',
          '<main> prevents JavaScript from accessing child form inputs.'
        ]
      },
      {
        position: 4,
        text: 'Which HTML attribute explicitly pairs a <label> with its corresponding <input> element?',
        correctIndex: 0,
        options: [
          'The label "for" attribute matching the input "id" attribute.',
          'The label "name" attribute matching the input "name" attribute.',
          'The label "aria-describedby" attribute matching the input "placeholder".',
          'The input "label-ref" attribute matching the form "id".'
        ]
      },
      {
        position: 5,
        text: 'What is the behavior of "box-sizing: border-box" compared to the browser default "content-box"?',
        correctIndex: 0,
        options: [
          'Padding and border are included inside the declared width and height.',
          'Margins are automatically collapsed to zero across all child elements.',
          'Padding is added on top of the declared width, expanding element boundaries.',
          'The element is rendered with rounded corners and dropshadow styling.'
        ]
      },
      {
        position: 6,
        text: 'According to standard CSS specificity rules (without !important), which selector has the highest specificity weight?',
        correctIndex: 0,
        options: [
          '#primary-navigation (ID selector: 0,1,0,0)',
          '.card-title.active.highlight (Three class selectors: 0,0,3,0)',
          'header nav ul li a (Five element selectors: 0,0,0,5)',
          '* (Universal selector: 0,0,0,0)'
        ]
      },
      {
        position: 7,
        text: 'Which layout scenario is best solved by CSS Grid rather than Flexbox?',
        correctIndex: 0,
        options: [
          'A 2D dashboard photo gallery requiring alignment across both rows and columns simultaneously.',
          'A horizontal navigation bar with a logo on the left and links on the right.',
          'Centering an icon horizontally and vertically inside a circular button.',
          'A linear vertical list of input fields inside an account settings modal.'
        ]
      },
      {
        position: 8,
        text: 'In Flexbox, which property controls the alignment of child items along the cross axis (perpendicular to flex-direction)?',
        correctIndex: 0,
        options: [
          'align-items',
          'justify-content',
          'flex-direction',
          'flex-basis'
        ]
      },
      {
        position: 9,
        text: 'What is the core philosophy of a "mobile-first" responsive design strategy?',
        correctIndex: 0,
        options: [
          'Writing base CSS for compact screens first, then adding complexity using min-width media queries.',
          'Writing desktop CSS as default and hiding elements on mobile using max-width queries.',
          'Serving completely separate HTML pages to mobile browsers via user-agent sniffing.',
          'Disabling horizontal scrolling on desktop monitors by setting width: 100vw.'
        ]
      },
      {
        position: 10,
        text: 'Why is setting "outline: none" on interactive elements without an accessible replacement considered a critical defect?',
        correctIndex: 0,
        options: [
          'It strips visual focus indicators, leaving keyboard navigation users unable to see which element is active.',
          'It forces the browser to recompute layout on every mouse movement.',
          'It causes form inputs to submit empty strings when clicked with a mouse.',
          'It increases CSS bundle size by triggering vendor prefix warnings.'
        ]
      }
    ]
  }
};

// Course B definition
const COURSE_B = {
  title: 'Cloud Computing and Web Hosting Essentials',
  description: 'An introductory, practical course explaining cloud computing and how a web application becomes accessible over the internet.',
  is_published: true,
  lessons: [
    {
      position: 1,
      title: 'Introduction to Cloud Computing',
      content: `# Lesson 1: Introduction to Cloud Computing

Welcome to Cloud Computing and Web Hosting Essentials. In this course, you will demystify how web applications transition from code running on a local development laptop to scalable, resilient services accessible worldwide 24/7 over the internet.

---

## 1. What is Cloud Computing?

Historically, companies had to purchase physical servers, rack them in climate-controlled server rooms, configure uninterruptible power supplies (UPS), configure network switches, and hire teams for physical security and hardware maintenance.

According to the National Institute of Standards and Technology (NIST), Cloud Computing is a model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources (networks, servers, storage, applications, and services) that can be rapidly provisioned with minimal management effort or service provider interaction.

### Five Fundamental Characteristics:
1. On-Demand Self-Service: You can provision computing resources (like spinning up a virtual machine or PostgreSQL database) automatically via API or web console without human intervention from the service provider.
2. Broad Network Access: Services are accessible via standard network mechanisms across diverse client platforms (web browsers, mobile devices, IoT endpoints).
3. Resource Pooling: The provider's physical computing resources are pooled together to serve multiple customers (multi-tenancy), dynamically assigning and reassigning physical and virtual resources according to consumer demand.
4. Rapid Elasticity: Resources can be elastically provisioned and released—often automatically—to scale outward during traffic spikes and scale inward during quiet periods.
5. Measured Service: Cloud systems automatically meter and charge for resource consumption on a pay-as-you-go basis (CPU seconds, gigabytes stored, egress bandwidth).

---

## 2. The Cloud Service Models (SPI Model)

Cloud services are categorized into three major layers of abstraction:

+-----------------------------------------------------------+
|               SaaS (Software as a Service)                |
|  Consumer uses applications managed entirely by vendor    |
|  Examples: Google Workspace, GitHub, Slack, Zoom          |
+-----------------------------------------------------------+
|               PaaS (Platform as a Service)                |
|  Consumer deploys code/apps; vendor manages OS & runtimes |
|  Examples: Vercel, Heroku, AWS Elastic Beanstalk          |
+-----------------------------------------------------------+
|             IaaS (Infrastructure as a Service)            |
|  Consumer provisions VMs, storage, networking & OS        |
|  Examples: Amazon EC2, Google Compute Engine, Azure VMs   |
+-----------------------------------------------------------+

### 1. Infrastructure as a Service (IaaS)
Provides raw compute instances, storage, and networking. You choose the operating system (e.g., Ubuntu Linux), install runtime environments (Node.js, Python), apply security kernel patches, and configure system firewalls.
- Pros: Maximum architectural control and flexibility.
- Cons: High administrative burden and operational overhead.

### 2. Platform as a Service (PaaS)
Abstracts the operating system, container orchestration, and runtime environment. You write application code, define environment variables, and push your repository. The platform builds, containerizes, scales, and serves the application.
- Pros: Rapid time-to-market, zero server maintenance.
- Cons: Constrained by the platform's supported runtimes and execution limits.

### 3. Software as a Service (SaaS)
Delivers a fully functional software application to end users over the internet.
- Pros: Instant access, zero infrastructure or application code management.
- Cons: Zero customization over low-level architecture.

---

## 3. Cloud Deployment Models
- Public Cloud: Owned and operated by third-party providers (AWS, Azure, Google Cloud) offering infrastructure over the public internet.
- Private Cloud: Cloud infrastructure operated exclusively for a single organization, hosted on-premises or by a private hosting facility.
- Hybrid Cloud: Combines public and private clouds, allowing sensitive financial data to stay on-premises while burst traffic runs in public cloud infrastructure.

---

## 4. Key Takeaways
- Cloud computing shifts capital expense (CapEx) to variable operational expense (OpEx).
- Understand the trade-off: IaaS offers maximum control, PaaS offers maximum developer productivity, SaaS offers complete software abstraction.
- Elasticity allows systems to dynamically accommodate unpredictable user workloads.`
    },
    {
      position: 2,
      title: 'Compute, Storage, and Networking',
      content: `# Lesson 2: Compute, Storage, and Networking

Every web application—including this online education platform—is an orchestrated assembly of three core building blocks: Compute, Storage, and Networking. In this lesson, you will learn how these components work together to deliver reliable online experiences.

---

## 1. Compute: Running Application Logic

Compute refers to the processing power (CPU and RAM) that executes application code and processes user requests:

1. Virtual Machines (VMs):
   - Emulated computer systems running on top of physical hardware managed by a hypervisor (e.g., KVM, Xen).
   - Each VM runs its own independent operating system kernel.
2. Containers (Docker / OCI):
   - Lightweight, standalone executable packages containing code, runtime, system libraries, and settings.
   - Containers share the host operating system kernel, making them start in milliseconds and use dramatically less memory than VMs.
3. Serverless Functions (FaaS):
   - Event-driven compute units (e.g., AWS Lambda, Vercel Serverless Functions).
   - Code executes only when triggered by an incoming HTTP request or database event, scaling to zero when idle.

---

## 2. Storage: Managing Data Safely

Modern cloud architectures separate static assets, transactional records, and temporary caches into purpose-built storage systems:

+------------------+-----------------------------+---------------------------+
| Storage Type     | Characteristics             | Typical Web Use Case      |
+------------------+-----------------------------+---------------------------+
| Block Storage    | Persistent virtual disk     | Root file system of VM    |
| Object Storage   | HTTP REST access, flat key  | PDF notes, avatars, media |
| Relational DB    | ACID transactions, SQL, RLS | Profiles, courses, scores |
| In-Memory Cache  | Microsecond latency RAM     | Session auth tokens, keys |
+------------------+-----------------------------+---------------------------+

### Object Storage Deep Dive
Object storage (such as Amazon S3 or Supabase Storage) does not use a traditional hierarchical directory tree. Instead, every item is stored as an immutable binary object with metadata and a globally unique key, accessible directly via HTTP GET requests. This architecture scales infinitely and costs a fraction of relational database storage.

### Managed Databases
Rather than running PostgreSQL inside a self-managed Linux VM where you must handle backups, replication, and failovers yourself, modern platforms use Managed Database Services. The provider automatically manages automated daily snapshots, point-in-time recovery (PITR), high availability standby replicas, and connection pooling.

---

## 3. Networking and Availability

### IP Addresses and Ports
- Public IP: Globally routable address assigned to internet-facing services.
- Private IP: Non-routable internal address (e.g., 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) used for safe server-to-database communication within a Virtual Private Cloud (VPC).
- Default Web Ports: Port 80 for unencrypted HTTP; Port 443 for encrypted HTTPS.

### High Availability: Regions and Availability Zones
Cloud providers organize their physical data centers globally:
- Region: A distinct geographic area (e.g., us-east-1 in Virginia, eu-west-1 in Ireland, ap-south-1 in Mumbai).
- Availability Zone (AZ): One or more discrete data centers within a region, equipped with redundant power, cooling, and networking.

Designing for Fault Tolerance: If a construction backhoe cuts power to Data Center A, applications deployed across multiple Availability Zones automatically redirect traffic to Data Center B without downtime.

---

## 4. Key Takeaways
- Select compute based on requirements: VMs for persistent state, containers for portability, serverless for on-demand event handling.
- Keep static media in Object Storage and transactional state in a managed Relational Database.
- Isolate databases in private subnets and restrict public access strictly to necessary HTTPS endpoints.`
    },
    {
      position: 3,
      title: 'Domains, DNS, HTTP, and HTTPS',
      content: `# Lesson 3: Domains, DNS, HTTP, and HTTPS

Have you ever wondered what happens in the milliseconds between typing a URL into your browser's address bar and the web page appearing on your screen? In this lesson, you will trace the journey of an internet request through domain names, DNS resolution, and secure HTTPS handshakes.

---

## 1. Domain Names and the Domain Name System (DNS)

Computers communicate using numerical IP addresses (such as 104.21.55.2 or 2606:4700::6815:3702). Because humans struggle to memorize numerical strings, the Domain Name System (DNS) serves as the decentralized phone book of the internet.

### Domain Hierarchy:
              . (Root)
              |
      +-------+-------+
      |               |
     .com            .edu  (Top-Level Domains / TLDs)
      |
   edulearn (Second-Level Domain)
      |
     www    (Subdomain)

### Essential DNS Record Types:
- A Record (Address): Maps a hostname directly to an IPv4 address (e.g., edulearn.org -> 198.51.100.1).
- AAAA Record: Maps a hostname to an IPv6 address.
- CNAME Record (Canonical Name): Creates an alias pointing one hostname to another (e.g., www.edulearn.org -> edulearn.org or a cloud load balancer).
- TXT Record: Stores arbitrary text, used for domain ownership verification and email security protocols (SPF, DKIM).
- MX Record: Directs incoming email to designated mail servers.

---

## 2. The Step-by-Step Request Flow

[Browser Client]
       |
       | 1. "What is the IP for app.edulearn.org?"
       v
[DNS Resolver / Cache] ---> [Root -> TLD -> Authoritative Nameserver]
       |
       | 2. "The IP is 198.51.100.24"
       v
[Browser Client]
       |
       | 3. TCP Handshake + TLS 1.3 Cryptographic Handshake
       v
[Cloud Edge / Reverse Proxy (HTTPS Port 443)]
       |
       | 4. HTTP GET /student/courses HTTP/2
       v
[Application Origin Server / Supabase Backend]
       |
       | 5. HTTP 200 OK + JSON / HTML Payload
       v
[Browser Client renders UI]

---

## 3. HTTP vs HTTPS and TLS Encryption

HTTP (HyperText Transfer Protocol) transmits messages in unencrypted plaintext over TCP port 80. Any intermediate router or network eavesdropper can read passwords, session cookies, and personal data in transit.

HTTPS (HTTP Secure) encrypts traffic using Transport Layer Security (TLS) over TCP port 443.

### Three Guarantees of HTTPS:
1. Confidentiality (Encryption): Eavesdroppers cannot read transmitted payloads.
2. Integrity: Data cannot be modified or corrupted in transit without detection.
3. Authentication: Digital certificates issued by trusted Certificate Authorities (CAs) like Let's Encrypt verify that the client is communicating with the legitimate server, preventing Man-in-the-Middle (MitM) impersonation.

---

## 4. Key Takeaways
- DNS translates human-friendly domain names into IP addresses.
- Use CNAME records to alias custom subdomains to cloud providers.
- HTTPS is mandatory for every modern web application to protect user authentication tokens and ensure data integrity.`
    },
    {
      position: 4,
      title: 'Deploying a Web Application',
      content: `# Lesson 4: Deploying a Web Application

In this lesson, you will learn the exact steps required to transform local project code into a live production web service, examining compilation artifacts, environment variable isolation, static hosting, and routing.

---

## 1. Local Development vs Production Builds

During development, tools like Vite run a local development server with Hot Module Replacement (HMR). Code is unminified and full of debugging instrumentation.

When deploying to production, you run a compilation script:
npm run build

### What Happens During the Build?
- Transpilation: JSX and modern ECMAScript features are transformed into universally supported JavaScript.
- Bundling & Code Splitting: Hundreds of individual source files and node_modules dependencies are bundled into compact chunks.
- Minification & Tree Shaking: Dead, unused code is discarded; variable names are shortened, and whitespace is removed to minimize file transfer size.
- Asset Hashing: Output files receive content-hashed filenames (e.g., index-D7MBE_42.css), enabling aggressive browser caching without risk of stale cache bugs.

The build outputs all static production artifacts into a single folder (typically dist/ or build/).

---

## 2. Frontend Hosting on Edge Networks

Because Single Page Applications (SPAs) like React consist entirely of static HTML, CSS, JavaScript, and images, they do not require an active Node.js server running in production. Instead, they can be served directly from a Content Delivery Network (CDN) or specialized static host (like Vercel, Netlify, or Cloudflare Pages).

### The Single Page App (SPA) Routing Challenge
When a user visits https://edulearn.org/, the web server serves index.html.
However, if the user bookmarks https://edulearn.org/student/courses and refreshes, the web server looks for a physical directory named /student/courses/index.html.

Because the file does not physically exist on disk, the server returns an HTTP 404 Not Found error unless configured with an SPA Rewrite Rule:
- The Rule: Any request that does not match a physical static asset (like .js or .css) must return index.html with an HTTP 200 status code, allowing client-side React Router to inspect the URL and render the correct page component!

---

## 3. Environment Variables and Secret Hygiene

Modern applications separate code from configuration using environment variables:

# Public variables (Bundled into frontend JS code by Vite)
VITE_SUPABASE_URL=https://pbpnsyumlfkrhiwtrjbn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_piicbKQCnM73cS7ttkRDTg_IQYitLaX

### The Golden Security Rule:
- Variables prefixed with VITE_ or REACT_APP_ are embedded directly into the public JavaScript bundle downloaded by every user's browser.
- NEVER expose backend database passwords, payment gateway secret keys, or Supabase service_role keys in client-side code!
- Private operations must execute inside secure backend server environments or protected PostgreSQL functions with Row Level Security (RLS).

---

## 4. Key Takeaways
- Production builds produce minified, hashed static bundles in dist/.
- Single Page Applications require SPA rewrite rules to ensure deep links route to index.html.
- Never put secret credentials in client-side environment variables.`
    },
    {
      position: 5,
      title: 'Reliability, Security, and Troubleshooting',
      content: `# Lesson 5: Reliability, Security, and Troubleshooting

Deploying software is only the beginning of its lifecycle. Once an application is live in production, engineers must ensure it remains secure, available, and performant. In this lesson, you will learn essential operational practices, security boundaries, and systematic debugging techniques.

---

## 1. Defense-in-Depth & PostgreSQL Row Level Security (RLS)

A critical architectural mistake is relying solely on client-side frontend code to prevent unauthorized access. If a malicious user opens their browser DevTools, they can invoke REST API endpoints directly with any arbitrary payload.

### The Database as the Fortress:
In this platform, data isolation is enforced at the database layer using PostgreSQL Row Level Security (RLS):
- Students can only view published courses.
- Students can only read and modify their own lesson progress and quiz attempts.
- Instructors can only modify courses, lessons, and quizzes they personally own.
- Quiz answer keys are completely invisible to students, and scores are computed exclusively through secure server-side RPC functions (submit_quiz_attempt).

---

## 2. Common Production Deployment Failures

When a web deployment fails, it almost always stems from one of four categories:

1. Environment Configuration Mismatches:
   - Symptom: The app loads a blank screen or throws "Failed to fetch" errors.
   - Root Cause: Missing or typo'd VITE_SUPABASE_URL in the cloud hosting provider's dashboard settings.
2. CORS (Cross-Origin Resource Sharing) Violations:
   - Symptom: Browser console displays "Access to fetch has been blocked by CORS policy".
   - Root Cause: The backend server or database API does not allow requests originating from your production domain.
3. Database Migration Desynchronization:
   - Symptom: Features work locally but fail with HTTP 500 errors in production.
   - Root Cause: Tables, columns, or RLS security functions exist locally but were not executed in the production Supabase SQL editor.
4. Stale Asset Caching:
   - Symptom: Users see broken layouts or missing features until they perform a hard refresh.
   - Root Cause: Incorrect HTTP cache headers on HTML entry points.

---

## 3. Systematic Production Troubleshooting Checklist

When diagnosing a production issue, follow this five-step verification checklist:

[Step 1: Check Network Tab in DevTools]
  - Does index.html return HTTP 200?
  - Are .js and .css bundles loading without 404 errors?
  - What HTTP status code do REST API calls return? (401 = Auth, 403 = RLS/Permissions, 404 = Route, 500 = Server)

[Step 2: Inspect Browser Console]
  - Are there uncaught JavaScript exceptions?
  - Are environment variables defined or returning 'undefined'?

[Step 3: Verify Authentication State]
  - Is the user's JWT access token present in storage?
  - Has the session expired or been revoked?

[Step 4: Verify Database Policies (RLS)]
  - Does the authenticated user have the expected role in public.profiles?
  - Does the RLS policy explicitly permit the requested action (SELECT, INSERT, UPDATE, DELETE)?

[Step 5: Review Server and Database Logs]
  - Check the Supabase PostgreSQL logs or cloud host runtime logs for exact error messages.

Congratulations! You have completed Cloud Computing and Web Hosting Essentials. Proceed to the course quiz to demonstrate your knowledge.`
    }
  ],
  quiz: {
    title: 'Cloud Computing & Web Hosting Assessment',
    questions: [
      {
        position: 1,
        text: 'Which cloud service model provides a managed application runtime environment where developers deploy code without maintaining the underlying OS kernel or server hardware?',
        correctIndex: 0,
        options: [
          'Platform as a Service (PaaS)',
          'Infrastructure as a Service (IaaS)',
          'Software as a Service (SaaS)',
          'On-premises bare metal colocation'
        ]
      },
      {
        position: 2,
        text: 'What does the NIST cloud computing characteristic of "rapid elasticity" mean?',
        correctIndex: 0,
        options: [
          'Computing resources can be dynamically scaled up or down in real time to match fluctuating demand.',
          'Physical servers can be relocated to another data center without network downtime.',
          'Source code is automatically rewritten into multiple programming languages.',
          'Billing invoices are postponed until a project reaches commercial launch.'
        ]
      },
      {
        position: 3,
        text: 'Which cloud storage category is best suited for storing and serving static assets like images, videos, and PDF notes directly over HTTP?',
        correctIndex: 0,
        options: [
          'Object Storage (e.g., Amazon S3, Supabase Storage buckets)',
          'Block Storage (e.g., EBS volume attached to a VM)',
          'Local virtual machine volatile swap disk',
          'Hardware CPU cache memory registers'
        ]
      },
      {
        position: 4,
        text: 'Why do major cloud providers structure geographical regions into multiple distinct "Availability Zones" (AZs)?',
        correctIndex: 0,
        options: [
          'To provide fault isolation with independent power and cooling so an outage in one AZ does not take down the entire region.',
          'To comply with municipal tax requirements across adjacent zip codes.',
          'To reserve different data centers for different programming languages.',
          'To enforce international export restriction treaties between neighboring buildings.'
        ]
      },
      {
        position: 5,
        text: 'Which DNS record type maps an alias subdomain (such as www.edulearn.org) directly to another canonical domain name?',
        correctIndex: 0,
        options: [
          'CNAME record',
          'A record',
          'MX record',
          'TXT record'
        ]
      },
      {
        position: 6,
        text: 'What is the primary role of a Certificate Authority (CA) in HTTPS web communication?',
        correctIndex: 0,
        options: [
          'Cryptographically signing and issuing TLS certificates to verify server domain ownership to visiting browsers.',
          'Caching static assets globally to decrease edge download latency.',
          'Executing database queries when backend servers experience high load.',
          'Filtering SQL injection attacks before requests reach the web application.'
        ]
      },
      {
        position: 7,
        text: 'Why must static hosting providers for Single Page Applications (SPAs) configure an SPA Rewrite rule returning index.html for unknown routes?',
        correctIndex: 0,
        options: [
          'Client-side routing is handled in-browser by JavaScript, so physical subdirectories do not exist on the web server disk.',
          'Browsers refuse to render CSS files if any HTML document is named anything other than index.html.',
          'To block automated web crawlers and security vulnerability scanners from indexing child URLs.',
          'To encrypt URLs before sending them to the PostgreSQL database.'
        ]
      },
      {
        position: 8,
        text: 'Where should secret database credentials or administrative service-role keys be stored in a modern web architecture?',
        correctIndex: 0,
        options: [
          'Securely in backend server environment variables or secret managers, never exposed in client bundles.',
          'Inside index.html meta tags so client browsers can initialize backend sessions immediately.',
          'In public GitHub repositories inside the project README file.',
          'In localStorage so JavaScript components can share them across browser tabs.'
        ]
      },
      {
        position: 9,
        text: 'In a multi-tenant cloud application using PostgreSQL, what is the most robust mechanism to ensure users can only query their own data?',
        correctIndex: 0,
        options: [
          'PostgreSQL Row Level Security (RLS) policies evaluated directly in the database engine.',
          'Hiding UI buttons and action links in the client-side React code.',
          'Storing all user records in an unencrypted client browser cookie.',
          'Renaming database tables and column names with randomized hashes.'
        ]
      },
      {
        position: 10,
        text: 'What does an HTTP 502 Bad Gateway response indicate when troubleshooting a web application?',
        correctIndex: 0,
        options: [
          'A reverse proxy or gateway server received an invalid or failing response from the upstream application server.',
          'The user submitted valid credentials but lacks authorization to view the requested resource.',
          'The requested URL was not found on the origin server.',
          'The DNS nameserver has expired and needs to be renewed by the registrar.'
        ]
      }
    ]
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedCourse(instructorEmail, instructorPassword, courseDef) {
  console.log(`\n--- Seeding Course: "${courseDef.title}" ---`);
  console.log(`Authenticating as ${instructorEmail}...`);
  const inst = await login(instructorEmail, instructorPassword);
  console.log(`✔ Authenticated ${instructorEmail} (${inst.user.id})`);

  // 1. Course Lookup / Upsert
  const courseLookup = await apiFetch(`courses?instructor_id=eq.${inst.user.id}&title=eq.${encodeURIComponent(courseDef.title)}&select=*`, { method: 'GET' }, inst.token);
  if (!courseLookup.ok) {
    throw new Error(`Failed to lookup course "${courseDef.title}": ${JSON.stringify(courseLookup.data)}`);
  }
  let courseId = null;

  if (courseLookup.data && courseLookup.data.length > 0) {
    courseId = courseLookup.data[0].id;
    console.log(`Course exists (ID: ${courseId}). Updating description and published state...`);
    await apiFetch(`courses?id=eq.${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        description: courseDef.description,
        is_published: courseDef.is_published
      })
    }, inst.token);
  } else {
    console.log(`Creating new course "${courseDef.title}"...`);
    const createRes = await apiFetch('courses', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        instructor_id: inst.user.id,
        title: courseDef.title,
        description: courseDef.description,
        is_published: courseDef.is_published
      })
    }, inst.token);
    if (!createRes.ok || !createRes.data?.[0]) {
      throw new Error(`Failed to create course: ${JSON.stringify(createRes.data)}`);
    }
    courseId = createRes.data[0].id;
    console.log(`✔ Created course with ID: ${courseId}`);
  }
  await sleep(40);

  // 2. Lessons Upsert
  console.log(`Seeding ${courseDef.lessons.length} lessons...`);
  for (const lesson of courseDef.lessons) {
    const lessonLookup = await apiFetch(`lessons?course_id=eq.${courseId}&position=eq.${lesson.position}&select=*`, { method: 'GET' }, inst.token);
    if (!lessonLookup.ok) {
      throw new Error(`Failed to lookup lesson ${lesson.position}: ${JSON.stringify(lessonLookup.data)}`);
    }
    if (lessonLookup.data && lessonLookup.data.length > 0) {
      const lessonId = lessonLookup.data[0].id;
      await apiFetch(`lessons?id=eq.${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: lesson.title,
          content: lesson.content
        })
      }, inst.token);
      console.log(`  ✔ Updated Lesson ${lesson.position}: ${lesson.title}`);
    } else {
      const lCreate = await apiFetch('lessons', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          course_id: courseId,
          title: lesson.title,
          content: lesson.content,
          position: lesson.position
        })
      }, inst.token);
      if (!lCreate.ok) {
        throw new Error(`Failed to create lesson ${lesson.position}: ${JSON.stringify(lCreate.data)}`);
      }
      console.log(`  ✔ Created Lesson ${lesson.position}: ${lesson.title}`);
    }
    await sleep(40);
  }

  // 3. Quiz Lookup / Upsert
  console.log(`Seeding quiz: "${courseDef.quiz.title}"...`);
  const quizLookup = await apiFetch(`quizzes?course_id=eq.${courseId}&title=eq.${encodeURIComponent(courseDef.quiz.title)}&select=*`, { method: 'GET' }, inst.token);
  if (!quizLookup.ok) {
    throw new Error(`Failed to lookup quiz "${courseDef.quiz.title}": ${JSON.stringify(quizLookup.data)}`);
  }
  let quizId = null;

  if (quizLookup.data && quizLookup.data.length > 0) {
    quizId = quizLookup.data[0].id;
    console.log(`Quiz exists (ID: ${quizId}).`);
  } else {
    const qCreate = await apiFetch('quizzes', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        course_id: courseId,
        title: courseDef.quiz.title
      })
    }, inst.token);
    if (!qCreate.ok || !qCreate.data?.[0]) {
      throw new Error(`Failed to create quiz: ${JSON.stringify(qCreate.data)}`);
    }
    quizId = qCreate.data[0].id;
    console.log(`✔ Created Quiz (ID: ${quizId})`);
  }
  await sleep(40);

  // 4. Questions, Options & Answer Keys
  console.log(`Seeding ${courseDef.quiz.questions.length} questions and answer keys...`);
  for (const q of courseDef.quiz.questions) {
    let questionId = null;
    const qLookup = await apiFetch(`quiz_questions?quiz_id=eq.${quizId}&position=eq.${q.position}&select=*`, { method: 'GET' }, inst.token);
    if (!qLookup.ok) {
      throw new Error(`Failed to lookup question ${q.position}: ${JSON.stringify(qLookup.data)}`);
    }
    if (qLookup.data && qLookup.data.length > 0) {
      questionId = qLookup.data[0].id;
      await apiFetch(`quiz_questions?id=eq.${questionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ question_text: q.text })
      }, inst.token);
    } else {
      const qCreate = await apiFetch('quiz_questions', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          quiz_id: quizId,
          question_text: q.text,
          position: q.position
        })
      }, inst.token);
      if (!qCreate.ok || !qCreate.data?.[0]) {
        throw new Error(`Failed to create question ${q.position}: ${JSON.stringify(qCreate.data)}`);
      }
      questionId = qCreate.data[0].id;
    }
    await sleep(30);

    // Options
    const optionIds = [];
    for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
      const optText = q.options[optIdx];
      const optPos = optIdx + 1;
      const optLookup = await apiFetch(`quiz_options?question_id=eq.${questionId}&position=eq.${optPos}&select=*`, { method: 'GET' }, inst.token);
      if (!optLookup.ok) {
        throw new Error(`Failed to lookup option ${optPos} for Q${q.position}: ${JSON.stringify(optLookup.data)}`);
      }
      let optId = null;
      if (optLookup.data && optLookup.data.length > 0) {
        optId = optLookup.data[0].id;
        await apiFetch(`quiz_options?id=eq.${optId}`, {
          method: 'PATCH',
          body: JSON.stringify({ option_text: optText })
        }, inst.token);
      } else {
        const optCreate = await apiFetch('quiz_options', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            question_id: questionId,
            option_text: optText,
            position: optPos
          })
        }, inst.token);
        if (!optCreate.ok || !optCreate.data?.[0]) {
          throw new Error(`Failed to create option ${optPos} for Q${q.position}: ${JSON.stringify(optCreate.data)}`);
        }
        optId = optCreate.data[0].id;
      }
      optionIds.push(optId);
      await sleep(20);
    }

    // Answer Key
    const correctOptionId = optionIds[q.correctIndex];
    const keyLookup = await apiFetch(`quiz_answer_keys?question_id=eq.${questionId}&select=*`, { method: 'GET' }, inst.token);
    if (!keyLookup.ok) {
      throw new Error(`Failed to lookup answer key for Q${q.position}: ${JSON.stringify(keyLookup.data)}`);
    }
    if (keyLookup.data && keyLookup.data.length > 0) {
      await apiFetch(`quiz_answer_keys?question_id=eq.${questionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ correct_option_id: correctOptionId })
      }, inst.token);
    } else {
      const keyCreate = await apiFetch('quiz_answer_keys', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          question_id: questionId,
          correct_option_id: correctOptionId
        })
      }, inst.token);
      if (!keyCreate.ok) {
        throw new Error(`Failed to set answer key for Q${q.position}: ${JSON.stringify(keyCreate.data)}`);
      }
    }
    await sleep(20);
  }
  console.log(`✔ Completed seeding Q&A for Quiz "${courseDef.quiz.title}"`);
  return { courseId, quizId };
}

async function enrollStudent(email, password, courseIds) {
  const student = await login(email, password);
  for (const courseId of courseIds) {
    const existing = await apiFetch(`enrollments?student_id=eq.${student.user.id}&course_id=eq.${courseId}`, { method: 'GET' }, student.token);
    if (!existing.data || existing.data.length === 0) {
      const enrollRes = await apiFetch('enrollments', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          student_id: student.user.id,
          course_id: courseId
        })
      }, student.token);
      if (!enrollRes.ok) {
        throw new Error(`Failed to enroll ${email} in course ${courseId}: ${JSON.stringify(enrollRes.data)}`);
      }
      console.log(`✔ Enrolled ${email} in course ${courseId}`);
    } else {
      console.log(`✔ ${email} is already enrolled in course ${courseId}`);
    }
  }
}

async function main() {
  console.log('===========================================================');
  console.log('   EduLearn — Presentation Demo Course Seeder             ');
  console.log('===========================================================');

  try {
    const courseA = await seedCourse('instructor1.demo@example.com', 'Instructor123!', COURSE_A);
    const courseB = await seedCourse('instructor2.demo@example.com', 'Instructor456!', COURSE_B);

    console.log('\n--- Enrolling Demo Students in Both Courses ---');
    await enrollStudent('student1.demo@example.com', 'Student123!', [courseA.courseId, courseB.courseId]);
    await enrollStudent('student2.demo@example.com', 'Student456!', [courseA.courseId, courseB.courseId]);

    console.log('\n===========================================================');
    console.log('✔ DEMO COURSES & STUDENT ENROLLMENTS SEEDED SUCCESSFULLY!');
    console.log(`Course A ID: ${courseA.courseId} (Quiz ID: ${courseA.quizId})`);
    console.log(`Course B ID: ${courseB.courseId} (Quiz ID: ${courseB.quizId})`);
    console.log('Both students enrolled in Course A & Course B');
    console.log('===========================================================');
  } catch (err) {
    console.error('\n❌ SEEDING FAILED:', err.message);
    process.exit(1);
  }
}

main();
