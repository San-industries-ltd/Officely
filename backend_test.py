#!/usr/bin/env python3
"""
Backend API Testing for Office Attendance System
Tests all API endpoints and database operations
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import uuid

# Configuration
BASE_URL = "http://localhost:3000/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.sample_user_id = None
        self.sample_attendance_id = None
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
    def test_health_check(self):
        """Test API health check endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'endpoints' in data:
                    self.log_test("Health Check", True, f"API is running. Status: {response.status_code}", data)
                    return True
                else:
                    self.log_test("Health Check", False, "Response missing required fields", data)
                    return False
            else:
                self.log_test("Health Check", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_employees(self):
        """Test getting all employees"""
        try:
            response = self.session.get(f"{BASE_URL}/employees")
            
            if response.status_code == 200:
                employees = response.json()
                if isinstance(employees, list) and len(employees) > 0:
                    # Store first employee ID for later tests
                    if employees[0].get('id'):
                        self.sample_user_id = employees[0]['id']
                    
                    # Check if sample employees exist
                    sample_emails = ['john@company.com', 'sarah@company.com', 'hr@company.com']
                    found_emails = [emp.get('email') for emp in employees]
                    
                    if any(email in found_emails for email in sample_emails):
                        self.log_test("Get Employees", True, f"Retrieved {len(employees)} employees with sample data", employees[:2])
                        return True
                    else:
                        self.log_test("Get Employees", True, f"Retrieved {len(employees)} employees (no sample data)", employees[:2])
                        return True
                else:
                    self.log_test("Get Employees", False, "No employees found or invalid response format", employees)
                    return False
            else:
                self.log_test("Get Employees", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Employees", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_attendance(self):
        """Test getting all attendance records"""
        try:
            response = self.session.get(f"{BASE_URL}/attendance")
            
            if response.status_code == 200:
                attendance = response.json()
                if isinstance(attendance, list):
                    if len(attendance) > 0 and attendance[0].get('id'):
                        self.sample_attendance_id = attendance[0]['id']
                    
                    self.log_test("Get Attendance", True, f"Retrieved {len(attendance)} attendance records", attendance[:2])
                    return True
                else:
                    self.log_test("Get Attendance", False, "Invalid response format", attendance)
                    return False
            else:
                self.log_test("Get Attendance", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Attendance", False, f"Request failed: {str(e)}")
            return False
    
    def test_login_valid_credentials(self):
        """Test login with valid sample credentials"""
        try:
            login_data = {
                "email": "john@company.com",
                "password": "password123"
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get('email') == login_data['email'] and 'password' not in user_data:
                    self.log_test("Login Valid Credentials", True, "Successfully logged in with sample user", user_data)
                    return True
                else:
                    self.log_test("Login Valid Credentials", False, "Invalid response data or password exposed", user_data)
                    return False
            else:
                self.log_test("Login Valid Credentials", False, f"Login failed with status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Login Valid Credentials", False, f"Request failed: {str(e)}")
            return False
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        try:
            login_data = {
                "email": "invalid@company.com",
                "password": "wrongpassword"
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 401:
                error_data = response.json()
                if 'error' in error_data:
                    self.log_test("Login Invalid Credentials", True, "Correctly rejected invalid credentials", error_data)
                    return True
                else:
                    self.log_test("Login Invalid Credentials", False, "Missing error message in response", error_data)
                    return False
            else:
                self.log_test("Login Invalid Credentials", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Login Invalid Credentials", False, f"Request failed: {str(e)}")
            return False
    
    def test_signup_new_user(self):
        """Test user registration"""
        try:
            # Generate unique email to avoid conflicts
            unique_email = f"testuser_{uuid.uuid4().hex[:8]}@company.com"
            
            signup_data = {
                "name": "Test User",
                "email": unique_email,
                "password": "testpass123",
                "role": "employee"
            }
            
            response = self.session.post(f"{BASE_URL}/auth/signup", json=signup_data)
            
            if response.status_code == 200:
                user_data = response.json()
                if (user_data.get('email') == unique_email and 
                    user_data.get('name') == signup_data['name'] and 
                    'password' not in user_data):
                    self.log_test("Signup New User", True, "Successfully created new user", user_data)
                    return True
                else:
                    self.log_test("Signup New User", False, "Invalid response data or password exposed", user_data)
                    return False
            else:
                self.log_test("Signup New User", False, f"Signup failed with status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Signup New User", False, f"Request failed: {str(e)}")
            return False
    
    def test_signup_duplicate_user(self):
        """Test signup with existing email"""
        try:
            signup_data = {
                "name": "Duplicate User",
                "email": "john@company.com",  # This should already exist
                "password": "testpass123",
                "role": "employee"
            }
            
            response = self.session.post(f"{BASE_URL}/auth/signup", json=signup_data)
            
            if response.status_code == 400:
                error_data = response.json()
                if 'error' in error_data and 'already exists' in error_data['error'].lower():
                    self.log_test("Signup Duplicate User", True, "Correctly rejected duplicate email", error_data)
                    return True
                else:
                    self.log_test("Signup Duplicate User", False, "Missing or incorrect error message", error_data)
                    return False
            else:
                self.log_test("Signup Duplicate User", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Signup Duplicate User", False, f"Request failed: {str(e)}")
            return False
    
    def test_attendance_join_chennai(self):
        """Test joining office attendance for Chennai"""
        if not self.sample_user_id:
            self.log_test("Attendance Join Chennai", False, "No sample user ID available")
            return False
            
        try:
            today = datetime.now().strftime('%Y-%m-%d')
            
            join_data = {
                "userId": self.sample_user_id,
                "date": today,
                "location": "Chennai",
                "type": "planned"
            }
            
            response = self.session.post(f"{BASE_URL}/attendance/join", json=join_data)
            
            if response.status_code == 200:
                attendance_data = response.json()
                if (attendance_data.get('location') == 'Chennai' and 
                    attendance_data.get('userId') == self.sample_user_id):
                    self.log_test("Attendance Join Chennai", True, "Successfully joined Chennai office", attendance_data)
                    return True
                else:
                    self.log_test("Attendance Join Chennai", False, "Invalid response data", attendance_data)
                    return False
            elif response.status_code == 400:
                # Might already exist, which is acceptable
                error_data = response.json()
                if 'already marked' in error_data.get('error', '').lower():
                    self.log_test("Attendance Join Chennai", True, "Correctly prevented duplicate attendance", error_data)
                    return True
                else:
                    self.log_test("Attendance Join Chennai", False, f"Unexpected error: {error_data}")
                    return False
            else:
                self.log_test("Attendance Join Chennai", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Attendance Join Chennai", False, f"Request failed: {str(e)}")
            return False
    
    def test_attendance_join_mumbai(self):
        """Test joining office attendance for Mumbai"""
        if not self.sample_user_id:
            self.log_test("Attendance Join Mumbai", False, "No sample user ID available")
            return False
            
        try:
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            join_data = {
                "userId": self.sample_user_id,
                "date": tomorrow,
                "location": "Mumbai",
                "type": "planned"
            }
            
            response = self.session.post(f"{BASE_URL}/attendance/join", json=join_data)
            
            if response.status_code == 200:
                attendance_data = response.json()
                if (attendance_data.get('location') == 'Mumbai' and 
                    attendance_data.get('userId') == self.sample_user_id):
                    self.log_test("Attendance Join Mumbai", True, "Successfully joined Mumbai office", attendance_data)
                    return True
                else:
                    self.log_test("Attendance Join Mumbai", False, "Invalid response data", attendance_data)
                    return False
            else:
                self.log_test("Attendance Join Mumbai", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Attendance Join Mumbai", False, f"Request failed: {str(e)}")
            return False
    
    def test_attendance_join_bangalore(self):
        """Test joining office attendance for Bangalore"""
        if not self.sample_user_id:
            self.log_test("Attendance Join Bangalore", False, "No sample user ID available")
            return False
            
        try:
            day_after_tomorrow = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
            
            join_data = {
                "userId": self.sample_user_id,
                "date": day_after_tomorrow,
                "location": "Bangalore",
                "type": "planned"
            }
            
            response = self.session.post(f"{BASE_URL}/attendance/join", json=join_data)
            
            if response.status_code == 200:
                attendance_data = response.json()
                if (attendance_data.get('location') == 'Bangalore' and 
                    attendance_data.get('userId') == self.sample_user_id):
                    self.log_test("Attendance Join Bangalore", True, "Successfully joined Bangalore office", attendance_data)
                    return True
                else:
                    self.log_test("Attendance Join Bangalore", False, "Invalid response data", attendance_data)
                    return False
            else:
                self.log_test("Attendance Join Bangalore", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Attendance Join Bangalore", False, f"Request failed: {str(e)}")
            return False
    
    def test_attendance_confirm(self):
        """Test confirming attendance status"""
        if not self.sample_attendance_id:
            self.log_test("Attendance Confirm", False, "No sample attendance ID available")
            return False
            
        try:
            confirm_data = {
                "attendanceId": self.sample_attendance_id,
                "status": "confirmed"
            }
            
            response = self.session.post(f"{BASE_URL}/attendance/confirm", json=confirm_data)
            
            if response.status_code == 200:
                result_data = response.json()
                if 'message' in result_data and 'updated' in result_data['message'].lower():
                    self.log_test("Attendance Confirm", True, "Successfully confirmed attendance", result_data)
                    return True
                else:
                    self.log_test("Attendance Confirm", False, "Invalid response message", result_data)
                    return False
            else:
                self.log_test("Attendance Confirm", False, f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Attendance Confirm", False, f"Request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 80)
        print("OFFICE ATTENDANCE SYSTEM - BACKEND API TESTING")
        print("=" * 80)
        print(f"Testing against: {BASE_URL}")
        print()
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_get_employees,
            self.test_get_attendance,
            self.test_login_valid_credentials,
            self.test_login_invalid_credentials,
            self.test_signup_new_user,
            self.test_signup_duplicate_user,
            self.test_attendance_join_chennai,
            self.test_attendance_join_mumbai,
            self.test_attendance_join_bangalore,
            self.test_attendance_confirm
        ]
        
        for test in tests:
            test()
            print()
        
        # Summary
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
            return True
        else:
            print(f"\n⚠️  {total - passed} tests failed. Check the details above.")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result['success']]
            if failed_tests:
                print("\nFailed Tests:")
                for test in failed_tests:
                    print(f"  - {test['test']}: {test['message']}")
            
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)