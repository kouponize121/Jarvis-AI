import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState({
    recent_meetings: [],
    active_tasks: [],
    pending_todos: [],
    recent_emails: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="main-layout">
        <div className="loading">
          <div className="terminal-text">
            <span className="prompt">&gt;</span> Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <header className="header">
        <h1 className="header-title">JARVIS AI Dashboard</h1>
        <div className="header-user">
          <nav className="nav-links">
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/chat" className="nav-link">Chat</Link>
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
          <div className="dashboard-container">
            <h2 className="dashboard-title">
              <span className="prompt">&gt;</span> System Overview
            </h2>
            
            <div className="dashboard-grid">
              {/* Recent Meetings */}
              <div className="dashboard-panel">
                <div className="panel-title">
                  Recent Meetings
                  <span className="status-badge active">
                    {dashboardData.recent_meetings.length}
                  </span>
                </div>
                <div className="panel-content">
                  {dashboardData.recent_meetings.length > 0 ? (
                    dashboardData.recent_meetings.map((meeting) => (
                      <div key={meeting.id} className="panel-item">
                        <div className="item-title">
                          {meeting.title || `Meeting ${meeting.id}`}
                        </div>
                        <div className="item-subtitle">
                          {formatDate(meeting.created_at)} • {formatTime(meeting.created_at)}
                        </div>
                        <div className="item-description">
                          Status: <span className={`status-badge ${meeting.status}`}>
                            {meeting.status}
                          </span>
                        </div>
                        {meeting.attendees && (
                          <div className="item-description">
                            Attendees: {meeting.attendees}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No recent meetings</div>
                  )}
                </div>
              </div>

              {/* Active Tasks */}
              <div className="dashboard-panel">
                <div className="panel-title">
                  Active Tasks
                  <span className="status-badge pending">
                    {dashboardData.active_tasks.length}
                  </span>
                </div>
                <div className="panel-content">
                  {dashboardData.active_tasks.length > 0 ? (
                    dashboardData.active_tasks.map((task) => (
                      <div key={task.id} className="panel-item">
                        <div className="item-title">{task.title}</div>
                        <div className="item-subtitle">
                          Priority: {task.priority} • Created: {formatDate(task.created_at)}
                        </div>
                        {task.assignee && (
                          <div className="item-description">
                            Assigned to: {task.assignee}
                          </div>
                        )}
                        <div className="item-description">
                          Status: <span className={`status-badge ${task.status}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No active tasks</div>
                  )}
                </div>
              </div>

              {/* Pending To-Dos */}
              <div className="dashboard-panel">
                <div className="panel-title">
                  Pending To-Dos
                  <span className="status-badge pending">
                    {dashboardData.pending_todos.length}
                  </span>
                </div>
                <div className="panel-content">
                  {dashboardData.pending_todos.length > 0 ? (
                    dashboardData.pending_todos.map((todo) => (
                      <div key={todo.id} className="panel-item">
                        <div className="item-title">{todo.title}</div>
                        <div className="item-subtitle">
                          Created: {formatDate(todo.created_at)}
                        </div>
                        {todo.description && (
                          <div className="item-description">
                            {todo.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No pending todos</div>
                  )}
                </div>
              </div>

              {/* Recent Emails */}
              <div className="dashboard-panel">
                <div className="panel-title">
                  Recent Emails
                  <span className="status-badge active">
                    {dashboardData.recent_emails.length}
                  </span>
                </div>
                <div className="panel-content">
                  {dashboardData.recent_emails.length > 0 ? (
                    dashboardData.recent_emails.map((email) => (
                      <div key={email.id} className="panel-item">
                        <div className="item-title">{email.subject}</div>
                        <div className="item-subtitle">
                          To: {email.recipient} • {formatDate(email.sent_at)}
                        </div>
                        <div className="item-description">
                          Type: {email.email_type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No recent emails</div>
                  )}
                </div>
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
          </div>

          <div className="logs-panel">
            <h3 className="logs-title">System Logs</h3>
            <div className="log-entry success">
              [{formatTime(new Date())}] Dashboard loaded successfully
            </div>
            <div className="log-entry success">
              [{formatTime(new Date())}] User authenticated: {user.name}
            </div>
            <div className="log-entry">
              [{formatTime(new Date())}] Meetings: {dashboardData.recent_meetings.length}
            </div>
            <div className="log-entry">
              [{formatTime(new Date())}] Active tasks: {dashboardData.active_tasks.length}
            </div>
            <div className="log-entry">
              [{formatTime(new Date())}] Pending todos: {dashboardData.pending_todos.length}
            </div>
            <div className="log-entry">
              [{formatTime(new Date())}] Recent emails: {dashboardData.recent_emails.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;