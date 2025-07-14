import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SystemCheck = ({ user, onLogout }) => {
  const [systemStatus, setSystemStatus] = useState({
    openai_connected: false,
    smtp_connected: false,
    database_connected: false,
    message: 'Loading system status...'
  });
  const [config, setConfig] = useState({
    openai_key: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: ''
  });
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSystemStatus();
    fetchConfig();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get('/system/status');
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setSystemStatus({
        openai_connected: false,
        smtp_connected: false,
        database_connected: false,
        message: 'Error loading system status'
      });
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/config');
      setConfig(prev => ({
        ...prev,
        smtp_host: response.data.smtp_host || 'smtp.gmail.com',
        smtp_port: response.data.smtp_port || 587,
        smtp_user: response.data.smtp_user || '',
        // Don't populate password fields if they exist (for security)
        openai_key: response.data.openai_key === '***' ? '' : '',
        smtp_pass: response.data.smtp_pass === '***' ? '' : ''
      }));
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const handleConfigChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    });
  };

  const handleRunSystemCheck = async () => {
    setLoading(true);
    setMessage('Running system check...');
    await fetchSystemStatus();
    setLoading(false);
    setMessage('System check completed');
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigLoading(true);
    setMessage('');

    // Validate required fields
    if (!config.openai_key.trim()) {
      setMessage('OpenAI API key is required');
      setConfigLoading(false);
      return;
    }

    if (!config.smtp_user.trim() || !config.smtp_pass.trim()) {
      setMessage('SMTP username and password are required');
      setConfigLoading(false);
      return;
    }

    try {
      setMessage('Saving configuration and testing connections...');
      
      const response = await axios.post('/config', config);
      
      // Show detailed response from backend
      setMessage(response.data.message);
      
      // Update system status based on test results
      setSystemStatus(prev => ({
        ...prev,
        openai_connected: response.data.openai_connected,
        smtp_connected: response.data.smtp_connected,
        database_connected: true
      }));
      
      // Auto-refresh system status after a short delay
      setTimeout(async () => {
        await fetchSystemStatus();
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message;
      setMessage(`Failed to save configuration: ${errorMessage}`);
    }

    setConfigLoading(false);
  };

  const getStatusColor = (status) => {
    return status ? '#00FF00' : '#FF0000';
  };

  const getStatusText = (status) => {
    return status ? '✅ Connected' : '❌ Disconnected';
  };

  return (
    <div className="main-layout">
      <header className="header">
        <h1 className="header-title">JARVIS System Check</h1>
        <div className="header-user">
          <nav className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/chat" className="nav-link">Chat</Link>
            <Link to="/system" className="nav-link active">System</Link>
          </nav>
          <span>Hello, {user.name}</span>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="content-left">
          <div className="system-check-container">
            <div className="system-status">
              <h2 style={{ color: '#00FF00', marginBottom: '20px' }}>
                System Status
              </h2>
              <div style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>
                {systemStatus.message}
              </div>
              <div style={{ marginTop: '20px' }}>
                <button 
                  onClick={handleRunSystemCheck}
                  disabled={loading}
                  className="btn-test"
                >
                  {loading ? 'Checking...' : 'Run System Check'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="config-form">
              <h2 className="config-title">System Configuration</h2>
              
              <div className="config-grid">
                <div className="form-group">
                  <label className="form-label">OpenAI API Key *</label>
                  <input
                    type="password"
                    name="openai_key"
                    value={config.openai_key}
                    onChange={handleConfigChange}
                    placeholder="sk-..."
                    className="form-input"
                    required
                  />
                  <small style={{ color: '#666666', fontSize: '12px' }}>
                    Required for AI features. Get from platform.openai.com
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Host</label>
                  <input
                    type="text"
                    name="smtp_host"
                    value={config.smtp_host}
                    onChange={handleConfigChange}
                    placeholder="smtp.gmail.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input
                    type="number"
                    name="smtp_port"
                    value={config.smtp_port}
                    onChange={handleConfigChange}
                    placeholder="587"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Username *</label>
                  <input
                    type="email"
                    name="smtp_user"
                    value={config.smtp_user}
                    onChange={handleConfigChange}
                    placeholder="your-email@gmail.com"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Password *</label>
                  <input
                    type="password"
                    name="smtp_pass"
                    value={config.smtp_pass}
                    onChange={handleConfigChange}
                    placeholder="Your app password"
                    className="form-input"
                    required
                  />
                  <small style={{ color: '#666666', fontSize: '12px' }}>
                    Use app password for Gmail (not your regular password)
                  </small>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button 
                  type="submit"
                  disabled={configLoading}
                  className="btn-primary"
                >
                  {configLoading ? 'Saving Configuration...' : 'Save Configuration'}
                </button>
              </div>
            </form>

            {message && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                borderRadius: '4px',
                backgroundColor: message.includes('successfully') || message.includes('completed') ? '#001100' : '#110000',
                border: `1px solid ${message.includes('successfully') || message.includes('completed') ? '#00FF00' : '#FF0000'}`,
                color: message.includes('successfully') || message.includes('completed') ? '#00FF00' : '#FF0000'
              }}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="content-right">
          <div className="neural-panel">
            <h3 className="neural-title">System Health</h3>
            <div style={{ padding: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                <span>OpenAI API:</span>
                <span style={{ color: getStatusColor(systemStatus.openai_connected) }}>
                  {getStatusText(systemStatus.openai_connected)}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                <span>SMTP:</span>
                <span style={{ color: getStatusColor(systemStatus.smtp_connected) }}>
                  {getStatusText(systemStatus.smtp_connected)}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '10px',
                fontSize: '14px'
              }}>
                <span>Database:</span>
                <span style={{ color: getStatusColor(systemStatus.database_connected) }}>
                  {getStatusText(systemStatus.database_connected)}
                </span>
              </div>
            </div>
          </div>

          <div className="logs-panel">
            <h3 className="logs-title">Configuration Guide</h3>
            <div style={{ fontSize: '12px', color: '#666666' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#00FF00' }}>OpenAI API Key:</strong>
                <br />
                1. Go to platform.openai.com
                <br />
                2. Create account/login
                <br />
                3. Go to API Keys section
                <br />
                4. Create new key (starts with sk-)
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#00FF00' }}>Gmail SMTP:</strong>
                <br />
                1. Enable 2FA on Gmail
                <br />
                2. Generate App Password
                <br />
                3. Use app password (not Gmail password)
                <br />
                Host: smtp.gmail.com, Port: 587
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#00FF00' }}>Outlook SMTP:</strong>
                <br />
                Host: smtp.office365.com
                <br />
                Port: 587
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemCheck;