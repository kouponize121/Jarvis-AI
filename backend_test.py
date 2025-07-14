#!/usr/bin/env python3
"""
Backend API Testing Script for Jarvis AI Assistant
Tests all critical backend endpoints to ensure functionality after frontend changes
"""

import requests
import json
import os
import sys
from datetime import datetime
import time

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://52b5b970-25e7-4578-9fbb-6643a5c3f518.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_user_registration(self):
        """Test POST /api/register"""
        test_name = "User Registration"
        
        # Use realistic test data
        test_user = {
            "name": "Sarah Johnson",
            "email": f"sarah.johnson.{int(time.time())}@techcorp.com",
            "password": "SecurePass123!",
            "security_question": "What was your first pet's name?",
            "security_answer": "Buddy"
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/register", json=test_user)
            
            if response.status_code == 200:
                data = response.json()
                if 'user_id' in data and 'message' in data:
                    self.log_result(test_name, True, "User registered successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_user_login(self):
        """Test POST /api/login"""
        test_name = "User Login"
        
        # First register a user for login test
        test_user = {
            "name": "Michael Chen",
            "email": f"michael.chen.{int(time.time())}@innovate.com",
            "password": "LoginTest456!",
            "security_question": "What city were you born in?",
            "security_answer": "Seattle"
        }
        
        try:
            # Register user first
            reg_response = self.session.post(f"{API_BASE_URL}/register", json=test_user)
            if reg_response.status_code != 200:
                self.log_result(test_name, False, "Failed to register test user", reg_response.text)
                return False
            
            # Now test login
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            
            response = self.session.post(f"{API_BASE_URL}/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'user' in data:
                    self.access_token = data['access_token']
                    self.user_id = data['user']['id']
                    self.log_result(test_name, True, "User logged in successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_get_current_user(self):
        """Test GET /api/me"""
        test_name = "Get Current User Info"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'name' in data and 'email' in data:
                    self.log_result(test_name, True, "User info retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_dashboard_data(self):
        """Test GET /api/dashboard"""
        test_name = "Dashboard Data"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/dashboard", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['recent_meetings', 'active_tasks', 'pending_todos', 'recent_emails']
                if all(field in data for field in required_fields):
                    self.log_result(test_name, True, "Dashboard data retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required fields", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_chat_functionality(self):
        """Test POST /api/chat"""
        test_name = "AI Chat Functionality"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            chat_data = {
                "message": "Hello Jarvis, can you help me with my tasks today?",
                "context": "User greeting and task inquiry"
            }
            
            response = self.session.post(f"{API_BASE_URL}/chat", json=chat_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'response' in data:
                    self.log_result(test_name, True, "Chat response received successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_system_status(self):
        """Test GET /api/system/status"""
        test_name = "System Status"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/system/status", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['openai_connected', 'smtp_connected', 'database_connected', 'message']
                if all(field in data for field in required_fields):
                    self.log_result(test_name, True, "System status retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Missing required fields", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_meetings_endpoint(self):
        """Test GET /api/meetings"""
        test_name = "Meetings Listing"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/meetings", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, "Meetings list retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format - expected list", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_tasks_endpoint(self):
        """Test GET /api/tasks"""
        test_name = "Tasks Listing"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/tasks", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, "Tasks list retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format - expected list", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_todos_endpoint(self):
        """Test GET /api/todos"""
        test_name = "Todos Listing"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/todos", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, "Todos list retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format - expected list", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_emails_endpoint(self):
        """Test GET /api/emails"""
        test_name = "Emails Listing"
        
        if not self.access_token:
            self.log_result(test_name, False, "No access token available", "Login test must pass first")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(f"{API_BASE_URL}/emails", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, "Emails list retrieved successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid response format - expected list", data)
                    return False
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def test_authentication_protection(self):
        """Test that protected endpoints require authentication"""
        test_name = "Authentication Protection"
        
        try:
            # Test accessing protected endpoint without token
            response = self.session.get(f"{API_BASE_URL}/dashboard")
            
            if response.status_code == 401:
                self.log_result(test_name, True, "Protected endpoints properly require authentication")
                return True
            else:
                self.log_result(test_name, False, f"Expected 401, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result(test_name, False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print(f"\n🚀 Starting Backend API Tests for Jarvis AI Assistant")
        print(f"📍 Testing against: {API_BASE_URL}")
        print("=" * 60)
        
        # Test sequence - order matters for authentication
        tests = [
            self.test_authentication_protection,
            self.test_user_registration,
            self.test_user_login,
            self.test_get_current_user,
            self.test_dashboard_data,
            self.test_chat_functionality,
            self.test_system_status,
            self.test_meetings_endpoint,
            self.test_tasks_endpoint,
            self.test_todos_endpoint,
            self.test_emails_endpoint,
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
                failed += 1
            
            time.sleep(0.5)  # Small delay between tests
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("🎉 All backend tests passed! The API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()