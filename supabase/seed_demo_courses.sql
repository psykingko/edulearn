-- ==============================================================================
-- EduLearn — Presentation-Ready Demo Courses Seed Script
-- File: supabase/seed_demo_courses.sql
-- 
-- Populates the database with two complete, presentation-ready courses:
-- 1. "Web Development Foundations — HTML & CSS" (Owned by instructor1.demo@example.com)
--    - 5 substantive lessons with real curriculum and code examples
--    - 1 certification assessment quiz with 10 questions, 40 options, and secure answer keys
--
-- 2. "Cloud Computing and Web Hosting Essentials" (Owned by instructor2.demo@example.com)
--    - 5 substantive lessons with architectural diagrams and deployment guides
--    - 1 certification assessment quiz with 10 questions, 40 options, and secure answer keys
--
-- Idempotent: Can be run multiple times safely without creating duplicates.
-- Security: Resolves real demo instructor accounts; verifies instructor roles;
--           stores answer keys strictly in private quiz_answer_keys;
--           never exposes is_correct flag to student-visible quiz_options.
-- ==============================================================================

DO $$
DECLARE
  -- Instructor IDs & Roles
  v_inst1_id UUID;
  v_inst1_role TEXT;
  v_inst2_id UUID;
  v_inst2_role TEXT;

  -- Course IDs
  v_course_a_id UUID;
  v_course_b_id UUID;

  -- Quiz IDs
  v_quiz_a_id UUID;
  v_quiz_b_id UUID;

  -- Transient Question & Option IDs
  v_q_id UUID;
  v_opt1_id UUID;
  v_opt2_id UUID;
  v_opt3_id UUID;
  v_opt4_id UUID;
  v_correct_opt_id UUID;

  -- Demo Student IDs
  v_student1_id UUID;
  v_student2_id UUID;

BEGIN
  RAISE NOTICE '--- Starting EduLearn Demo Course Seeding ---';

  -- ============================================================================
  -- 1. VERIFY DEMO INSTRUCTOR ACCOUNTS
  -- ============================================================================
  SELECT p.id, p.role INTO v_inst1_id, v_inst1_role
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE u.email = 'instructor1.demo@example.com';

  IF v_inst1_id IS NULL THEN
    RAISE EXCEPTION 'Instructor 1 (instructor1.demo@example.com) was not found in auth.users/profiles. Please run supabase/seed_demo_accounts.sql first.';
  END IF;

  IF v_inst1_role <> 'instructor' THEN
    RAISE EXCEPTION 'Instructor 1 has role "%" instead of "instructor". Please verify profile assignments in seed_demo_accounts.sql.', v_inst1_role;
  END IF;

  SELECT p.id, p.role INTO v_inst2_id, v_inst2_role
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE u.email = 'instructor2.demo@example.com';

  IF v_inst2_id IS NULL THEN
    RAISE EXCEPTION 'Instructor 2 (instructor2.demo@example.com) was not found in auth.users/profiles. Please run supabase/seed_demo_accounts.sql first.';
  END IF;

  IF v_inst2_role <> 'instructor' THEN
    RAISE EXCEPTION 'Instructor 2 has role "%" instead of "instructor". Please verify profile assignments in seed_demo_accounts.sql.', v_inst2_role;
  END IF;

  RAISE NOTICE '✔ Verified Instructor 1 ID: %', v_inst1_id;
  RAISE NOTICE '✔ Verified Instructor 2 ID: %', v_inst2_id;


  -- ============================================================================
  -- 2. SEED COURSE A: Web Development Foundations — HTML & CSS
  --    Instructor: Dr. Sarah Connor (instructor1.demo@example.com)
  -- ============================================================================
  SELECT id INTO v_course_a_id
  FROM public.courses
  WHERE instructor_id = v_inst1_id AND title = 'Web Development Foundations — HTML & CSS';

  IF v_course_a_id IS NULL THEN
    INSERT INTO public.courses (instructor_id, title, description, is_published, created_at, updated_at)
    VALUES (
      v_inst1_id,
      'Web Development Foundations — HTML & CSS',
      'A beginner-friendly, practical introduction to building structured, styled, responsive web pages using HTML5 and CSS3.',
      true,
      now(),
      now()
    )
    RETURNING id INTO v_course_a_id;
    RAISE NOTICE '✔ Created Course A: %', v_course_a_id;
  ELSE
    UPDATE public.courses
    SET description = 'A beginner-friendly, practical introduction to building structured, styled, responsive web pages using HTML5 and CSS3.',
        is_published = true,
        updated_at = now()
    WHERE id = v_course_a_id;
    RAISE NOTICE '✔ Updated existing Course A: %', v_course_a_id;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Course A: Lessons (Positions 1 to 5)
  -- ----------------------------------------------------------------------------
  -- Lesson 1
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_a_id,
    'HTML Fundamentals and Document Structure',
    '# Lesson 1: HTML Fundamentals and Document Structure

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
- Always supply descriptive alt text for images and secure rel attributes for external links.',
    1,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 2
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_a_id,
    'Semantic HTML and Accessible Forms',
    '# Lesson 2: Semantic HTML and Accessible Forms

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
- Never use placeholder text as a replacement for accessible labels.',
    2,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 3
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_a_id,
    'CSS Fundamentals and the Box Model',
    '# Lesson 3: CSS Fundamentals and the Box Model

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

- rem (Root EM): Relative to the root <html> font size (default 16px). 1rem = 16px, 1.5rem = 24px, 0.75rem = 12px. Using rem respects the user''s browser accessibility font scaling.
- em: Relative to the font size of the immediate parent element. Great for padding buttons proportionally to their text size.
- %: Relative to the parent element''s dimensions.
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
- Use rem for font sizes and spacing to preserve accessibility.',
    3,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 4
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_a_id,
    'Layouts with Flexbox and CSS Grid',
    '# Lesson 4: Layouts with Flexbox and CSS Grid

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
- Leverage gap for clean, consistent spacing between items on both Flex and Grid containers.',
    4,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 5
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_a_id,
    'Responsive Web Design and Final Practice',
    '# Lesson 5: Responsive Web Design and Final Practice

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

Congratulations! You have completed the five lessons of Web Development Foundations. Proceed to the course quiz to verify your comprehension!',
    5,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  RAISE NOTICE '✔ Seeded 5 Lessons for Course A';

  -- ----------------------------------------------------------------------------
  -- Course A: Quiz
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_quiz_a_id
  FROM public.quizzes
  WHERE course_id = v_course_a_id AND title = 'Web Development Foundations Assessment';

  IF v_quiz_a_id IS NULL THEN
    INSERT INTO public.quizzes (course_id, title, created_at, updated_at)
    VALUES (v_course_a_id, 'Web Development Foundations Assessment', now(), now())
    RETURNING id INTO v_quiz_a_id;
    RAISE NOTICE '✔ Created Quiz A: %', v_quiz_a_id;
  ELSE
    UPDATE public.quizzes SET updated_at = now() WHERE id = v_quiz_a_id;
    RAISE NOTICE '✔ Reusing existing Quiz A: %', v_quiz_a_id;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Quiz A: Questions, Options & Protected Answer Keys (10 Questions)
  -- ----------------------------------------------------------------------------

  -- Q1 (Lesson 1)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'What is the primary function of the <!DOCTYPE html> declaration at the beginning of an HTML file?', 1)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It instructs the browser to render the document in modern HTML5 standards mode.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It links external CSS stylesheets and fonts automatically.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It initializes the browser JavaScript runtime engine.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It sets the language code and database character encoding.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q2 (Lesson 1)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'When opening an external link in a new tab with target="_blank", which security attribute combination is strongly recommended?', 2)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'rel="noopener noreferrer"', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'rel="external-security"', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'target="sandbox-mode"', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'type="application/secure-link"', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q3 (Lesson 2)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'Why is using semantic <main> preferred over a generic <div id="main"> container?', 3)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '<main> provides an accessible landmark for assistive technologies and search engine indexers.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '<main> automatically centers all child text content horizontally.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '<main> enables CSS Grid layout by default without requiring CSS.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '<main> prevents JavaScript from accessing child form inputs.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q4 (Lesson 2)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'Which HTML attribute explicitly pairs a <label> with its corresponding <input> element?', 4)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The label "for" attribute matching the input "id" attribute.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The label "name" attribute matching the input "name" attribute.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The label "aria-describedby" attribute matching the input "placeholder".', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The input "label-ref" attribute matching the form "id".', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q5 (Lesson 3)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'What is the behavior of "box-sizing: border-box" compared to the browser default "content-box"?', 5)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Padding and border are included inside the declared width and height.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Margins are automatically collapsed to zero across all child elements.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Padding is added on top of the declared width, expanding element boundaries.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The element is rendered with rounded corners and dropshadow styling.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q6 (Lesson 3)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'According to standard CSS specificity rules (without !important), which selector has the highest specificity weight?', 6)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '#primary-navigation (ID selector: 0,1,0,0)', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '.card-title.active.highlight (Three class selectors: 0,0,3,0)', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'header nav ul li a (Five element selectors: 0,0,0,5)', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, '* (Universal selector: 0,0,0,0)', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q7 (Lesson 4)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'Which layout scenario is best solved by CSS Grid rather than Flexbox?', 7)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'A 2D dashboard photo gallery requiring alignment across both rows and columns simultaneously.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'A horizontal navigation bar with a logo on the left and links on the right.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Centering an icon horizontally and vertically inside a circular button.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'A linear vertical list of input fields inside an account settings modal.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q8 (Lesson 4)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'In Flexbox, which property controls the alignment of child items along the cross axis (perpendicular to flex-direction)?', 8)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'align-items', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'justify-content', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'flex-direction', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'flex-basis', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q9 (Lesson 5)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'What is the core philosophy of a "mobile-first" responsive design strategy?', 9)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Writing base CSS for compact screens first, then adding complexity using min-width media queries.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Writing desktop CSS as default and hiding elements on mobile using max-width queries.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Serving completely separate HTML pages to mobile browsers via user-agent sniffing.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Disabling horizontal scrolling on desktop monitors by setting width: 100vw.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q10 (Lesson 5)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_a_id, 'Why is setting "outline: none" on interactive elements without an accessible replacement considered a critical defect?', 10)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It strips visual focus indicators, leaving keyboard navigation users unable to see which element is active.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It forces the browser to recompute layout on every mouse movement.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It causes form inputs to submit empty strings when clicked with a mouse.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'It increases CSS bundle size by triggering vendor prefix warnings.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  RAISE NOTICE '✔ Seeded Quiz A with 10 questions, 40 options, and 10 protected answer keys';


  -- ============================================================================
  -- 3. SEED COURSE B: Cloud Computing and Web Hosting Essentials
  --    Instructor: Prof. John Matrix (instructor2.demo@example.com)
  -- ============================================================================
  SELECT id INTO v_course_b_id
  FROM public.courses
  WHERE instructor_id = v_inst2_id AND title = 'Cloud Computing and Web Hosting Essentials';

  IF v_course_b_id IS NULL THEN
    INSERT INTO public.courses (instructor_id, title, description, is_published, created_at, updated_at)
    VALUES (
      v_inst2_id,
      'Cloud Computing and Web Hosting Essentials',
      'An introductory, practical course explaining cloud computing and how a web application becomes accessible over the internet.',
      true,
      now(),
      now()
    )
    RETURNING id INTO v_course_b_id;
    RAISE NOTICE '✔ Created Course B: %', v_course_b_id;
  ELSE
    UPDATE public.courses
    SET description = 'An introductory, practical course explaining cloud computing and how a web application becomes accessible over the internet.',
        is_published = true,
        updated_at = now()
    WHERE id = v_course_b_id;
    RAISE NOTICE '✔ Updated existing Course B: %', v_course_b_id;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Course B: Lessons (Positions 1 to 5)
  -- ----------------------------------------------------------------------------
  -- Lesson 1
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_b_id,
    'Introduction to Cloud Computing',
    '# Lesson 1: Introduction to Cloud Computing

Welcome to Cloud Computing and Web Hosting Essentials. In this course, you will demystify how web applications transition from code running on a local development laptop to scalable, resilient services accessible worldwide 24/7 over the internet.

---

## 1. What is Cloud Computing?

Historically, companies had to purchase physical servers, rack them in climate-controlled server rooms, configure uninterruptible power supplies (UPS), configure network switches, and hire teams for physical security and hardware maintenance.

According to the National Institute of Standards and Technology (NIST), Cloud Computing is a model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources (networks, servers, storage, applications, and services) that can be rapidly provisioned with minimal management effort or service provider interaction.

### Five Fundamental Characteristics:
1. On-Demand Self-Service: You can provision computing resources (like spinning up a virtual machine or PostgreSQL database) automatically via API or web console without human intervention from the service provider.
2. Broad Network Access: Services are accessible via standard network mechanisms across diverse client platforms (web browsers, mobile devices, IoT endpoints).
3. Resource Pooling: The provider''s physical computing resources are pooled together to serve multiple customers (multi-tenancy), dynamically assigning and reassigning physical and virtual resources according to consumer demand.
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
- Cons: Constrained by the platform''s supported runtimes and execution limits.

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
- Elasticity allows systems to dynamically accommodate unpredictable user workloads.',
    1,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 2
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_b_id,
    'Compute, Storage, and Networking',
    '# Lesson 2: Compute, Storage, and Networking

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
- Isolate databases in private subnets and restrict public access strictly to necessary HTTPS endpoints.',
    2,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 3
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_b_id,
    'Domains, DNS, HTTP, and HTTPS',
    '# Lesson 3: Domains, DNS, HTTP, and HTTPS

Have you ever wondered what happens in the milliseconds between typing a URL into your browser''s address bar and the web page appearing on your screen? In this lesson, you will trace the journey of an internet request through domain names, DNS resolution, and secure HTTPS handshakes.

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
3. Authentication: Digital certificates issued by trusted Certificate Authorities (CAs) like Let''s Encrypt verify that the client is communicating with the legitimate server, preventing Man-in-the-Middle (MitM) impersonation.

---

## 4. Key Takeaways
- DNS translates human-friendly domain names into IP addresses.
- Use CNAME records to alias custom subdomains to cloud providers.
- HTTPS is mandatory for every modern web application to protect user authentication tokens and ensure data integrity.',
    3,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 4
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_b_id,
    'Deploying a Web Application',
    '# Lesson 4: Deploying a Web Application

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
- Variables prefixed with VITE_ or REACT_APP_ are embedded directly into the public JavaScript bundle downloaded by every user''s browser.
- NEVER expose backend database passwords, payment gateway secret keys, or Supabase service_role keys in client-side code!
- Private operations must execute inside secure backend server environments or protected PostgreSQL functions with Row Level Security (RLS).

---

## 4. Key Takeaways
- Production builds produce minified, hashed static bundles in dist/.
- Single Page Applications require SPA rewrite rules to ensure deep links route to index.html.
- Never put secret credentials in client-side environment variables.',
    4,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  -- Lesson 5
  INSERT INTO public.lessons (course_id, title, content, position, created_at, updated_at)
  VALUES (
    v_course_b_id,
    'Reliability, Security, and Troubleshooting',
    '# Lesson 5: Reliability, Security, and Troubleshooting

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
   - Root Cause: Missing or typo''d VITE_SUPABASE_URL in the cloud hosting provider''s dashboard settings.
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
  - Are environment variables defined or returning ''undefined''?

[Step 3: Verify Authentication State]
  - Is the user''s JWT access token present in storage?
  - Has the session expired or been revoked?

[Step 4: Verify Database Policies (RLS)]
  - Does the authenticated user have the expected role in public.profiles?
  - Does the RLS policy explicitly permit the requested action (SELECT, INSERT, UPDATE, DELETE)?

[Step 5: Review Server and Database Logs]
  - Check the Supabase PostgreSQL logs or cloud host runtime logs for exact error messages.

Congratulations! You have completed Cloud Computing and Web Hosting Essentials. Proceed to the course quiz to demonstrate your knowledge.',
    5,
    now(),
    now()
  )
  ON CONFLICT (course_id, position)
  DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();

  RAISE NOTICE '✔ Seeded 5 Lessons for Course B';

  -- ----------------------------------------------------------------------------
  -- Course B: Quiz
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_quiz_b_id
  FROM public.quizzes
  WHERE course_id = v_course_b_id AND title = 'Cloud Computing & Web Hosting Assessment';

  IF v_quiz_b_id IS NULL THEN
    INSERT INTO public.quizzes (course_id, title, created_at, updated_at)
    VALUES (v_course_b_id, 'Cloud Computing & Web Hosting Assessment', now(), now())
    RETURNING id INTO v_quiz_b_id;
    RAISE NOTICE '✔ Created Quiz B: %', v_quiz_b_id;
  ELSE
    UPDATE public.quizzes SET updated_at = now() WHERE id = v_quiz_b_id;
    RAISE NOTICE '✔ Reusing existing Quiz B: %', v_quiz_b_id;
  END IF;

  -- ----------------------------------------------------------------------------
  -- Quiz B: Questions, Options & Protected Answer Keys (10 Questions)
  -- ----------------------------------------------------------------------------

  -- Q1 (Lesson 1)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'Which cloud service model provides a managed application runtime environment where developers deploy code without maintaining the underlying OS kernel or server hardware?', 1)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Platform as a Service (PaaS)', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Infrastructure as a Service (IaaS)', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Software as a Service (SaaS)', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'On-premises bare metal colocation', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q2 (Lesson 1)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'What does the NIST cloud computing characteristic of "rapid elasticity" mean?', 2)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Computing resources can be dynamically scaled up or down in real time to match fluctuating demand.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Physical servers can be relocated to another data center without network downtime.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Source code is automatically rewritten into multiple programming languages.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Billing invoices are postponed until a project reaches commercial launch.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q3 (Lesson 2)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'Which cloud storage category is best suited for storing and serving static assets like images, videos, and PDF notes directly over HTTP?', 3)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Object Storage (e.g., Amazon S3, Supabase Storage buckets)', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Block Storage (e.g., EBS volume attached to a VM)', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Local virtual machine volatile swap disk', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Hardware CPU cache memory registers', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q4 (Lesson 2)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'Why do major cloud providers structure geographical regions into multiple distinct "Availability Zones" (AZs)?', 4)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'To provide fault isolation with independent power and cooling so an outage in one AZ does not take down the entire region.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'To comply with municipal tax requirements across adjacent zip codes.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'To reserve different data centers for different programming languages.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'To enforce international export restriction treaties between neighboring buildings.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q5 (Lesson 3)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'Which DNS record type maps an alias subdomain (such as www.edulearn.org) directly to another canonical domain name?', 5)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'CNAME record', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'A record', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'MX record', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'TXT record', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q6 (Lesson 3)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'What is the primary role of a Certificate Authority (CA) in HTTPS web communication?', 6)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Cryptographically signing and issuing TLS certificates to verify server domain ownership to visiting browsers.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Caching static assets globally to decrease edge download latency.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Executing database queries when backend servers experience high load.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Filtering SQL injection attacks before requests reach the web application.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q7 (Lesson 4)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'Why must static hosting providers for Single Page Applications (SPAs) configure an SPA Rewrite rule returning index.html for unknown routes?', 7)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Client-side routing is handled in-browser by JavaScript, so physical subdirectories do not exist on the web server disk.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Browsers refuse to render CSS files if any HTML document is named anything other than index.html.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'To block automated web crawlers and security vulnerability scanners from indexing child URLs.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'To encrypt URLs before sending them to the PostgreSQL database.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q8 (Lesson 4)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'Where should secret database credentials or administrative service-role keys be stored in a modern web architecture?', 8)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Securely in backend server environment variables or secret managers, never exposed in client bundles.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Inside index.html meta tags so client browsers can initialize backend sessions immediately.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'In public GitHub repositories inside the project README file.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'In localStorage so JavaScript components can share them across browser tabs.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q9 (Lesson 5)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'In a multi-tenant cloud application using PostgreSQL, what is the most robust mechanism to ensure users can only query their own data?', 9)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'PostgreSQL Row Level Security (RLS) policies evaluated directly in the database engine.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Hiding UI buttons and action links in the client-side React code.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Storing all user records in an unencrypted client browser cookie.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'Renaming database tables and column names with randomized hashes.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  -- Q10 (Lesson 5)
  INSERT INTO public.quiz_questions (quiz_id, question_text, position)
  VALUES (v_quiz_b_id, 'What does an HTTP 502 Bad Gateway response indicate when troubleshooting a web application?', 10)
  ON CONFLICT (quiz_id, position) DO UPDATE SET question_text = EXCLUDED.question_text RETURNING id INTO v_q_id;

  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'A reverse proxy or gateway server received an invalid or failing response from the upstream application server.', 1)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt1_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The user submitted valid credentials but lacks authorization to view the requested resource.', 2)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt2_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The requested URL was not found on the origin server.', 3)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt3_id;
  INSERT INTO public.quiz_options (question_id, option_text, position) VALUES
    (v_q_id, 'The DNS nameserver has expired and needs to be renewed by the registrar.', 4)
    ON CONFLICT (question_id, position) DO UPDATE SET option_text = EXCLUDED.option_text RETURNING id INTO v_opt4_id;

  INSERT INTO public.quiz_answer_keys (question_id, correct_option_id) VALUES (v_q_id, v_opt1_id)
  ON CONFLICT (question_id) DO UPDATE SET correct_option_id = EXCLUDED.correct_option_id;

  RAISE NOTICE '✔ Seeded Quiz B with 10 questions, 40 options, and 10 protected answer keys';

  -- ============================================================================
  -- 3.3 DEMO STUDENT ENROLLMENTS
  -- Enroll both demo students into both demo courses for immediate demonstration
  -- ============================================================================
  SELECT id INTO v_student1_id FROM auth.users WHERE email = 'student1.demo@example.com';
  SELECT id INTO v_student2_id FROM auth.users WHERE email = 'student2.demo@example.com';

  IF v_student1_id IS NOT NULL THEN
    INSERT INTO public.enrollments (student_id, course_id)
    VALUES 
      (v_student1_id, v_course_a_id),
      (v_student1_id, v_course_b_id)
    ON CONFLICT (student_id, course_id) DO NOTHING;
    RAISE NOTICE '✔ Enrolled student1.demo@example.com in both demo courses';
  END IF;

  IF v_student2_id IS NOT NULL THEN
    INSERT INTO public.enrollments (student_id, course_id)
    VALUES 
      (v_student2_id, v_course_a_id),
      (v_student2_id, v_course_b_id)
    ON CONFLICT (student_id, course_id) DO NOTHING;
    RAISE NOTICE '✔ Enrolled student2.demo@example.com in both demo courses';
  END IF;

  RAISE NOTICE '--- EduLearn Demo Course Seeding Completed Successfully ---';
END $$;

-- ==============================================================================
-- 4. VERIFICATION SUMMARY
-- Query to inspect created demo courses, instructors, lessons, and quizzes
-- ==============================================================================
SELECT 
  c.id AS course_id,
  c.title AS course_title,
  p.full_name AS instructor_name,
  u.email AS instructor_email,
  c.is_published,
  (SELECT COUNT(*) FROM public.lessons l WHERE l.course_id = c.id) AS lesson_count,
  (SELECT COUNT(*) FROM public.quizzes q WHERE q.course_id = c.id) AS quiz_count
FROM public.courses c
JOIN public.profiles p ON c.instructor_id = p.id
JOIN auth.users u ON p.id = u.id
WHERE c.title IN (
  'Web Development Foundations — HTML & CSS',
  'Cloud Computing and Web Hosting Essentials'
)
ORDER BY c.title;
