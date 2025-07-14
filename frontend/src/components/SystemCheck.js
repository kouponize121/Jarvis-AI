import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SystemCheck = ({ user, onLogout }) => {
  const [systemStatus, setSystemStatus] = useState({
    openai_connected: false,
    smtp_connected: false,
    database_connected: false,
    message: ''
  });
  const [config, setConfig] = useState({
    openai_key: '',
    smtp_host: '',
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
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/config');
      setConfig(prev => ({
        ...prev,
        smtp_host: response.data.smtp_host || '',
        smtp_port: response.data.smtp_port || 587,
        smtp_user: response.data.smtp_user || '',
        // Don't update passwords if they're masked
        openai_key: response.data.openai_key === '***' ? '' : response.data.openai_key || '',
        smtp_pass: response.data.smtp_pass === '***' ? '' : response.data.smtp_pass || ''
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
    await fetchSystemStatus();
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    setConfigLoading(true);
    setMessage('');

    try {
      await axios.post('/config', config);
      setMessage('Configuration saved successfully!');
      
      // Refresh system status after config update
      setTimeout(() => {
        fetchSystemStatus();
      }, 1000);
    } catch (error) {
      setMessage(`Failed to save configuration: ${error.response?.data?.detail || error.message}`);
    }

    setConfigLoading(false);
  };

  const getStatusColor = (status) => {
    return status ? '#00FF00' : '#FF0000';
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
              <div>{systemStatus.message}</div>
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

            <div className="config-form">
              <h2 className="config-title">System Configuration</h2>
              
              <div className="config-grid">
                <div className="form-group">
                  <label className="form-label">OpenAI API Key</label>
                  <input
                    type="password"
                    name="openai_key"
                    value={config.openai_key}
                    onChange={handleConfigChange}
                    placeholder="Enter your OpenAI API key"
                    className="form-input"
                  />
                  <small style={{ color: '#666666', fontSize: '12px' }}>
                    Required for AI features
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
                  <label className="form-label">SMTP Username</label>
                  <input
                    type="email"
                    name="smtp_user"
                    value={config.smtp_user}
                    onChange={handleConfigChange}
                    placeholder="your-email@gmail.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SMTP Password</label>
                  <input
                    type="password"
                    name="smtp_pass"
                    value={config.smtp_pass}
                    onChange={handleConfigChange}
                    placeholder="Your app password"
                    className="form-input"
                  />
                  <small style={{ color: '#666666', fontSize: '12px' }}>
                    Use app password for Gmail
                  </small>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button 
                  onClick={handleSaveConfig}
                  disabled={configLoading}
                  className="btn-primary"
                >
                  {configLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>

              {message && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  borderRadius: '4px',
                  backgroundColor: message.includes('successfully') ? '#001100' : '#110000',
                  border: `1px solid ${message.includes('successfully') ? '#00FF00' : '#FF0000'}`,
                  color: message.includes('successfully') ? '#00FF00' : '#FF0000'
                }}>
                  {message}
                </div>
              )}
            </div>
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
                  {systemStatus.openai_connected ? '✅ Connected' : '❌ Disconnected'}
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
                  {systemStatus.smtp_connected ? '✅ Connected' : '❌ Disconnected'}
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
                  {systemStatus.database_connected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="logs-panel">
            <h3 className="logs-title">Configuration Guide</h3>
            <div style={{ fontSize: '12px', color: '#666666' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#00FF00' }}>OpenAI API Key:</strong>
                <br />
                Get from platform.openai.com
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#00FF00' }}>Gmail SMTP:</strong>
                <br />
                Host: smtp.gmail.com
                <br />
                Port: 587
                <br />
                Use app password
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