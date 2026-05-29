import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import './index.css';

// Import 3D WebGL components
import CameraController from './components/CameraController';
import SpaceEnvironment from './components/SpaceEnvironment';
import NeuralNetwork from './components/NeuralSphere';
import deloitteSimImg from './assets/deloitte_simulation.png';

// Predefined 3D coordinates for each sector in the Latent Space
const sectorCoordinates = {
  hero: [0, 0, 0],
  about: [-12, 5, -8],
  projects: [12, -5, -8],
  terminal: [0, -12, -10],
  skills: [-10, -7, -7],
  credentials: [10, 7, -8],
  contact: [0, 10, -6]
};

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

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 160 : direction < 0 ? -160 : 0,
    opacity: 0,
    scale: 0.96
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 160 : direction > 0 ? -160 : 0,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1]
    }
  })
};

function App() {
  const [theme, setTheme] = useState("light");
  const [activeSector, setActiveSector] = useState("hero");
  const [filter, setFilter] = useState("all");
  const [cardFlipped, setCardFlipped] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // -1 for left, 1 for right
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    setCurrentProjectIndex(0);
    setSlideDirection(0);
  }, [filter]);

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
          commits: 101,
          prs: 4,
          issues: 2,
          contributions: 121,
          currentStreak: 0,
          longestStreak: 5,
          grade: totalStars > 5 ? "A" : "C",
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
        { text: "4. Market Mood Trading Analysis (Crypto Fear & Greed analyzer)", type: "success" },
        { text: "5. Semantic Search Engine (NLP semantic vector search)", type: "success" }
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

  const filteredProjects = filter === "all"
    ? projectsData
    : projectsData.filter(p => p.category === filter);

  return (
    <>
      {/* 1. Ultra-Premium Glassmorphic HUD Navbar */}
      <nav className="hud-nav-bar">
        <div className="container hud-nav-content">
          <button onClick={() => setActiveSector("hero")} className="text-accent" style={{ background: 'none', border: 'none', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Space Grotesk', cursor: 'pointer' }}>SV.</button>

          {isMobile ? (
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          ) : null}

          <div className={`hud-nav-links ${isMobile ? 'mobile-hidden' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            <button onClick={() => { setActiveSector("hero"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "hero" ? "hud-nav-btn-active" : ""}`}>Home</button>
            <button onClick={() => { setActiveSector("about"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "about" ? "hud-nav-btn-active" : ""}`}>About</button>
            <button onClick={() => { setActiveSector("projects"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "projects" ? "hud-nav-btn-active" : ""}`}>Projects</button>
            <button onClick={() => { setActiveSector("terminal"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "terminal" ? "hud-nav-btn-active" : ""}`}>Sandbox</button>
            <button onClick={() => { setActiveSector("skills"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "skills" ? "hud-nav-btn-active" : ""}`}>Skills</button>
            <button onClick={() => { setActiveSector("credentials"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "credentials" ? "hud-nav-btn-active" : ""}`}>Credentials</button>
            <button onClick={() => { setActiveSector("contact"); setIsMobileMenuOpen(false); }} className={`hud-nav-btn ${activeSector === "contact" ? "hud-nav-btn-active" : ""}`}>Contact</button>
            <div className="theme-toggle-wrapper">
              <div className="theme-switch" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
                <div className="theme-switch-knob">
                  {theme === 'dark' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Full-Screen WebGL Canvas Universe */}
      <div className="canvas-container-3d">
        <Canvas
          camera={{ position: [0, 0, 6], fov: isMobile ? 68 : 55 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          {/* Background galaxy environment & connecting neural pathways */}
          <SpaceEnvironment sectorCoordinates={sectorCoordinates} theme={theme} />

          {/* Smooth camera flight transitions */}
          <CameraController activeSector={activeSector} sectorCoordinates={sectorCoordinates} />

          {/* 🛸 SECTOR: HERO [0, 0, 0] */}
          <group position={sectorCoordinates.hero}>
            {/* Neural sphere rendered as native 3D object — always alive, no nested Canvas */}
            <group position={[-3, 0.2, -2]} scale={1.8}>
              <NeuralNetwork count={50} theme={theme} />
            </group>
            <Html
              position={[0, -0.5, 0]}
              transform
              pixelPerfect
              scale={0.66}
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'hero' ? 1 : 0,
                visibility: activeSector === 'hero' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'hero' ? 'auto' : 'none'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: isMobile ? '2rem' : '3rem', width: isMobile ? '340px' : '960px', alignItems: 'center', textAlign: isMobile ? 'center' : 'left', transform: 'scale(1.5)', transformOrigin: 'center' }}>
                <div style={{ position: 'relative', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="heading-lg" style={{ margin: 0, lineHeight: 1.1 }}>
                      Sai Nandu Vajhala.<br />
                      <span className="text-accent">AI/ML Engineer.</span>
                    </h1>
                    <p className="body-lg" style={{ margin: '1.5rem 0 2rem 0', fontSize: '1.2rem' }}>
                      BTech student in Artificial Intelligence &amp; Machine Learning.<br />
                      Building intelligent agents, real-time systems, and data-driven automation.
                    </p>
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                      <button onClick={() => setActiveSector("projects")} className="btn btn-premium-glow">View Projects</button>
                      <a href="./Sai_Nandu_Resume.pdf" download="Sai_Nandu_Resume.pdf" className="btn-neon-border">
                        <span style={{ marginRight: '8px' }}>📥</span> Download Resume
                      </a>
                    </div>
                  </div>
                </div>

                <div className="id-card-3d-container" style={{ transform: isMobile ? 'none' : 'translateX(50px)', margin: isMobile ? '0 auto' : '0' }}>

                  {/* Premium flip card — uses scaleX squeeze animation (CSS 3D backface-visibility broken in R3F Html) */}
                  <div className="id-card-wrapper" style={{ zIndex: 2 }} onMouseEnter={() => setCardFlipped(true)} onMouseLeave={() => setCardFlipped(false)}>
                    <div className="id-card">
                      <AnimatePresence>
                        {!cardFlipped ? (
                          <motion.div
                            key="front"
                            className="id-card-face id-card-front"
                            initial={{ scaleX: 0, opacity: 0.5 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0.5 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            style={{ originX: 0.5 }}
                          >
                            <div className="id-card-front-top">
                              <span className="id-card-front-top-label">Portfolio ID</span>
                              <span className="id-card-front-top-company">AI/ML Engineering</span>
                            </div>
                            <div className="id-card-avatar">SN</div>
                            <div className="id-card-front-body">
                              <span className="id-card-name">Sai Nandu Vajhala</span>
                              <span className="id-card-role">AI/ML Engineer</span>
                              <div className="id-card-divider" />
                              <span className="id-card-dept">
                                BTech · Sreyas Institute<br />Hyderabad, India
                              </span>
                              <div className="id-card-barcode">
                                {[3, 5, 2, 7, 4, 6, 3, 5, 2, 4, 6, 3, 7, 5, 2, 4, 6, 3, 5, 4].map((h, i) => (
                                  <span key={i} style={{ width: i % 3 === 0 ? '3px' : '1.5px', height: `${h * 3}px` }} />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="back"
                            className="id-card-face id-card-back"
                            initial={{ scaleX: 0, opacity: 0.5 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0.5 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            style={{ originX: 0.5 }}
                          >
                            <div className="id-card-back-header">
                              <span className="id-card-back-header-dot" />
                              <span className="id-card-back-header-label">Contact Details</span>
                            </div>
                            <div className="id-card-contact-row">
                              <div className="id-card-contact-icon">✉️</div>
                              <div className="id-card-contact-info">
                                <span className="id-card-contact-label">Email</span>
                                <span className="id-card-contact-value">
                                  <a href="mailto:vajhalasainandu@gmail.com">vajhalasainandu@gmail.com</a>
                                </span>
                              </div>
                            </div>
                            <div className="id-card-contact-row">
                              <div className="id-card-contact-icon">📍</div>
                              <div className="id-card-contact-info">
                                <span className="id-card-contact-label">Location</span>
                                <span className="id-card-contact-value">Hyderabad, India</span>
                              </div>
                            </div>
                            <div className="id-card-contact-row">
                              <div className="id-card-contact-icon">🔗</div>
                              <div className="id-card-contact-info">
                                <span className="id-card-contact-label">LinkedIn</span>
                                <span className="id-card-contact-value">
                                  <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer">vajhala-sai-nandu</a>
                                </span>
                              </div>
                            </div>
                            <div className="id-card-contact-row">
                              <div className="id-card-contact-icon">🐙</div>
                              <div className="id-card-contact-info">
                                <span className="id-card-contact-label">GitHub</span>
                                <span className="id-card-contact-value">
                                  <a href="https://github.com/SaiNanduVajhala/" target="_blank" rel="noreferrer">SaiNanduVajhala</a>
                                </span>
                              </div>
                            </div>
                            <div className="id-card-contact-row">
                              <div className="id-card-contact-icon">📊</div>
                              <div className="id-card-contact-info">
                                <span className="id-card-contact-label">Kaggle</span>
                                <span className="id-card-contact-value">
                                  <a href="https://www.kaggle.com/vajhalasainandu" target="_blank" rel="noreferrer">vajhalasainandu</a>
                                </span>
                              </div>
                            </div>
                            <div className="id-card-back-footer">
                              <span className="id-card-back-footer-hint">Open to opportunities</span>
                              <span style={{ width: '6px', height: '6px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 6px rgba(23,178,106,0.8)' }} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="id-card-hint">
                      <span>↕</span> hover to flip
                    </div>
                  </div>
                </div>
              </div>
            </Html>
          </group>

          {/* 🧬 SECTOR: ABOUT [-12, 5, -8] */}
          <group position={sectorCoordinates.about}>
            <Html
              position={[0, -1, 0]}
              transform
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'about' ? 1 : 0,
                visibility: activeSector === 'about' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'about' ? 'auto' : 'none'
              }}
            >
              <div className="glass-hud-card">
                <h2 className="heading-md" style={{ marginBottom: '1.25rem', fontSize: '2rem' }}>About Me</h2>
                <p className="text-secondary" style={{ marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  I am a highly motivated student pursuing a BTech in Artificial Intelligence and Machine Learning at <b>Sreyas Institute of Engineering and Technology.</b>
                </p>
                <p className="text-secondary" style={{ fontSize: '1.05rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                  I'm passionate about emerging cognitive paradigms, actively constructing autonomous agent networks, real-time voice architectures, and high-dimensional semantic search engines.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <span className="tag" style={{ color: 'var(--text-primary)' }}>OCI AI Foundations Associate</span>
                  <span className="tag" style={{ color: 'var(--text-primary)' }}>Google Cloud AI Agent Engineer</span>
                </div>

                <h3 style={{ marginBottom: '1rem', fontFamily: 'Space Grotesk', fontSize: '1.25rem' }}>Academic Path</h3>
                <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem' }}>
                  <h4 style={{ color: 'var(--accent)' }}>BTech in AI & ML</h4>
                  <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Sreyas Institute (2024 - 2027) · CGPA: 7.2/10</p>
                </div>
              </div>
            </Html>
          </group>

          {/* 🛸 SECTOR: PROJECTS [12, -5, -8] */}
          <group position={sectorCoordinates.projects}>
            <Html
              position={[0, -1, 0]}
              transform
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'projects' ? 1 : 0,
                visibility: activeSector === 'projects' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'projects' ? 'auto' : 'none'
              }}
            >
              <div style={{ width: isMobile ? '340px' : '920px' }} onWheel={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '1rem' : '0', marginBottom: '2rem' }}>
                  <h2 className="heading-md" style={{ margin: 0, fontSize: '2rem' }}>Featured Projects</h2>
                  <div className="filter-container" style={{ margin: 0 }}>
                    {["all", "ai-agents", "data-science", "accessibility"].map((cat) => {
                      const label = cat === "all" ? "All" : cat === "ai-agents" ? "AI Agents" : cat === "data-science" ? "Data Science" : "Accessibility";
                      const isActive = filter === cat;
                      return (
                        <button key={cat} className={`filter-btn ${isActive ? "active" : ""}`} onClick={() => setFilter(cat)}>
                          {isActive && <motion.span layoutId="activeFilterPill" className="filter-active-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Relative Wrapper to mathematically lock arrow buttons to absolute 50% height of the card */}
                <div style={{ position: 'relative', width: isMobile ? '100%' : '600px', height: '390px', margin: '2.5rem auto 1rem auto' }}>

                  {/* Left Arrow Button (Absolute Centered Outside Card) */}
                  <button
                    onClick={() => {
                      setSlideDirection(-1);
                      setCurrentProjectIndex((prev) => (prev === 0 ? filteredProjects.length - 1 : prev - 1));
                    }}
                    className="btn btn-premium-glow"
                    style={{
                      position: 'absolute',
                      left: isMobile ? '-10px' : '-70px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)',
                      backdropFilter: 'blur(10px)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      zIndex: 20
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M15 18l-6-6 6-6" /></svg>
                  </button>

                  {/* Slider Container holding the animated spotlight card */}
                  <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
                    <AnimatePresence mode="wait" custom={slideDirection}>
                      {filteredProjects[currentProjectIndex] && (
                        <motion.div
                          key={filteredProjects[currentProjectIndex].id}
                          custom={slideDirection}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="spotlight-card"
                          {...spotlight}
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow-lg)'
                          }}
                        >
                          <div className="spotlight-glow" style={{ top: 'var(--mouse-y)', left: 'var(--mouse-x)' }}></div>
                          {/* Centered card padding and alignment */}
                          <div className="spotlight-content" style={{ padding: '2rem 2.2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              {/* Centered header design */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                                <span className="tag" style={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.08em', alignSelf: 'center', padding: '3px 8px' }}>
                                  {filteredProjects[currentProjectIndex].category}
                                </span>
                                <h3 style={{ fontSize: '1.35rem', fontFamily: 'Space Grotesk', margin: 0, color: 'var(--text-primary)', lineHeight: 1.3, textAlign: 'center' }}>
                                  {filteredProjects[currentProjectIndex].title}
                                </h3>
                              </div>
                              <p className="text-secondary custom-scrollbar" style={{ fontSize: '1.02rem', lineHeight: 1.65, marginTop: '0.5rem', height: '120px', overflowY: 'auto', paddingRight: '6px', textAlign: 'center' }}>
                                {filteredProjects[currentProjectIndex].description}
                              </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {/* Centered tag items */}
                              <div className="card-tags" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', margin: '0.75rem 0 1.25rem 0' }}>
                                {filteredProjects[currentProjectIndex].tags.map((tag, idx) => (
                                  <span key={idx} className="tag" style={{ fontSize: '0.8rem' }}>{tag}</span>
                                ))}
                              </div>

                              {/* Symmetrical footer centering */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                                <a
                                  href={filteredProjects[currentProjectIndex].github}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-premium-glow"
                                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                                >
                                  💻 View Code
                                </a>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                  Project {currentProjectIndex + 1} of {filteredProjects.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Right Arrow Button (Absolute Centered Outside Card) */}
                  <button
                    onClick={() => {
                      setSlideDirection(1);
                      setCurrentProjectIndex((prev) => (prev === filteredProjects.length - 1 ? 0 : prev + 1));
                    }}
                    className="btn btn-premium-glow"
                    style={{
                      position: 'absolute',
                      right: isMobile ? '-10px' : '-70px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)',
                      backdropFilter: 'blur(10px)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      zIndex: 20
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>

                {/* Dot Indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  {filteredProjects.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSlideDirection(idx > currentProjectIndex ? 1 : -1);
                        setCurrentProjectIndex(idx);
                      }}
                      style={{
                        width: idx === currentProjectIndex ? '24px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: idx === currentProjectIndex ? 'var(--accent)' : 'rgba(52, 64, 84, 0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: idx === currentProjectIndex ? '0 0 8px var(--accent)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </Html>
          </group>

          {/* 🛸 SECTOR: SANDBOX (TERMINAL) [0, -12, -10] */}
          <group position={sectorCoordinates.terminal}>
            <Html
              position={[0, -1.1, 0]}
              transform
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'terminal' ? 1 : 0,
                visibility: activeSector === 'terminal' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'terminal' ? 'auto' : 'none'
              }}
            >
              <div className="glass-hud-card" style={{ width: isMobile ? '340px' : '720px' }}>
                <h2 className="heading-md" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Interactive Sandbox</h2>
                <p className="text-secondary" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Run commands inside this real-time portfolio console environment.</p>

                <div className="terminal-container" style={{ height: '360px' }}>
                  <div className="terminal-header">
                    <div className="terminal-dots">
                      <div className="dot dot-red"></div>
                      <div className="dot dot-yellow"></div>
                      <div className="dot dot-green"></div>
                    </div>
                    <div className="terminal-title">bash - latent_shell</div>
                    <div></div>
                  </div>
                  <div className="terminal-body" ref={terminalBodyRef} style={{ height: '315px', fontSize: '0.88rem' }}>
                    {terminalHistory.map((item, index) => (
                      <div key={index} className={`terminal-line ${item.type}`}>{item.text}</div>
                    ))}
                    <form onSubmit={handleTerminalSubmit} className="terminal-input-line">
                      <span className="terminal-prompt" style={{ fontSize: '0.88rem' }}>sainandu@latent-space:~$</span>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                        {terminalInput === "" && <span className="terminal-cursor" style={{ height: '14px' }}></span>}
                        <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} className="terminal-input" autoComplete="off" style={{ caretColor: 'transparent', fontSize: '0.88rem' }} />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Html>
          </group>

          {/* 🛸 SECTOR: SKILLS [-10, -7, -7] */}
          <group position={sectorCoordinates.skills}>
            <Html
              position={[0, -1, 0]}
              transform
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'skills' ? 1 : 0,
                visibility: activeSector === 'skills' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'skills' ? 'auto' : 'none'
              }}
            >
              <div style={{ width: isMobile ? '340px' : '920px' }}>
                <h2 className="heading-md" style={{ marginBottom: '2rem', fontSize: '2rem' }}>Tech Stack & Dynamic Activity</h2>

                <div className="skills-category-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <div className="skills-category-box" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🧠 AI/ML & Data Science</h3>
                    <div className="skills-grid-uiverse">
                      {[
                        { name: "Python", color: "#3776AB" },
                        { name: "PyTorch", color: "#EE4C2C" },
                        { name: "TensorFlow", color: "#FF6F00" },
                        { name: "CrewAI", color: "#FF4B4B" },
                        { name: "Scikit-Learn", color: "#F7931E" },
                        { name: "Keras", color: "#D00000" },
                        { name: "NumPy", color: "#013243" },
                        { name: "Pandas", color: "#150458" },
                        { name: "SciPy", color: "#8CAAE6" },
                        { name: "Matplotlib", color: "#11557C" },
                        { name: "Plotly", color: "#3F4F75" },
                        { name: "R", color: "#276FDB" }
                      ].map((s, i) => (
                        <span
                          key={i}
                          className="skill-card-uiverse"
                          style={{
                            '--accent-color': s.color,
                            '--accent-color-glow': `${s.color}33`
                          }}
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: s.color,
                            boxShadow: `0 0 6px ${s.color}`,
                            display: 'inline-block'
                          }} />
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="skills-category-box" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>⚡ Backends & Web</h3>
                    <div className="skills-grid-uiverse">
                      {[
                        { name: "FastAPI", color: "#009688" },
                        { name: "React.js", color: "#61DAFB" },
                        { name: "Node.js", color: "#339933" },
                        { name: "Express.js", color: "#808080" },
                        { name: "Django", color: "#092E20" },
                        { name: "Flask", color: "#000000" },
                        { name: "Angular.js", color: "#DD0031" },
                        { name: "Java", color: "#007396" },
                        { name: "JavaScript", color: "#F7DF1E" },
                        { name: "HTML5", color: "#E34F26" },
                        { name: "NPM", color: "#CB3837" },
                        { name: "Markdown", color: "#808080" }
                      ].map((s, i) => (
                        <span
                          key={i}
                          className="skill-card-uiverse"
                          style={{
                            '--accent-color': s.color,
                            '--accent-color-glow': `${s.color}33`
                          }}
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: s.color,
                            boxShadow: `0 0 6px ${s.color}`,
                            display: 'inline-block'
                          }} />
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="skills-category-box" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🗄️ Databases & Pipelines</h3>
                    <div className="skills-grid-uiverse">
                      {[
                        { name: "PostgreSQL", color: "#4169E1" },
                        { name: "MongoDB", color: "#47A248" },
                        { name: "MySQL", color: "#4479A1" },
                        { name: "Redis", color: "#DC382D" },
                        { name: "Supabase", color: "#3ECF8E" },
                        { name: "Git", color: "#F05032" },
                        { name: "GitHub", color: "#F0F6FC" }
                      ].map((s, i) => (
                        <span
                          key={i}
                          className="skill-card-uiverse"
                          style={{
                            '--accent-color': s.color,
                            '--accent-color-glow': `${s.color}33`
                          }}
                        >
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: s.color,
                            boxShadow: `0 0 6px ${s.color}`,
                            display: 'inline-block'
                          }} />
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Html>
          </group>

          {/* 🛸 SECTOR: CREDENTIALS [10, 7, -8] */}
          <group position={sectorCoordinates.credentials}>
            <Html
              position={[0, -1, 0]}
              transform
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'credentials' ? 1 : 0,
                visibility: activeSector === 'credentials' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'credentials' ? 'auto' : 'none'
              }}
            >
              <div style={{ width: isMobile ? '340px' : '920px' }}>
                <h2 className="heading-md" style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Credentials & Verified Badges</h2>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1.5rem' }}>
                  <div className="credential-card oracle-card" style={{ padding: '1.5rem' }}>
                    <div className="credential-badge-img-wrapper" style={{ width: '64px', height: '64px' }}>
                      <img src="https://brm-workforce.oracle.com/pdf/certview/images/OCI25AICFAV1.png" alt="Oracle" style={{ width: '100%' }} />
                    </div>
                    <h3 style={{ fontSize: '1rem', marginTop: '1rem', fontFamily: 'Space Grotesk' }}>OCI 2025 AI Foundations Associate</h3>
                    <a href="https://catalog-education.oracle.com/pls/certview/sharebadge?id=7BE6ED30EE3083111B17C78B5EDF74C875F88216A2CE6EA4924CA511B0DD4AB5" target="_blank" rel="noreferrer" className="btn-neon-border" style={{ marginTop: '1.5rem', fontSize: '0.8rem', width: '100%' }}>🛡️ Verify Badge</a>
                  </div>

                  <div className="credential-card google-card" style={{ padding: '1.5rem' }}>
                    <div className="credential-badge-img-wrapper" style={{ width: '64px', height: '64px' }}>
                      <img src="https://images.credly.com/images/000655a5-3837-4c38-b906-2eb9c059ab36/linkedin_thumb_blob" alt="Google" style={{ width: '100%' }} />
                    </div>
                    <h3 style={{ fontSize: '1rem', marginTop: '1rem', fontFamily: 'Space Grotesk' }}>Engineer AI Agents with Agent Development Kit (ADK)</h3>
                    <a href="https://www.credly.com/badges/4be3d2ac-f8bd-44ad-bcec-91d0d86c1ca9" target="_blank" rel="noreferrer" className="btn-neon-border" style={{ marginTop: '1.5rem', fontSize: '0.8rem', width: '100%' }}>🛡️ Verify Badge</a>
                  </div>

                  <div className="credential-card deloitte-card" style={{ padding: '1.5rem' }}>
                    <div style={{ width: '120px', height: '54px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '4px' }}>
                      <img src={deloitteSimImg} alt="Deloitte Certificate" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: '1rem', marginTop: '1rem', fontFamily: 'Space Grotesk' }}>Deloitte Data Analytics Job Simulation</h3>
                    <a href="https://www.linkedin.com/posts/vajhala-sai-nandu_data-analytics-job-simulation-activity-7466083854416707585-ODuA?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFz19TIBtJJGw5Sx8AlQ19C-4c5UcVpjRww" target="_blank" rel="noreferrer" className="btn-neon-border" style={{ marginTop: '1.5rem', fontSize: '0.8rem', width: '100%' }}>🛡️ Verify Certificate</a>
                  </div>
                </div>
              </div>
            </Html>
          </group>

          {/* ✉️ SECTOR: CONTACT [0, 10, -6] */}
          <group position={sectorCoordinates.contact}>
            <Html
              position={[0, -1, 0]}
              transform
              distanceFactor={4.5}
              className="r3f-html-wrapper"
              style={{
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s',
                opacity: activeSector === 'contact' ? 1 : 0,
                visibility: activeSector === 'contact' ? 'visible' : 'hidden',
                pointerEvents: activeSector === 'contact' ? 'auto' : 'none'
              }}
            >
              <div className="contact-hud-panel">
                {/* Top header with animated gradient */}
                <div className="contact-header">
                  <div className="contact-status-line">
                    <span className="contact-status-dot" />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'Space Grotesk', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase' }}>Available for opportunities</span>
                  </div>
                  <h2 className="contact-title">Let's Connect</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
                    Open to collaborations in AI/ML research, agent architectures, and full-stack engineering. Let's build something extraordinary.
                  </p>
                </div>

                {/* Two-column layout */}
                <div className="contact-grid">
                  {/* Left: Info cards */}
                  <div className="contact-info-column">
                    <a href="mailto:vajhalasainandu@gmail.com" className="contact-info-card" style={{ textDecoration: 'none' }}>
                      <div className="contact-icon-wrap" style={{ background: 'rgba(23, 178, 106, 0.12)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17B26A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>Email</span>
                        <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>vajhalasainandu@gmail.com</span>
                      </div>
                    </a>

                    <div className="contact-info-card">
                      <div className="contact-icon-wrap" style={{ background: 'rgba(66, 133, 244, 0.12)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>Location</span>
                        <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>Hyderabad, India — 500047</span>
                      </div>
                    </div>

                    <div className="contact-info-card">
                      <div className="contact-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.12)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>Timezone</span>
                        <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: '2px' }}>IST (UTC +5:30)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Social links */}
                  <div className="contact-social-column">
                    <a href="https://github.com/SaiNanduVajhala" target="_blank" rel="noreferrer" className="contact-social-card contact-social-github">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      <div>
                        <span className="contact-social-label">GitHub</span>
                        <span className="contact-social-handle">@SaiNanduVajhala</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                    </a>

                    <a href="https://www.linkedin.com/in/vajhala-sai-nandu/" target="_blank" rel="noreferrer" className="contact-social-card contact-social-linkedin">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      <div>
                        <span className="contact-social-label">LinkedIn</span>
                        <span className="contact-social-handle">vajhala-sai-nandu</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                    </a>

                    <a href="https://www.kaggle.com/vajhalasainandu" target="_blank" rel="noreferrer" className="contact-social-card contact-social-kaggle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.281.18.046.149.034.238-.036.27l-6.555 6.344 6.836 8.507c.095.104.117.208.075.328z" /></svg>
                      <div>
                        <span className="contact-social-label">Kaggle</span>
                        <span className="contact-social-handle">vajhalasainandu</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', opacity: 0.4 }}><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                    </a>
                  </div>
                </div>

                {/* Footer */}
                <div className="contact-footer">
                  <div className="contact-footer-line" />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.5px' }}>&copy; {new Date().getFullYear()} Sai Nandu Vajhala · Portfolio</p>
                </div>
              </div>
            </Html>
          </group>

        </Canvas>
      </div>
    </>
  );
}

export default App;
