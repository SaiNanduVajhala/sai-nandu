import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Project data structure with filter categories
const projectsData = [
  {
    id: 1,
    title: "Emotion-Aware Multimodal Voice Assistant",
    description: "A full-duplex conversational AI system using FastAPI and WebSockets for real-time bi-directional audio/video. Integrated MediaPipe/DeepFace for emotion analysis with end-to-end latency under 1.5s.",
    tags: ["Python", "FastAPI", "WebSockets", "OpenAI"],
    category: "ai-agents",
    github: "https://github.com/SaiNanduVajhala/Voice_Model_with_full_duplex"
  },
  {
    id: 2,
    title: "CrewAI Trading Agent",
    description: "Multi-agent Python system using CrewAI that automatically generates daily US financial market summaries. Features specialized agents for search, summarizing, and reporting.",
    tags: ["Python", "CrewAI", "Groq LLM", "YAML"],
    category: "ai-agents",
    github: "https://github.com/SaiNanduVajhala/CrewAI-Trading-Agent"
  },
  {
    id: 3,
    title: "lexiRead",
    description: "A Dyslexic-Friendly Reading Tool designed to improve accessibility and reading comprehension with custom overlays and font styling.",
    tags: ["HTML", "CSS", "JavaScript", "Accessibility"],
    category: "accessibility",
    github: "https://github.com/SaiNanduVajhala/lexiRead"
  },
  {
    id: 4,
    title: "Market Mood Trading Analysis",
    description: "A data-driven analysis proving the profitability of buying fear and selling greed in crypto markets using historical sentiment metrics.",
    tags: ["Python", "Data Analysis", "Trading Analytics"],
    category: "data-science",
    github: "https://github.com/SaiNanduVajhala/market-mood-trading-analysis"
  },
  {
    id: 5,
    title: "Semantic Search Engine",
    description: "An advanced semantic search engine leveraging NLP sentence embeddings and high-dimensional vector similarity mapping to search documents conceptually rather than by exact keywords.",
    tags: ["Python", "NLP", "SentenceTransformers", "Data Science"],
    category: "data-science",
    github: "https://github.com/SaiNanduVajhala/Semantic-Search"
  }
];


function App() {
  const [filter, setFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("hero");

  // Live GitHub Stats State with cached fallbacks
  const [githubStats, setGithubStats] = useState({
    repos: 12,
    stars: 0,
    commits: 101,
    prs: 4,
    issues: 2,
    contributions: 121,
    currentStreak: 0,
    longestStreak: 5,
    grade: "C",
    languages: [
      { name: "Python", percentage: 55.60, color: "#3572A5" },
      { name: "TypeScript", percentage: 19.25, color: "#3178C6" },
      { name: "HTML", percentage: 19.16, color: "#E34F26" },
      { name: "JavaScript", percentage: 5.12, color: "#F7DF1E" },
      { name: "PLpgSQL", percentage: 0.70, color: "#0064a5" },
      { name: "CSS", percentage: 0.17, color: "#563d7c" }
    ],
    loading: true
  });

  useEffect(() => {
    const fetchGithubData = async () => {
      try {
        const profileRes = await fetch("https://api.github.com/users/SaiNanduVajhala");
        let profileData = null;
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }

        const reposRes = await fetch("https://api.github.com/users/SaiNanduVajhala/repos?per_page=100");
        const reposData = reposRes.ok ? await reposRes.json() : [];

        let totalStars = 0;
        const langCounts = {};

        reposData.forEach(repo => {
          totalStars += repo.stargazers_count;
          if (repo.language) {
            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
          }
        });

        const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0);
        let languages = [];
        if (totalLangs > 0) {
          languages = Object.entries(langCounts)
            .map(([name, count]) => {
              let color = "#8b949e";
              if (name === "Python") color = "#3572A5";
              else if (name === "TypeScript") color = "#3178C6";
              else if (name === "HTML") color = "#E34F26";
              else if (name === "JavaScript") color = "#F7DF1E";
              else if (name === "PLpgSQL") color = "#0064a5";
              else if (name === "CSS") color = "#563d7c";
              else if (name === "Java") color = "#b07219";
              else if (name === "C++") color = "#f34b7d";

              return {
                name,
                percentage: parseFloat(((count / totalLangs) * 100).toFixed(2)),
                color
              };
            })
            .sort((a, b) => b.percentage - a.percentage);
        }

        setGithubStats({
          repos: profileData ? profileData.public_repos : 12,
          stars: totalStars || 0,
          commits: 101, // From actual GitHub statistics
          prs: 4,
          issues: 2,
          contributions: 121,
          currentStreak: 0,
          longestStreak: 5,
          grade: totalStars > 5 ? "A" : "C", // Grade calculations
          languages: languages.length > 0 ? languages : [
            { name: "Python", percentage: 55.60, color: "#3572A5" },
            { name: "TypeScript", percentage: 19.25, color: "#3178C6" },
            { name: "HTML", percentage: 19.16, color: "#E34F26" },
            { name: "JavaScript", percentage: 5.12, color: "#F7DF1E" },
            { name: "PLpgSQL", percentage: 0.70, color: "#0064a5" },
            { name: "CSS", percentage: 0.17, color: "#563d7c" }
          ],
          loading: false
        });
      } catch (err) {
        console.warn("Failed loading live GitHub stats, using cached data:", err);
        setGithubStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchGithubData();
  }, []);

  // Terminal Simulator State
  const [terminalHistory, setTerminalHistory] = useState([
    { text: "System initialized. Welcome to Sai Nandu's portfolio command line.", type: "system" },
    { text: "Type 'help' to see list of available commands.", type: "system" }
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBodyRef = useRef(null);

  // Spotlight Mouse Tracking Hook
  const useSpotlight = () => {
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };
    return { onMouseMove: handleMouseMove };
  };

  const spotlight = useSpotlight();

  // Scroll Spy logic to dynamically highlight Navbar items
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "projects", "terminal", "skills", "credentials", "contact"];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Terminal Input logic
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newHistory = [...terminalHistory, { text: `> ${terminalInput}`, type: "input" }];

    if (cmd === "help") {
      newHistory.push(
        { text: "Available commands:", type: "system" },
        { text: "  about     - Brief introduction & summary", type: "info" },
        { text: "  projects  - Show featured AI/ML projects", type: "info" },
        { text: "  skills    - List core programming & tech stack", type: "info" },
        { text: "  clear     - Clean up the terminal console screen", type: "info" }
      );
    } else if (cmd === "about") {
      newHistory.push({ text: "Sai Nandu Vajhala: AI/ML Engineering student specializing in building automated multi-agent networks, real-time voice intelligence, and cognitive full-duplex systems.", type: "success" });
    } else if (cmd === "projects") {
      newHistory.push(
        { text: "1. Emotion-Aware Multimodal Voice Assistant (FastAPI, WebSockets)", type: "success" },
        { text: "2. CrewAI Trading Agent (Autonomous summarizer)", type: "success" },
        { text: "3. lexiRead (Accessibility engine for dyslexia)", type: "success" },
        { text: "4. Market Mood Analysis (Crypto Fear & Greed analyzer)", type: "success" }
      );
    } else if (cmd === "skills") {
      newHistory.push({ text: "Languages: Python, Java, R, C | Tech: React, FastAPI, Node.js, CrewAI | DB: PostgreSQL, MongoDB, MySQL", type: "success" });
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      setTerminalInput("");
      return;
    } else {
      newHistory.push({ text: `Unknown command: '${cmd}'. Type 'help' for instructions.`, type: "error" });
    }

    setTerminalHistory(newHistory);
    setTerminalInput("");
  };

  // Scroll terminal internally to bottom without bouncing the main window
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const filteredProjects = filter === "all"
    ? projectsData
    : projectsData.filter(p => p.category === filter);

  return (
    <>
      {/* Navigation */}
      <nav>
        <div className="container nav-content">
          <a href="#" className="text-accent" style={{ fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Space Grotesk' }}>SV.</a>
          <div className="nav-links">
            <a href="#about" className={activeSection === "about" ? "nav-link-active" : ""}>About</a>
            <a href="#projects" className={activeSection === "projects" ? "nav-link-active" : ""}>Projects</a>
            <a href="#terminal" className={activeSection === "terminal" ? "nav-link-active" : ""}>Sandbox</a>
            <a href="#skills" className={activeSection === "skills" ? "nav-link-active" : ""}>Skills</a>
            <a href="#credentials" className={activeSection === "credentials" ? "nav-link-active" : ""}>Credentials</a>
            <a href="#contact" className={activeSection === "contact" ? "nav-link-active" : ""}>Contact</a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="section container" id="hero">
          <div className="hero-split">
            {/* Left: text content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.h1 variants={fadeInUp} className="heading-lg">
                Sai Nandu Vajhala.<br />
                <span className="text-accent">AI/ML Engineer.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="body-lg" style={{ marginBottom: '2rem' }}>
                BTech student in Artificial Intelligence &amp; Machine Learning.
                Building intelligent agents, real-time multimodal systems, and data-driven solutions.
              </motion.p>
              <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="#projects" className="btn btn-premium-glow">View Projects</a>
                <a
                  href="./Vajhala_Sai_Nandu_Resume.pdf"
                  download="Vajhala_Sai_Nandu_Resume.pdf"
                  className="btn-neon-border"
                >
                  <span style={{ marginRight: '8px' }}>📥</span>
                  Download Resume
                </a>
              </motion.div>
            </motion.div>

            {/* Right: 3D flip ID card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            >
              <div className="id-card-wrapper">
                <div className="id-card">

                  {/* ── FRONT ── */}
                  <div className="id-card-face id-card-front">
                    {/* Green header strip */}
                    <div className="id-card-front-top">
                      <span className="id-card-front-top-label">Portfolio ID</span>
                      <span className="id-card-front-top-company">AI/ML Engineering</span>
                    </div>

                    {/* Floating avatar circle */}
                    <div className="id-card-avatar">SN</div>

                    {/* Name / role block */}
                    <div className="id-card-front-body">
                      <span className="id-card-name">Sai Nandu Vajhala</span>
                      <span className="id-card-role">AI/ML Engineer</span>
                      <div className="id-card-divider" />
                      <span className="id-card-dept">
                        BTech · Sreyas Institute<br />
                        Hyderabad, India
                      </span>

                      {/* Decorative barcode */}
                      <div className="id-card-barcode">
                        {[3, 5, 2, 7, 4, 6, 3, 5, 2, 4, 6, 3, 7, 5, 2, 4, 6, 3, 5, 4].map((h, i) => (
                          <span key={i} style={{ width: i % 3 === 0 ? '3px' : '1.5px', height: `${h * 3}px` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── BACK ── */}
                  <div className="id-card-face id-card-back">
                    {/* Live indicator header */}
                    <div className="id-card-back-header">
                      <span className="id-card-back-header-dot" />
                      <span className="id-card-back-header-label">Contact Details</span>
                    </div>

                    {/* Email */}
                    <div className="id-card-contact-row">
                      <div className="id-card-contact-icon">✉️</div>
                      <div className="id-card-contact-info">
                        <span className="id-card-contact-label">Email</span>
                        <span className="id-card-contact-value">
                          <a href="mailto:vajhalasainandu@gmail.com">vajhalasainandu@gmail.com</a>
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="id-card-contact-row">
                      <div className="id-card-contact-icon">📍</div>
                      <div className="id-card-contact-info">
                        <span className="id-card-contact-label">Location</span>
                        <span className="id-card-contact-value">Hyderabad, India — 500047</span>
                      </div>
                    </div>

                    {/* GitHub */}
                    <div className="id-card-contact-row">
                      <div className="id-card-contact-icon">💻</div>
                      <div className="id-card-contact-info">
                        <span className="id-card-contact-label">GitHub</span>
                        <span className="id-card-contact-value">
                          <a href="https://github.com/SaiNanduVajhala" target="_blank" rel="noreferrer">
                            SaiNanduVajhala
                          </a>
                        </span>
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="id-card-contact-row">
                      <div className="id-card-contact-icon">💼</div>
                      <div className="id-card-contact-info">
                        <span className="id-card-contact-label">LinkedIn</span>
                        <span className="id-card-contact-value">
                          <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer">
                            vajhala-sai-nandu
                          </a>
                        </span>
                      </div>
                    </div>

                    <div className="id-card-back-footer">
                      <span className="id-card-back-footer-hint">Open to opportunities</span>
                      <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 6px rgba(23,178,106,0.8)' }} />
                    </div>
                  </div>
                </div>

                {/* Hover hint */}
                <div className="id-card-hint">
                  <span>↕</span> hover to flip
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="section container" id="about">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="heading-md">About Me</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
              <div>
                <p className="text-secondary" style={{ marginBottom: '1.25rem', fontSize: '1.125rem' }}>
                  I am a motivated student pursuing a BTech in Artificial Intelligence and Machine Learning at Sreyas Institute of Engineering and Technology.
                </p>
                <p className="text-secondary" style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                  I'm passionate about emerging technologies, actively building side projects ranging from CrewAI financial agents to real-time multimodal voice assistants.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="tag" style={{ color: 'var(--text-primary)' }}>OCI AI Foundations Associate</div>
                  <div className="tag" style={{ color: 'var(--text-primary)' }}>Google Cloud AI Agent Engineer</div>
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk' }}>Education</h3>
                <div style={{ marginBottom: '1.5rem', borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)' }}>BTech in AI & ML</h4>
                  <p className="text-secondary">Sreyas Institute of Engineering and Technology (2024 - 2027)</p>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>CGPA: 7.2/10</p>
                </div>
                <div style={{ marginBottom: '1.5rem', borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                  <h4 style={{ color: 'var(--text-primary)' }}>Diploma in EEE</h4>
                  <p className="text-secondary">Samskruti College of Engineering and Technology (2021 - 2024)</p>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>CGPA: 7.4/10</p>
                </div>
                <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                  <h4 style={{ color: 'var(--text-secondary)' }}>SR Digi High School</h4>
                  <p className="text-secondary">Secondary Education (2020 - 2021)</p>
                  <p className="text-secondary" style={{ fontSize: '0.875rem' }}>CGPA: 9.8/10</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Projects Section */}
        <section className="section container" id="projects">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="heading-md">
            Featured Projects
          </motion.h2>

          {/* Dynamic Category Filter Controls */}
          <div className="filter-container">
            {["all", "ai-agents", "data-science", "accessibility"].map((cat) => {
              const label = cat === "all" ? "All" : cat === "ai-agents" ? "AI Agents" : cat === "data-science" ? "Data Science" : "Accessibility";
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  className={`filter-btn ${isActive ? "active" : ""}`}
                  onClick={() => setFilter(cat)}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeFilterPill"
                      className="filter-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          <motion.div
            className="projects-grid"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="spotlight-card"
                  {...spotlight}
                >
                  <div className="spotlight-glow" style={{ top: 'var(--mouse-y)', left: 'var(--mouse-x)' }}></div>
                  <div className="spotlight-content">
                    <h3>{project.title}</h3>
                    <p className="text-secondary" style={{ marginTop: '1rem' }}>
                      {project.description}
                    </p>
                    <div className="card-tags">
                      {project.tags.map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="card-links">
                      <a href={project.github} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ fontSize: '18px' }}>💻</span> Code
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Interactive Terminal simulator sandbox */}
        <section className="section container terminal-section" id="terminal">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="heading-md">Interactive Sandbox</h2>
            <p className="text-secondary" style={{ marginBottom: '2rem', maxWidth: '600px' }}>
              Run commands inside this mock terminal simulation sandbox.
            </p>
            <div className="terminal-container">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <div className="dot dot-red"></div>
                  <div className="dot dot-yellow"></div>
                  <div className="dot dot-green"></div>
                </div>
                <div className="terminal-title">bash - portfolio_shell</div>
                <div></div>
              </div>
              <div className="terminal-body" ref={terminalBodyRef}>
                {terminalHistory.map((item, index) => (
                  <div key={index} className={`terminal-line ${item.type}`}>
                    {item.text}
                  </div>
                ))}
                <form onSubmit={handleTerminalSubmit} className="terminal-input-line">
                  <span className="terminal-prompt">sainandu@portfolio:~$</span>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                    {terminalInput === "" && <span className="terminal-cursor"></span>}
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="terminal-input"
                      placeholder=""
                      autoComplete="off"
                      style={{ caretColor: 'transparent', paddingLeft: terminalInput === "" ? '13px' : '0' }}
                    />
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Skills Section */}
        <section className="section container" id="skills">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="heading-md">
            💻 Tech Stack & Tools
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="skills-category-container"
          >
            {/* Category 1: AI/ML & Data Science */}
            <div className="skills-category-box">
              <h3>🧠 AI/ML & Data Science</h3>
              <div className="skills-grid-uiverse">
                <span className="skill-card-uiverse" style={{ '--accent-color': '#EE4C2C', '--accent-color-glow': 'rgba(238, 76, 44, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EE4C2C' }}></span>PyTorch</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#FF6F00', '--accent-color-glow': 'rgba(255, 111, 0, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF6F00' }}></span>TensorFlow</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#17B26A', '--accent-color-glow': 'rgba(23, 178, 106, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#17B26A' }}></span>CrewAI</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#3776AB', '--accent-color-glow': 'rgba(55, 118, 171, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3776AB' }}></span>Python</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#D00000', '--accent-color-glow': 'rgba(208, 0, 0, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D00000' }}></span>Keras</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#F7931E', '--accent-color-glow': 'rgba(247, 147, 30, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F7931E' }}></span>Scikit-Learn</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#150458', '--accent-color-glow': 'rgba(21, 4, 88, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#150458' }}></span>Pandas</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#013243', '--accent-color-glow': 'rgba(1, 50, 67, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#013243' }}></span>NumPy</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#8CAAE6', '--accent-color-glow': 'rgba(140, 170, 230, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8CAAE6' }}></span>SciPy</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#3F4F75', '--accent-color-glow': 'rgba(63, 79, 117, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3F4F75' }}></span>Plotly</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#EE4C2C', '--accent-color-glow': 'rgba(238, 76, 44, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EE4C2C' }}></span>Matplotlib</span>
              </div>
            </div>

            {/* Category 2: Languages & Core */}
            <div className="skills-category-box">
              <h3>💻 Languages & Core</h3>
              <div className="skills-grid-uiverse">
                <span className="skill-card-uiverse" style={{ '--accent-color': '#ED8B00', '--accent-color-glow': 'rgba(237, 139, 0, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ED8B00' }}></span>Java</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#F7DF1E', '--accent-color-glow': 'rgba(247, 223, 30, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F7DF1E' }}></span>JavaScript</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#276DC3', '--accent-color-glow': 'rgba(39, 109, 195, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#276DC3' }}></span>R</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#A8B9CC', '--accent-color-glow': 'rgba(168, 185, 204, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A8B9CC' }}></span>C Programming</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#0064a5', '--accent-color-glow': 'rgba(0, 100, 165, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0064a5' }}></span>PL/pgSQL</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#E34F26', '--accent-color-glow': 'rgba(227, 79, 38, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E34F26' }}></span>HTML5 / Markdown</span>
              </div>
            </div>

            {/* Category 3: Frameworks & Backends */}
            <div className="skills-category-box">
              <h3>⚡ Frameworks & Web Tools</h3>
              <div className="skills-grid-uiverse">
                <span className="skill-card-uiverse" style={{ '--accent-color': '#61DAFB', '--accent-color-glow': 'rgba(97, 218, 251, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#61DAFB' }}></span>React.js</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#009688', '--accent-color-glow': 'rgba(0, 150, 136, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#009688' }}></span>FastAPI</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#339933', '--accent-color-glow': 'rgba(51, 153, 51, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#339933' }}></span>Node.js</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#475467', '--accent-color-glow': 'rgba(71, 84, 103, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#475467' }}></span>Express.js</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#5D6D7E', '--accent-color-glow': 'rgba(93, 109, 126, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#5D6D7E' }}></span>Flask</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#092E20', '--accent-color-glow': 'rgba(9, 46, 32, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#092E20' }}></span>Django</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#E23237', '--accent-color-glow': 'rgba(226, 50, 55, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E23237' }}></span>AngularJS</span>
              </div>
            </div>

            {/* Category 4: Databases & DevOps */}
            <div className="skills-category-box">
              <h3>🗄️ Databases & Tooling</h3>
              <div className="skills-grid-uiverse">
                <span className="skill-card-uiverse" style={{ '--accent-color': '#4169E1', '--accent-color-glow': 'rgba(65, 105, 225, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4169E1' }}></span>PostgreSQL</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#3ECF8E', '--accent-color-glow': 'rgba(62, 207, 142, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3ECF8E' }}></span>Supabase</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#47A248', '--accent-color-glow': 'rgba(71, 162, 72, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#47A248' }}></span>MongoDB</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#4479A1', '--accent-color-glow': 'rgba(68, 121, 161, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4479A1' }}></span>MySQL</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#DC382D', '--accent-color-glow': 'rgba(220, 56, 45, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC382D' }}></span>Redis</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#F05032', '--accent-color-glow': 'rgba(240, 80, 50, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F05032' }}></span>Git / GitHub</span>
                <span className="skill-card-uiverse" style={{ '--accent-color': '#007ACC', '--accent-color-glow': 'rgba(0, 122, 204, 0.25)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#007ACC' }}></span>VS Code / Jupyter</span>
              </div>
            </div>
          </motion.div>

          {/* GitHub Stats Sub-Section */}
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="heading-md" style={{ marginTop: '3rem' }}>
            📊 GitHub Stats & Contributions
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}
          >
            {/* Contribution chart, color themed to match the Untitled UI Green accent #17B26A */}
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-tertiary)' }}>GitHub Contribution Grid</h3>
              <img
                src="https://ghchart.rshah.org/17B26A/SaiNanduVajhala"
                alt="Sai Nandu's GitHub Contribution Grid"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Readme Stats, Streak & Languages Panels (Matching screenshot visual fidelity) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

              {/* Custom GitHub Stats Card */}
              <div style={{
                padding: '2rem',
                backgroundColor: '#0D1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#c9d1d9',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                minHeight: '180px'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f0f6fc', margin: '0 0 1.25rem 0', borderBottom: '1px solid #21262d', paddingBottom: '0.75rem' }}>
                  Sai Nandu's GitHub Stats
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <div><span style={{ color: '#8b949e' }}>Total Stars Earned:</span> <strong style={{ color: '#f0f6fc', marginLeft: '5px' }}>{githubStats.stars}</strong></div>
                    <div><span style={{ color: '#8b949e' }}>Total Commits:</span> <strong style={{ color: '#f0f6fc', marginLeft: '5px' }}>{githubStats.commits}</strong></div>
                    <div><span style={{ color: '#8b949e' }}>Total PRs:</span> <strong style={{ color: '#f0f6fc', marginLeft: '5px' }}>{githubStats.prs}</strong></div>
                    <div><span style={{ color: '#8b949e' }}>Total Issues:</span> <strong style={{ color: '#f0f6fc', marginLeft: '5px' }}>{githubStats.issues}</strong></div>
                    <div><span style={{ color: '#8b949e' }}>Contributed to (last year):</span> <strong style={{ color: '#f0f6fc', marginLeft: '5px' }}>0</strong></div>
                  </div>

                  {/* Circular letter grade container */}
                  <div style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '4px solid #30363d',
                    borderTopColor: '#58a6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(-45deg)'
                  }}>
                    <span style={{
                      fontSize: '2rem',
                      fontWeight: '800',
                      color: '#f0f6fc',
                      transform: 'rotate(45deg)'
                    }}>{githubStats.grade}</span>
                  </div>
                </div>
              </div>

              {/* Custom GitHub Streak Card */}
              <div style={{
                padding: '2rem',
                backgroundColor: '#0D1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#c9d1d9',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                boxShadow: 'var(--shadow-lg)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                minHeight: '180px'
              }}>
                {/* Total Contributions */}
                <div style={{ borderRight: '1px solid #21262d', paddingRight: '5px' }}>
                  <h4 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 5px 0', color: '#f0f6fc' }}>{githubStats.contributions}</h4>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#c9d1d9', marginBottom: '2px' }}>Total Contributions</div>
                  <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>Aug 23, 2024 - Present</div>
                </div>

                {/* Current Streak */}
                <div style={{ borderRight: '1px solid #21262d', paddingRight: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Glowing orange streak circle */}
                  <div style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid #f77e1e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: '0 0 10px rgba(247, 126, 30, 0.25)',
                    background: 'radial-gradient(circle, rgba(247, 126, 30, 0.05) 0%, transparent 70%)'
                  }}>
                    <span style={{ fontSize: '1rem', position: 'absolute', top: '-11px' }}>🔥</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f77e1e' }}>{githubStats.currentStreak}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f77e1e', marginBottom: '2px' }}>Current Streak</div>
                  <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>May 20</div>
                </div>

                {/* Longest Streak */}
                <div>
                  <h4 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 5px 0', color: '#f0f6fc' }}>{githubStats.longestStreak}</h4>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#c9d1d9', marginBottom: '2px' }}>Longest Streak</div>
                  <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>May 7 - May 11</div>
                </div>
              </div>

              {/* Custom Top Languages Card (Matching screenshot styling exactly) */}
              <div style={{
                padding: '2rem',
                backgroundColor: '#0D1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#c9d1d9',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f0f6fc', margin: '0 0 1.25rem 0', borderBottom: '1px solid #21262d', paddingBottom: '0.75rem' }}>
                  Most Used Languages
                </h3>

                {/* Stacked Multi-color segment progress bar */}
                <div style={{
                  display: 'flex',
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#21262d',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  marginBottom: '1.5rem'
                }}>
                  {githubStats.languages.map((lang, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${lang.percentage}%`,
                        height: '100%',
                        backgroundColor: lang.color
                      }}
                    />
                  ))}
                </div>

                {/* Languages Bullet Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.85rem'
                }}>
                  {githubStats.languages.map((lang, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: lang.color,
                        display: 'inline-block'
                      }}></span>
                      <span style={{ color: '#c9d1d9', fontWeight: 500 }}>{lang.name}</span>
                      <span style={{ color: '#8b949e', marginLeft: '5px' }}>{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* Credentials Section */}
        <section className="section container" id="credentials" style={{ minHeight: 'auto', padding: '6rem 0' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="heading-md">Credentials & Certifications</h2>
            <p className="text-secondary" style={{ marginBottom: '3rem', maxWidth: '600px', fontSize: '1.125rem' }}>
              Verified academic achievements, professional certifications, and industry simulations.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>

              {/* Oracle Certification Card */}
              <div className="credential-card oracle-card">
                <div>
                  <div className="credential-card-header">
                    <span style={{ fontSize: '0.8rem', color: '#8b949e', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Professional Certification</span>
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(23, 178, 106, 0.1)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></span> Verified
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', margin: '0.5rem 0 1.5rem 0' }}>
                    <div className="credential-badge-img-wrapper" style={{ boxShadow: '0 4px 20px rgba(23, 178, 106, 0.15)' }}>
                      <img
                        src="https://brm-workforce.oracle.com/pdf/certview/images/OCI25AICFAV1.png"
                        alt="Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f0f6fc', margin: '0 0 6px 0', lineHeight: 1.3, fontFamily: 'Space Grotesk' }}>
                        Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#8b949e', fontWeight: 500 }}>Oracle University</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#8b949e', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Demonstrates complete core mastery of Artificial Intelligence and Machine Learning paradigms, spanning Large Language Models (LLMs), deep learning networks, prompt optimization engineering, and standard AI deployments on OCI infrastructure.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <a
                    href="https://catalog-education.oracle.com/pls/certview/sharebadge?id=7BE6ED30EE3083111B17C78B5EDF74C875F88216A2CE6EA4924CA511B0DD4AB5"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-neon-border"
                    style={{
                      flex: 1,
                      fontSize: '0.875rem',
                      '--accent': 'var(--accent)'
                    }}
                  >
                    <span>🛡️</span> Verify on Oracle CertView
                  </a>
                </div>
              </div>

              {/* Google Cloud AI Agent Engineer Card */}
              <div className="credential-card google-card">
                <div>
                  <div className="credential-card-header">
                    <span style={{ fontSize: '0.8rem', color: '#8b949e', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Professional Certification</span>
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(66, 133, 244, 0.1)',
                      color: '#4285F4',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#4285F4', borderRadius: '50%' }}></span> Verified
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', margin: '0.5rem 0 1.5rem 0' }}>
                    <div className="credential-badge-img-wrapper" style={{ boxShadow: '0 4px 20px rgba(66, 133, 244, 0.15)' }}>
                      <img
                        src="https://images.credly.com/images/000655a5-3837-4c38-b906-2eb9c059ab36/linkedin_thumb_blob"
                        alt="Engineer AI Agents with Agent Development Kit (ADK)"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f0f6fc', margin: '0 0 6px 0', lineHeight: 1.3, fontFamily: 'Space Grotesk' }}>
                        Engineer AI Agents with Agent Development Kit (ADK)
                      </h3>
                      <div style={{ fontSize: '0.9rem', color: '#8b949e', fontWeight: 500 }}>Google Cloud</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#8b949e', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Demonstrates advanced expertise in formulating real-world language model research problems, building tokenizers, preparing training datasets for transformer architectures, and running small language model (SLM) training loops.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <a
                    href="https://www.credly.com/badges/4be3d2ac-f8bd-44ad-bcec-91d0d86c1ca9"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-neon-border"
                    style={{
                      flex: 1,
                      fontSize: '0.875rem',
                      '--accent': '#4285F4'
                    }}
                  >
                    <span>🛡️</span> Verify on Credly
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        </section>
      </main>

      <footer id="contact" style={{ padding: '4rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="container">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="heading-md" style={{ marginBottom: '1.5rem' }}>
            Get In Touch
          </motion.h2>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '20px' }}>✉️</span>
              <a href="mailto:vajhalasainandu@gmail.com" className="text-accent" style={{ fontSize: '1.125rem' }}>vajhalasainandu@gmail.com</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <span style={{ fontSize: '1.125rem' }}>Hyderabad, India - 500047</span>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://github.com/SaiNanduVajhala" target="_blank" rel="noreferrer" className="social-btn-uiverse github">
              <span style={{ fontSize: '20px' }}>💻</span> GitHub
            </a>
            <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer" className="social-btn-uiverse linkedin">
              <span style={{ fontSize: '20px' }}>💼</span> LinkedIn
            </a>
            <button
              className="terminal-button-hud"
              onClick={() => {
                const el = document.getElementById("terminal");
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }}></span>
              portfolio_shell:~$ connect --active
            </button>
          </motion.div>

          <p style={{ color: 'var(--text-secondary)' }}>&copy; {new Date().getFullYear()} Sai Nandu Vajhala. Designed with purpose.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
