import React, { useState } from 'react';
import Login from './Login';

const Home = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: '🤖',
      title: 'AI Personal Assistant',
      description: 'Jarvis is your intelligent AI companion that understands context, remembers conversations, and proactively helps you manage your entire workflow.',
      image: 'https://images.unsplash.com/photo-1712002641088-9d76f9080889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxBSSUyMGFzc2lzdGFudHxlbnwwfHx8fDE3NTI1MjE0Njd8MA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: '✅',
      title: 'Smart Task Management',
      description: 'Create tasks with automated follow-ups, assign to team members, set priorities, and track progress. Jarvis sends automated reminders until completion.',
      image: 'https://images.unsplash.com/photo-1694903110330-cc64b7e1d21d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxBSSUyMGFzc2lzdGFudHxlbnwwfHx8fDE3NTI1MjE0Njd8MA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: '📝',
      title: 'Intelligent Todo Lists',
      description: 'Say goodbye to forgotten tasks. Jarvis creates, organizes, and prioritizes your todos automatically, learning your preferences over time.',
      image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZpdHl8ZW58MHx8fHwxNzUyNTIxNDc1fDA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: '📋',
      title: 'Meeting Intelligence',
      description: 'Start meetings with voice commands, take smart notes, and auto-generate comprehensive Minutes of Meeting. Never miss important details again.',
      image: 'https://images.pexels.com/photos/977296/pexels-photo-977296.jpeg'
    },
    {
      icon: '📧',
      title: 'Email Automation',
      description: 'Jarvis drafts professional emails, sends automatic task assignments, follow-ups, and notifications. All integrated with your SMTP settings.',
      image: 'https://images.pexels.com/photos/14309806/pexels-photo-14309806.jpeg'
    },
    {
      icon: '📊',
      title: 'Comprehensive Dashboard',
      description: 'Get real-time insights into your productivity with interactive charts, task progress, meeting summaries, and performance analytics.',
      image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZpdHl8ZW58MHx8fHwxNzUyNTIxNDc1fDA&ixlib=rb-4.1.0&q=85'
    }
  ];

  const capabilities = [
    {
      category: 'Task Automation',
      items: [
        '🔄 Automated task follow-ups until completion',
        '📅 Smart deadline reminders and notifications',
        '👥 Team task assignment with email notifications',
        '📈 Progress tracking and analytics'
      ]
    },
    {
      category: 'Meeting Management',
      items: [
        '🎤 Voice-activated meeting start/stop',
        '📝 Real-time note-taking assistance',
        '📋 Auto-generated meeting minutes',
        '📊 Meeting analytics and insights'
      ]
    },
    {
      category: 'Email Intelligence',
      items: [
        '✍️ AI-powered email drafting',
        '📤 Automated sending and scheduling',
        '🔔 Smart follow-up reminders',
        '📧 Professional email templates'
      ]
    },
    {
      category: 'Productivity Suite',
      items: [
        '📊 Real-time productivity dashboard',
        '📈 Performance analytics and trends',
        '🎯 Goal setting and tracking',
        '⚡ Instant system status checks'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      content: 'Jarvis transformed our team productivity. The automated task follow-ups ensure nothing falls through the cracks, and the meeting intelligence saves us hours every week.',
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: 'The AI understands context like no other tool. It creates tasks, sends reminders, and even drafts professional emails. It\'s like having a personal assistant who never sleeps.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Rodriguez',
      role: 'CEO',
      content: 'The comprehensive dashboard gives me real-time insights into our entire operation. Tasks, meetings, emails - everything automated and intelligent. Game changer!',
      avatar: '👩‍💼'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '500K+', label: 'Tasks Automated' },
    { number: '99.9%', label: 'Uptime' },
    { number: '85%', label: 'Productivity Boost' }
  ];

  const demoFeatures = [
    {
      title: 'Voice Command Demo',
      description: 'Watch how Jarvis responds to natural language commands',
      demo: 'User: "Jarvis, create a task for John to review the project proposal by Friday"\nJarvis: "Task created and assigned to John with email notification sent. Deadline set for Friday with automated reminders."'
    },
    {
      title: 'Smart Email Draft',
      description: 'See AI-powered email composition in action',
      demo: 'User: "Draft a follow-up email for the client meeting"\nJarvis: "Professional follow-up email drafted with meeting summary, action items, and next steps. Ready to send?"'
    },
    {
      title: 'Meeting Intelligence',
      description: 'Experience automated meeting management',
      demo: 'User: "Start meeting with sales team"\nJarvis: "Meeting started. Taking notes automatically. Attendees notified. Ready to generate minutes when you say \'end meeting\'."'
    }
  ];

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <h1>JARVIS</h1>
            <span className="nav-tagline">AI Personal Assistant</span>
          </div>
          <div className="nav-actions">
            <button className="btn-nav" onClick={() => setShowLogin(true)}>
              Login
            </button>
            <button className="btn-nav-primary" onClick={() => setShowLogin(true)}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Meet <span className="hero-highlight">JARVIS</span>
              <br />Your AI Personal Assistant
            </h1>
            <p className="hero-description">
              Revolutionize your productivity with intelligent task automation, smart meeting management, 
              AI-powered email assistance, and comprehensive dashboard insights. Experience the future of personal productivity.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => setShowLogin(true)}>
                Start Free Trial
              </button>
              <button className="btn-hero-secondary" onClick={() => setShowDemo(true)}>
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1712002641088-9d76f9080889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxBSSUyMGFzc2lzdGFudHxlbnwwfHx8fDE3NTI1MjE0Njd8MA&ixlib=rb-4.1.0&q=85"
                alt="AI Assistant Interface"
                className="hero-img"
              />
              <div className="hero-overlay">
                <div className="ai-indicator">
                  <div className="ai-pulse"></div>
                  <span>AI Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Comprehensive AI Capabilities</h2>
            <p className="section-description">
              Discover how Jarvis transforms every aspect of your workflow with intelligent automation
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-image">
                  <img src={feature.image} alt={feature.title} />
                  <div className="feature-icon">{feature.icon}</div>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="capabilities-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What Jarvis Can Do</h2>
            <p className="section-description">
              Explore the full range of intelligent features that make Jarvis your ultimate productivity partner
            </p>
          </div>
          <div className="capabilities-grid">
            {capabilities.map((capability, index) => (
              <div key={index} className="capability-card">
                <h3 className="capability-title">{capability.category}</h3>
                <ul className="capability-list">
                  {capability.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="capability-item">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Get started with Jarvis and transform your productivity in three simple steps
            </p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Configure Your AI</h3>
                <p>Set up your OpenAI API key and SMTP settings. Jarvis integrates with your existing tools and workflows seamlessly.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Start Commanding</h3>
                <p>Use natural language to create tasks, start meetings, draft emails, and manage your workflow. Jarvis understands context.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Watch the Magic</h3>
                <p>Jarvis automates follow-ups, sends reminders, generates reports, and keeps your entire workflow running smoothly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-description">
              Join thousands of professionals who trust Jarvis to boost their productivity
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Productivity?</h2>
            <p className="cta-description">
              Join thousands of users who have revolutionized their workflow with intelligent automation
            </p>
            <div className="cta-actions">
              <button className="btn-cta-primary" onClick={() => setShowLogin(true)}>
                Get Started Now
              </button>
              <button className="btn-cta-secondary" onClick={() => setShowDemo(true)}>
                Watch Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>JARVIS</h3>
              <p>Your AI Personal Assistant</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Features</h4>
                <ul>
                  <li><a href="#">AI Chat Assistant</a></li>
                  <li><a href="#">Task Automation</a></li>
                  <li><a href="#">Meeting Intelligence</a></li>
                  <li><a href="#">Email Automation</a></li>
                  <li><a href="#">Productivity Dashboard</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="#">About</a></li>
                  <li><a href="#">Privacy</a></li>
                  <li><a href="#">Terms</a></li>
                  <li><a href="#">Support</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Jarvis AI Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="login-modal">
          <div className="modal-backdrop" onClick={() => setShowLogin(false)}></div>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowLogin(false)}>
              ×
            </button>
            <Login onLogin={onLogin} />
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {showDemo && (
        <div className="demo-modal">
          <div className="modal-backdrop" onClick={() => setShowDemo(false)}></div>
          <div className="demo-content">
            <button className="modal-close" onClick={() => setShowDemo(false)}>
              ×
            </button>
            <div className="demo-header">
              <h2>Jarvis Live Demo</h2>
              <p>See how Jarvis transforms your productivity</p>
            </div>
            <div className="demo-features">
              {demoFeatures.map((feature, index) => (
                <div key={index} className="demo-feature">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="demo-conversation">
                    <pre>{feature.demo}</pre>
                  </div>
                </div>
              ))}
            </div>
            <div className="demo-actions">
              <button className="btn-demo-primary" onClick={() => {
                setShowDemo(false);
                setShowLogin(true);
              }}>
                Try It Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;