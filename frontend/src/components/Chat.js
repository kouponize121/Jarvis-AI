import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Chat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemReady, setSystemReady] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    // Check system status first
    try {
      const statusResponse = await axios.get('/system/status');
      const isReady = statusResponse.data.openai_connected;
      setSystemReady(isReady);
      
      // Initial system messages based on actual status
      addMessage('system', '> Jarvis AI Assistant initialized.');
      addSystemLog('Jarvis AI Assistant started');
      
      if (isReady) {
        addMessage('jarvis', 'Hello! I am Jarvis, your AI personal assistant. I can help you with meetings, tasks, to-dos, and emails. Try commands like "start meeting", "create task", or "system check".');
        addSystemLog('OpenAI API connected - Ready to assist');
      } else {
        addMessage('system', '> ⚠️ OpenAI API not configured. Please configure your API key in System settings to enable AI features.');
        addMessage('jarvis', 'I notice my AI capabilities are not yet configured. Please go to System settings to add your OpenAI API key and SMTP configuration. Until then, I can help with basic commands like "start meeting" and "system check".');
        addSystemLog('OpenAI API not configured - Limited functionality');
      }
    } catch (error) {
      addMessage('system', '> Error checking system status. Please check your connection.');
      addSystemLog('Error checking system status');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (type, content) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { type, content, timestamp }]);
  };

  const addSystemLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev, { message, timestamp }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message
    addMessage('user', `> ${userMessage}`);
    addSystemLog(`User command: ${userMessage}`);

    try {
      // Handle special commands that don't require AI
      if (userMessage.toLowerCase().includes('start meeting')) {
        await handleStartMeeting();
      } else if (userMessage.toLowerCase().includes('end meeting')) {
        await handleEndMeeting();
      } else if (userMessage.toLowerCase().includes('system check')) {
        await handleSystemCheck();
      } else if (userMessage.toLowerCase().includes('who created you')) {
        addMessage('jarvis', '> I was created by Sumit Roy.');
        addSystemLog('Creator information provided');
      } else {
        // For AI-powered responses, check if system is ready
        if (!systemReady) {
          addMessage('system', '> AI features are not available. Please configure your OpenAI API key in System settings first.');
          addSystemLog('AI request blocked - API not configured');
        } else {
          // Send to AI for processing
          const response = await axios.post('/chat', {
            message: userMessage,
            context: currentMeeting ? `Current meeting: ${currentMeeting.id}` : ''
          });

          addMessage('jarvis', response.data.response);
          addSystemLog(`AI response generated`);

          // Handle detected commands
          if (response.data.command_detected) {
            addSystemLog(`Command detected: ${response.data.command_detected}`);
            await handleDetectedCommand(response.data.command_detected, response.data.action_required);
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        addMessage('system', `> Authentication error. Please log in again.`);
        onLogout();
      } else {
        addMessage('system', `> Error: ${error.response?.data?.detail || error.message}`);
        addSystemLog(`Error: ${error.message}`);
      }
    }

    setLoading(false);
  };

  const handleStartMeeting = async () => {
    try {
      const response = await axios.post('/meetings/start', {
        title: 'Meeting ' + new Date().toLocaleString(),
        attendees: ''
      });
      
      setCurrentMeeting({ id: response.data.meeting_id });
      addMessage('jarvis', `> Meeting started (ID: ${response.data.meeting_id}). You can now add notes or say "end meeting" to generate MoM.`);
      addSystemLog(`Meeting started: ${response.data.meeting_id}`);
    } catch (error) {
      addMessage('system', `> Failed to start meeting: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleEndMeeting = async () => {
    if (!currentMeeting) {
      addMessage('jarvis', '> No active meeting to end.');
      return;
    }

    try {
      if (!systemReady) {
        addMessage('system', '> Cannot generate Meeting Minutes - OpenAI API not configured. Meeting ended without MoM generation.');
        setCurrentMeeting(null);
        addSystemLog(`Meeting ended without MoM: ${currentMeeting.id}`);
        return;
      }

      const response = await axios.post(`/meetings/${currentMeeting.id}/end`);
      addMessage('jarvis', `> Meeting ended. Minutes of Meeting generated:`);
      addMessage('jarvis', response.data.mom);
      
      setCurrentMeeting(null);
      addSystemLog(`Meeting ended with MoM: ${currentMeeting.id}`);
    } catch (error) {
      addMessage('system', `> Failed to end meeting: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleSystemCheck = async () => {
    try {
      const response = await axios.get('/system/status');
      addMessage('system', response.data.message);
      setSystemReady(response.data.openai_connected);
      addSystemLog('System check completed');
      
      if (response.data.openai_connected) {
        addMessage('jarvis', '> All systems operational. I am ready to assist with AI-powered features!');
      } else {
        addMessage('jarvis', '> Some systems need configuration. Please visit System settings to configure OpenAI API and SMTP.');
      }
    } catch (error) {
      addMessage('system', `> System check failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDetectedCommand = async (command, action) => {
    switch (command) {
      case 'create_task':
        addMessage('jarvis', '> I can help you create a task. Please use the format: "create task: [title] - [description] - [assignee_email]"');
        break;
      case 'create_todo':
        addMessage('jarvis', '> I can help you create a to-do. Please use the format: "create todo: [title] - [description]"');
        break;
      case 'send_email':
        if (!systemReady) {
          addMessage('system', '> Email features require both OpenAI API and SMTP configuration.');
        } else {
          addMessage('jarvis', '> I can help you send an email. Please use the format: "send email to [recipient]: [subject] - [message]"');
        }
        break;
      default:
        break;
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <div key={index}>{line}</div>
    ));
  };

  return (
    <div className="main-layout">
      <header className="header">
        <h1 className="header-title">JARVIS AI Chat</h1>
        <div className="header-user">
          <nav className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/chat" className="nav-link active">Chat</Link>
            <Link to="/system" className="nav-link">System</Link>
          </nav>
          <span>Hello, {user.name}</span>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="content-left">
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`chat-message ${message.type}`}>
                  <span style={{ opacity: 0.7, fontSize: '12px' }}>
                    [{message.timestamp}]
                  </span>
                  <div style={{ marginTop: '4px' }}>
                    {formatMessage(message.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message jarvis">
                  <span style={{ opacity: 0.7 }}>Jarvis is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  currentMeeting 
                    ? "Add meeting note or type a command..." 
                    : systemReady 
                      ? "Type a command or message..." 
                      : "Limited mode - configure OpenAI API for full features"
                }
                className="chat-input"
                disabled={loading}
              />
              <button type="submit" className="btn-send" disabled={loading}>
                SEND
              </button>
            </form>

            {/* Status indicators */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {currentMeeting && (
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#111111', 
                  border: '1px solid #FFFF00',
                  borderRadius: '4px',
                  color: '#FFFF00',
                  fontSize: '12px'
                }}>
                  <strong>Active Meeting:</strong> ID {currentMeeting.id}
                </div>
              )}
              
              <div style={{ 
                padding: '8px 12px', 
                background: '#111111', 
                border: `1px solid ${systemReady ? '#00FF00' : '#FF0000'}`,
                borderRadius: '4px',
                color: systemReady ? '#00FF00' : '#FF0000',
                fontSize: '12px'
              }}>
                <strong>AI Status:</strong> {systemReady ? 'Ready' : 'Configure API'}
              </div>
            </div>
          </div>
        </div>

        <div className="content-right">
          <div className="neural-panel">
            <h3 className="neural-title">Neural Activity</h3>
            <div className="neural-visual">
              <div className="neural-wave"></div>
              <div className="neural-dots">
                <div className="neural-dot"></div>
                <div className="neural-dot"></div>
                <div className="neural-dot"></div>
                <div className="neural-dot"></div>
                <div className="neural-dot"></div>
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '10px', 
              fontSize: '12px',
              color: systemReady ? '#00FF00' : '#FF0000'
            }}>
              {systemReady ? 'AI Online' : 'AI Offline'}
            </div>
          </div>

          <div className="logs-panel">
            <h3 className="logs-title">System Logs</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {systemLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  [{log.timestamp}] {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;