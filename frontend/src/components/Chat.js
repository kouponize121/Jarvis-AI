import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Chat = ({ user, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [meetingFlow, setMeetingFlow] = useState(null); // New state for meeting flow
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemReady, setSystemReady] = useState(false);
  const [neuralActivity, setNeuralActivity] = useState('idle'); // idle, thinking, active, processing
  const [aiStatus, setAiStatus] = useState('Initializing...');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update neural activity based on AI state
  useEffect(() => {
    if (loading) {
      setNeuralActivity('thinking');
      setAiStatus('Processing...');
    } else if (systemReady) {
      setNeuralActivity('active');
      setAiStatus('AI Online');
    } else {
      setNeuralActivity('idle');
      setAiStatus('AI Offline');
    }
  }, [loading, systemReady]);

  const initializeChat = async () => {
    setNeuralActivity('processing');
    setAiStatus('Initializing...');
    
    // Check system status first
    try {
      const statusResponse = await axios.get('/system/status');
      const isReady = statusResponse.data.openai_connected;
      setSystemReady(isReady);
      
      // Check for active meeting flow
      const flowResponse = await axios.get('/meetings/flow/status');
      if (flowResponse.data.flow_state !== 'none') {
        setMeetingFlow(flowResponse.data);
      }
      
      // Initial system messages based on actual status
      addMessage('system', '> Jarvis AI Assistant initialized.');
      addSystemLog('Jarvis AI Assistant started');
      
      if (isReady) {
        setNeuralActivity('active');
        setAiStatus('AI Online - Ready');
        addMessage('jarvis', 'Hello! I am Jarvis, your AI personal assistant. I can help you with meetings, tasks, to-dos, and emails. Try commands like "start meeting", "create task", or "system check".');
        addSystemLog('OpenAI API connected - Ready to assist');
      } else {
        setNeuralActivity('idle');
        setAiStatus('AI Offline - Config Needed');
        addMessage('system', '> ⚠️ OpenAI API not configured. Please configure your API key in System settings to enable AI features.');
        addMessage('jarvis', 'I notice my AI capabilities are not yet configured. Please go to System settings to add your OpenAI API key and SMTP configuration. Until then, I can help with basic commands like "start meeting" and "system check".');
        addSystemLog('OpenAI API not configured - Limited functionality');
      }
    } catch (error) {
      setNeuralActivity('idle');
      setAiStatus('Connection Error');
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

    // Neural activity starts processing
    setNeuralActivity('thinking');
    setAiStatus('Processing Command...');

    // Add user message
    addMessage('user', `> ${userMessage}`);
    addSystemLog(`User command: ${userMessage}`);

    try {
      // Check if we're in a meeting flow
      if (meetingFlow && meetingFlow.flow_state !== 'none') {
        await handleMeetingFlowInput(userMessage);
      } else {
        // Handle special commands that don't require AI
        if (userMessage.toLowerCase().includes('start meeting') || userMessage.toLowerCase().includes('meeting')) {
          setNeuralActivity('processing');
          setAiStatus('Starting Meeting Flow...');
          await handleStartMeetingFlow(userMessage);
        } else if (userMessage.toLowerCase().includes('end meeting')) {
          setNeuralActivity('processing');
          setAiStatus('Ending Meeting...');
          await handleEndMeetingFlow();
        } else if (userMessage.toLowerCase().includes('system check')) {
          setNeuralActivity('processing');
          setAiStatus('System Check...');
          await handleSystemCheck();
        } else if (userMessage.toLowerCase().includes('who created you')) {
          setNeuralActivity('processing');
          setAiStatus('Accessing Memory...');
          // Add small delay to show neural activity
          await new Promise(resolve => setTimeout(resolve, 800));
          addMessage('jarvis', '> I was created by Sumit Roy.');
          addSystemLog('Creator information provided');
        } else {
          // For AI-powered responses, check if system is ready
          if (!systemReady) {
            setNeuralActivity('idle');
            setAiStatus('AI Offline - Config Needed');
            addMessage('system', '> AI features are not available. Please configure your OpenAI API key in System settings first.');
            addSystemLog('AI request blocked - API not configured');
          } else {
            // Send to AI for processing
            setNeuralActivity('thinking');
            setAiStatus('AI Thinking...');
            
            const response = await axios.post('/chat', {
              message: userMessage,
              context: currentMeeting ? `Current meeting: ${currentMeeting.id}` : ''
            });

            setNeuralActivity('active');
            setAiStatus('AI Response Generated');
            
            addMessage('jarvis', response.data.response);
            addSystemLog(`AI response generated`);

            // Handle detected commands
            if (response.data.command_detected) {
              setNeuralActivity('processing');
              setAiStatus('Command Detected...');
              addSystemLog(`Command detected: ${response.data.command_detected}`);
              await handleDetectedCommand(response.data.command_detected, response.data.action_required);
            }
          }
        }
      }
    } catch (error) {
      setNeuralActivity('idle');
      setAiStatus('Error Occurred');
      
      if (error.response?.status === 401) {
        addMessage('system', `> Authentication error. Please log in again.`);
        onLogout();
      } else {
        addMessage('system', `> Error: ${error.response?.data?.detail || error.message}`);
        addSystemLog(`Error: ${error.message}`);
      }
    }

    // Reset to normal state after processing
    setTimeout(() => {
      setLoading(false);
      if (systemReady) {
        setNeuralActivity('active');
        setAiStatus('AI Online - Ready');
      } else {
        setNeuralActivity('idle');
        setAiStatus('AI Offline');
      }
    }, 500);
  };

  // New Meeting Flow Functions
  const handleStartMeetingFlow = async (userMessage) => {
    try {
      // Extract attendee names from the message
      addMessage('jarvis', '> Please provide the names of the attendees (comma-separated):');
      addSystemLog('Collecting attendee names');
      
      // Wait for user to provide attendees
      setMeetingFlow({ flow_state: 'waiting_for_attendees' });
    } catch (error) {
      addMessage('system', `> Failed to start meeting flow: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleMeetingFlowInput = async (userMessage) => {
    try {
      if (meetingFlow.flow_state === 'waiting_for_attendees') {
        // Parse attendee names
        const attendeeNames = userMessage.split(',').map(name => name.trim()).filter(name => name.length > 0);
        
        if (attendeeNames.length === 0) {
          addMessage('jarvis', '> Please provide at least one attendee name.');
          return;
        }

        // Start meeting flow with attendees
        const response = await axios.post('/meetings/flow/start', {
          attendees: attendeeNames
        });

        if (response.data.missing_emails.length > 0) {
          addMessage('jarvis', `> I found emails for: ${response.data.attendees_with_emails.map(a => a.name).join(', ')}`);
          addMessage('jarvis', `> Please provide email addresses for: ${response.data.missing_emails.join(', ')}`);
          addMessage('jarvis', `> Please provide the email for ${response.data.missing_emails[0]}:`);
          
          setMeetingFlow({
            flow_state: 'collecting_emails',
            missing_emails: response.data.missing_emails,
            current_attendee: response.data.missing_emails[0]
          });
        } else {
          addMessage('jarvis', `> All attendees found in contacts. Meeting flow started.`);
          addMessage('jarvis', `> Please share the meeting notes:`);
          
          setMeetingFlow({ flow_state: 'collecting_notes' });
        }
      } else if (meetingFlow.flow_state === 'collecting_emails') {
        // Add email for current attendee
        const response = await axios.post('/meetings/flow/add-email', {
          name: meetingFlow.current_attendee,
          email: userMessage.trim()
        });

        addMessage('jarvis', `> Email added for ${meetingFlow.current_attendee}`);

        if (response.data.remaining_missing.length > 0) {
          addMessage('jarvis', `> Please provide the email for ${response.data.remaining_missing[0]}:`);
          setMeetingFlow({
            ...meetingFlow,
            current_attendee: response.data.remaining_missing[0]
          });
        } else {
          addMessage('jarvis', `> All attendees confirmed. Please share the meeting notes:`);
          setMeetingFlow({ flow_state: 'collecting_notes' });
        }
      } else if (meetingFlow.flow_state === 'collecting_notes') {
        // Add note to meeting
        await axios.post('/meetings/flow/add-note', {
          note: userMessage
        });

        addMessage('jarvis', `> Note recorded: "${userMessage}"`);
        addMessage('jarvis', `> Continue sharing notes or say "meeting end" to finish.`);
      } else if (meetingFlow.flow_state === 'confirming_summary') {
        // Handle summary confirmation
        const approved = userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('approve') || userMessage.toLowerCase().includes('confirm');
        
        if (approved) {
          const response = await axios.post('/meetings/flow/confirm-summary', {
            approved: true
          });
          
          addMessage('jarvis', `> MoM generated successfully!`);
          addMessage('jarvis', response.data.mom);
          addMessage('jarvis', `> Ready to send emails to attendees. Say "send emails" to proceed.`);
          
          setMeetingFlow({ 
            flow_state: 'sending_emails',
            meeting_id: response.data.meeting_id,
            attendees: response.data.attendees
          });
        } else {
          addMessage('jarvis', `> Summary not approved. Please provide feedback or say "restart meeting" to start over.`);
        }
      } else if (meetingFlow.flow_state === 'sending_emails') {
        if (userMessage.toLowerCase().includes('send emails')) {
          const response = await axios.post('/meetings/flow/send-emails', {
            meeting_id: meetingFlow.meeting_id,
            attendees: meetingFlow.attendees.map(a => a.email)
          });
          
          addMessage('jarvis', `> ${response.data.message}`);
          addMessage('jarvis', `> Emails sent to: ${response.data.sent_emails.join(', ')}`);
          
          if (response.data.failed_emails.length > 0) {
            addMessage('jarvis', `> Failed to send emails to: ${response.data.failed_emails.join(', ')}`);
          }
          
          setMeetingFlow(null);
          addSystemLog('Meeting flow completed');
        } else {
          addMessage('jarvis', `> Say "send emails" to send the MoM to all attendees.`);
        }
      }
    } catch (error) {
      addMessage('system', `> Meeting flow error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleEndMeetingFlow = async () => {
    try {
      if (!meetingFlow || meetingFlow.flow_state !== 'collecting_notes') {
        addMessage('jarvis', '> No active meeting in note collection phase.');
        return;
      }

      const response = await axios.post('/meetings/flow/end');
      
      addMessage('jarvis', `> Meeting ended. Here's the summary:`);
      addMessage('jarvis', response.data.summary);
      addMessage('jarvis', `> Please review and confirm this summary (say "yes" to approve or provide feedback).`);
      
      setMeetingFlow({ flow_state: 'confirming_summary' });
    } catch (error) {
      addMessage('system', `> Failed to end meeting: ${error.response?.data?.detail || error.message}`);
    }
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

      setAiStatus('Generating MoM...');
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
      const wasReady = systemReady;
      setSystemReady(response.data.openai_connected);
      addSystemLog('System check completed');
      
      if (response.data.openai_connected) {
        if (!wasReady) {
          setNeuralActivity('active');
          setAiStatus('AI Online - Ready');
        }
        addMessage('jarvis', '> All systems operational. I am ready to assist with AI-powered features!');
      } else {
        setNeuralActivity('idle');
        setAiStatus('AI Offline - Config Needed');
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

  // Get neural activity class based on state
  const getNeuralActivityClass = () => {
    switch (neuralActivity) {
      case 'thinking':
        return 'neural-thinking';
      case 'processing':
        return 'neural-processing';
      case 'active':
        return 'neural-active';
      default:
        return 'neural-idle';
    }
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
                  meetingFlow && meetingFlow.flow_state === 'waiting_for_attendees' 
                    ? "Enter attendee names (comma-separated)..." 
                    : meetingFlow && meetingFlow.flow_state === 'collecting_emails'
                    ? `Enter email for ${meetingFlow.current_attendee}...`
                    : meetingFlow && meetingFlow.flow_state === 'collecting_notes'
                    ? "Add meeting note or say 'meeting end'..."
                    : meetingFlow && meetingFlow.flow_state === 'confirming_summary'
                    ? "Approve summary (yes/no) or provide feedback..."
                    : meetingFlow && meetingFlow.flow_state === 'sending_emails'
                    ? "Say 'send emails' to send MoM to attendees..."
                    : currentMeeting 
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
              {meetingFlow && (
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#111111', 
                  border: '1px solid #00FFFF',
                  borderRadius: '4px',
                  color: '#00FFFF',
                  fontSize: '12px'
                }}>
                  <strong>Meeting Flow:</strong> {meetingFlow.flow_state}
                </div>
              )}
              
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
            <div className={`neural-visual ${getNeuralActivityClass()}`}>
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
              {aiStatus}
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