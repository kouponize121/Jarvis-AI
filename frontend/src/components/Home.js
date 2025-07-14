import React, { useState } from 'react';
import Login from './Login';

const Home = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Assistant',
      description: 'Chat with Jarvis, your intelligent AI assistant that understands context and helps you accomplish tasks efficiently.',
      image: 'https://images.unsplash.com/photo-1712002641088-9d76f9080889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxBSSUyMGFzc2lzdGFudHxlbnwwfHx8fDE3NTI1MjE0Njd8MA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: '📋',
      title: 'Meeting Management',
      description: 'Start meetings, take notes, and automatically generate comprehensive Minutes of Meeting (MoM) with AI.',
      image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZpdHl8ZW58MHx8fHwxNzUyNTIxNDc1fDA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: '✅',
      title: 'Task & Todo Management',
      description: 'Create, assign, and track tasks with email notifications. Manage your todos with intelligent prioritization.',
      image: 'https://images.unsplash.com/photo-1694903110330-cc64b7e1d21d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxBSSUyMGFzc2lzdGFudHxlbnwwfHx8fDE3NTI1MjE0Njd8MA&ixlib=rb-4.1.0&q=85'
    },
    {
      icon: '📧',
      title: 'Email Automation',
      description: 'Draft professional emails with AI assistance and send them automatically with SMTP integration.',
      image: 'https://images.pexels.com/photos/977296/pexels-photo-977296.jpeg'
    },
    {
      icon: '⚙️',
      title: 'System Integration',
      description: 'Connect with OpenAI API, configure SMTP settings, and integrate with your existing workflows.',
      image: 'https://images.pexels.com/photos/14309806/pexels-photo-14309806.jpeg'
    },
    {
      icon: '📊',
      title: 'Dashboard & Analytics',
      description: 'Get a comprehensive overview of your meetings, tasks, todos, and system status in one place.',
      image: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZpdHl8ZW58MHx8fHwxNzUyNTIxNDc1fDA&ixlib=rb-4.1.0&q=85'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      content: 'Jarvis has revolutionized how we handle meetings. The automatic MoM generation saves hours every week.',
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: 'The task management with email notifications keeps our team perfectly synchronized. Game changer!',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Rodriguez',
      role: 'CEO',
      content: 'The AI-powered email drafting is incredible. It understands context and writes professional emails instantly.',
      avatar: '👩‍💼'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '50,000+', label: 'Meetings Processed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '500+', label: 'Companies Trust Us' }
  ];

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <h1>JARVIS</h1>
            <span className="nav-tagline">AI Assistant</span>
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
              <br />Your AI-Powered Assistant
            </h1>
            <p className="hero-description">
              Revolutionize your productivity with intelligent meeting management, 
              task automation, and seamless AI integration. Experience the future of work today.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => setShowLogin(true)}>
                Start Free Trial
              </button>
              <button className="btn-hero-secondary">
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
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Discover how Jarvis transforms your workflow with cutting-edge AI capabilities
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

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Get started with Jarvis in three simple steps
            </p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Configure Your AI</h3>
                <p>Set up your OpenAI API key and SMTP settings for seamless integration</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Start Chatting</h3>
                <p>Begin conversations with Jarvis using natural language commands</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Automate Everything</h3>
                <p>Watch as Jarvis handles your meetings, tasks, and emails automatically</p>
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
              Join thousands of professionals who trust Jarvis
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
              Join thousands of users who have already revolutionized their workflow with Jarvis
            </p>
            <div className="cta-actions">
              <button className="btn-cta-primary" onClick={() => setShowLogin(true)}>
                Get Started Now
              </button>
              <button className="btn-cta-secondary">
                Schedule Demo
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
              <p>Your AI-Powered Assistant</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Features</h4>
                <ul>
                  <li>AI Chat</li>
                  <li>Meeting Management</li>
                  <li>Task Automation</li>
                  <li>Email Integration</li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <ul>
                  <li>About</li>
                  <li>Privacy</li>
                  <li>Terms</li>
                  <li>Support</li>
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
    </div>
  );
};

export default Home;