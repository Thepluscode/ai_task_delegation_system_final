#!/usr/bin/env python3
"""
Enhanced Automation Platform Test Runner
Comprehensive test execution with reporting and analysis
"""

import os
import sys
import subprocess
import argparse
import time
import json
from datetime import datetime
from pathlib import Path

class TestRunner:
    """Enhanced test runner for the automation platform"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.tests_dir = self.project_root / "tests"
        self.results_dir = self.project_root / "test_results"
        self.results_dir.mkdir(exist_ok=True)
        
    def run_unit_tests(self, verbose=True):
        """Run unit tests"""
        print("🧪 Running Unit Tests...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir / "test_edge_ai_engine.py"),
            str(self.tests_dir / "test_agent_coordination.py"),
            str(self.tests_dir / "test_safety_monitoring.py"),
            str(self.tests_dir / "test_device_abstraction.py"),
            "-m", "unit",
            "--tb=short"
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "unit_tests")
    
    def run_performance_tests(self, verbose=True):
        """Run performance benchmarks"""
        print("⚡ Running Performance Benchmarks...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir / "test_performance_benchmarks.py"),
            "-m", "performance",
            "--tb=short",
            "-s"  # Don't capture output for performance metrics
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "performance_tests")
    
    def run_integration_tests(self, verbose=True):
        """Run integration tests"""
        print("🔄 Running Integration Tests...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir / "test_end_to_end_integration.py"),
            "-m", "integration",
            "--tb=short",
            "-s"
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "integration_tests")
    
    def run_safety_tests(self, verbose=True):
        """Run safety-specific tests"""
        print("🛡️ Running Safety Tests...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir / "test_safety_monitoring.py"),
            "-m", "safety",
            "--tb=short"
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "safety_tests")
    
    def run_edge_tests(self, verbose=True):
        """Run edge computing tests"""
        print("🔧 Running Edge Computing Tests...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir / "test_edge_ai_engine.py"),
            "-m", "edge",
            "--tb=short"
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "edge_tests")
    
    def run_all_tests(self, verbose=True, parallel=False):
        """Run all tests"""
        print("🚀 Running Complete Test Suite...")
        
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir),
            "--tb=short"
        ]
        
        if verbose:
            cmd.append("-v")
            
        if parallel:
            cmd.extend(["-n", "auto"])  # Requires pytest-xdist
            
        return self._run_command(cmd, "all_tests")
    
    def run_quick_tests(self, verbose=True):
        """Run quick tests (excluding slow performance tests)"""
        print("⚡ Running Quick Test Suite...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir),
            "-m", "not slow",
            "--tb=short"
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "quick_tests")
    
    def run_critical_tests(self, verbose=True):
        """Run critical functionality tests"""
        print("🎯 Running Critical Tests...")
        cmd = [
            "python", "-m", "pytest",
            str(self.tests_dir),
            "-m", "critical",
            "--tb=short"
        ]
        
        if verbose:
            cmd.append("-v")
            
        return self._run_command(cmd, "critical_tests")
    
    def _run_command(self, cmd, test_type):
        """Run command and capture results"""
        start_time = time.time()
        
        try:
            # Add JSON report generation
            json_report = self.results_dir / f"{test_type}_report.json"
            cmd.extend(["--json-report", f"--json-report-file={json_report}"])
            
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )
            
            execution_time = time.time() - start_time
            
            # Save detailed results
            self._save_test_results(test_type, result, execution_time)
            
            return result.returncode == 0
            
        except subprocess.TimeoutExpired:
            print(f"❌ {test_type} timed out after 10 minutes")
            return False
        except Exception as e:
            print(f"❌ Error running {test_type}: {str(e)}")
            return False
    
    def _save_test_results(self, test_type, result, execution_time):
        """Save test results to file"""
        results = {
            "test_type": test_type,
            "timestamp": datetime.now().isoformat(),
            "execution_time": execution_time,
            "return_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "success": result.returncode == 0
        }
        
        results_file = self.results_dir / f"{test_type}_results.json"
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        # Print summary
        status = "✅ PASSED" if result.returncode == 0 else "❌ FAILED"
        print(f"{status} - {test_type} completed in {execution_time:.2f}s")
        
        if result.returncode != 0:
            print(f"Error output: {result.stderr}")
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        print("\n📊 Generating Test Report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "platform": "Enhanced Automation Platform",
            "test_results": {},
            "summary": {
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "total_execution_time": 0
            }
        }
        
        # Collect results from all test runs
        for results_file in self.results_dir.glob("*_results.json"):
            try:
                with open(results_file, 'r') as f:
                    test_result = json.load(f)
                    
                test_type = test_result["test_type"]
                report["test_results"][test_type] = test_result
                
                if test_result["success"]:
                    report["summary"]["passed_tests"] += 1
                else:
                    report["summary"]["failed_tests"] += 1
                    
                report["summary"]["total_execution_time"] += test_result["execution_time"]
                
            except Exception as e:
                print(f"Warning: Could not read {results_file}: {str(e)}")
        
        report["summary"]["total_tests"] = (
            report["summary"]["passed_tests"] + 
            report["summary"]["failed_tests"]
        )
        
        # Save comprehensive report
        report_file = self.results_dir / "comprehensive_test_report.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Print summary
        self._print_test_summary(report)
        
        return report
    
    def _print_test_summary(self, report):
        """Print test summary to console"""
        summary = report["summary"]
        
        print(f"\n{'='*70}")
        print("ENHANCED AUTOMATION PLATFORM - TEST SUMMARY")
        print(f"{'='*70}")
        print(f"📊 Total Tests: {summary['total_tests']}")
        print(f"✅ Passed: {summary['passed_tests']}")
        print(f"❌ Failed: {summary['failed_tests']}")
        print(f"⏱️  Total Time: {summary['total_execution_time']:.2f}s")
        
        if summary['total_tests'] > 0:
            success_rate = (summary['passed_tests'] / summary['total_tests']) * 100
            print(f"📈 Success Rate: {success_rate:.1f}%")
        
        print(f"\n🔍 Detailed Results:")
        for test_type, result in report["test_results"].items():
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {test_type}: {result['execution_time']:.2f}s")
        
        print(f"\n📁 Results saved to: {self.results_dir}")
        print(f"{'='*70}")
        
        # Overall status
        if summary['failed_tests'] == 0:
            print("🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION!")
        else:
            print("⚠️  SOME TESTS FAILED - REVIEW REQUIRED")
        
        print(f"{'='*70}")

def main():
    """Main test runner function"""
    parser = argparse.ArgumentParser(description="Enhanced Automation Platform Test Runner")
    parser.add_argument("--type", choices=[
        "unit", "performance", "integration", "safety", "edge", 
        "all", "quick", "critical"
    ], default="quick", help="Type of tests to run")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--parallel", "-p", action="store_true", help="Run tests in parallel")
    parser.add_argument("--report", "-r", action="store_true", help="Generate test report only")
    
    args = parser.parse_args()
    
    runner = TestRunner()
    
    if args.report:
        runner.generate_test_report()
        return
    
    print(f"\n🚀 Enhanced Automation Platform Test Runner")
    print(f"Test Type: {args.type}")
    print(f"Verbose: {args.verbose}")
    print(f"Parallel: {args.parallel}")
    print(f"{'='*50}")
    
    # Install test dependencies
    print("📦 Installing test dependencies...")
    subprocess.run([
        sys.executable, "-m", "pip", "install", "-r", 
        str(runner.tests_dir / "requirements.txt")
    ], check=False)
    
    # Run selected tests
    success = True
    
    if args.type == "unit":
        success = runner.run_unit_tests(args.verbose)
    elif args.type == "performance":
        success = runner.run_performance_tests(args.verbose)
    elif args.type == "integration":
        success = runner.run_integration_tests(args.verbose)
    elif args.type == "safety":
        success = runner.run_safety_tests(args.verbose)
    elif args.type == "edge":
        success = runner.run_edge_tests(args.verbose)
    elif args.type == "all":
        success = runner.run_all_tests(args.verbose, args.parallel)
    elif args.type == "quick":
        success = runner.run_quick_tests(args.verbose)
    elif args.type == "critical":
        success = runner.run_critical_tests(args.verbose)
    
    # Generate report
    runner.generate_test_report()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
