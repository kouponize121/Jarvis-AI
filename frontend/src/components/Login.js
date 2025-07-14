import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    security_question: '',
    security_answer: ''
  });
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    security_answer: '',
    new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // For forgot password flow

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(endpoint, payload);

      if (isLogin) {
        onLogin(response.data.access_token, response.data.user);
      } else {
        setError('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({
          name: '',
          email: '',
          password: '',
          security_question: '',
          security_answer: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
    }

    setLoading(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (step === 1) {
        // Verify email and get security question
        const response = await axios.post('/forgot-password/verify', {
          email: forgotPasswordData.email
        });
        setError(`Security Question: ${response.data.security_question}`);
        setStep(2);
      } else {
        // Reset password with security answer
        await axios.post('/forgot-password/reset', forgotPasswordData);
        setError('Password reset successful! Please login with your new password.');
        setShowForgotPassword(false);
        setStep(1);
        setForgotPasswordData({ email: '', security_answer: '', new_password: '' });
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
    }

    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1 className="login-title">FORGOT PASSWORD</h1>
          
          <form onSubmit={handleForgotPasswordSubmit}>
            {step === 1 ? (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  placeholder="Enter your email"
                  className="form-input"
                  required
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Security Answer</label>
                  <input
                    type="text"
                    name="security_answer"
                    value={forgotPasswordData.security_answer}
                    onChange={handleForgotPasswordChange}
                    placeholder="Enter your security answer"
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={forgotPasswordData.new_password}
                    onChange={handleForgotPasswordChange}
                    placeholder="Enter new password"
                    className="form-input"
                    required
                  />
                </div>
              </>
            )}
            
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : (step === 1 ? 'VERIFY EMAIL' : 'RESET PASSWORD')}
            </button>
          </form>
          
          {error && (
            <div className={`error-message ${error.includes('successful') || error.includes('Security Question:') ? 'success-message' : ''}`}>
              {error}
            </div>
          )}
          
          <a 
            href="#" 
            className="toggle-link"
            onClick={() => {
              setShowForgotPassword(false);
              setStep(1);
              setError('');
              setForgotPasswordData({ email: '', security_answer: '', new_password: '' });
            }}
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">
          {isLogin ? 'JARVIS LOGIN' : 'JARVIS REGISTER'}
        </h1>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="form-input"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="form-input"
              required
            />
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Security Question</label>
                <input
                  type="text"
                  name="security_question"
                  value={formData.security_question}
                  onChange={handleChange}
                  placeholder="What's your favorite color?"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Security Answer</label>
                <input
                  type="text"
                  name="security_answer"
                  value={formData.security_answer}
                  onChange={handleChange}
                  placeholder="Enter your answer"
                  className="form-input"
                />
              </div>
            </>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'LOGIN' : 'REGISTER')}
          </button>
        </form>
        
        {error && (
          <div className={`error-message ${error.includes('successful') ? 'success-message' : ''}`}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
          <a 
            href="#" 
            className="toggle-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                name: '',
                email: '',
                password: '',
                security_question: '',
                security_answer: ''
              });
            }}
          >
            {isLogin ? 'Need an account? Register here' : 'Already have an account? Login here'}
          </a>
          
          {isLogin && (
            <a 
              href="#" 
              className="toggle-link"
              onClick={() => {
                setShowForgotPassword(true);
                setError('');
              }}
            >
              Forgot password?
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;