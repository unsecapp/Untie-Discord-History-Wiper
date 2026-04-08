#!/usr/bin/env python3
"""
Untie Setup Script
Installs dependencies and starts both backend and frontend servers
"""

import os
import sys
import subprocess
import time
import platform
from pathlib import Path

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.END}\n")

def print_step(text):
    print(f"{Colors.BOLD}{Colors.BLUE}▶ {text}{Colors.END}")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def run_command(cmd, cwd=None, shell=False):
    """Run a command and return success status"""
    try:
        if shell:
            subprocess.run(cmd, cwd=cwd, shell=True, check=True)
        else:
            subprocess.run(cmd, cwd=cwd, check=True)
        return True
    except subprocess.CalledProcessError:
        return False

def check_python():
    """Check if Python version is adequate"""
    print_step("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 7:
        print_success(f"Python {version.major}.{version.minor}.{version.micro} detected")
        return True
    else:
        print_error(f"Python 3.7+ required, found {version.major}.{version.minor}.{version.micro}")
        return False

def check_node():
    """Check if Node.js is installed"""
    print_step("Checking Node.js installation...")
    try:
        # Try with shell=True for Windows compatibility
        result = subprocess.run(['node', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print_success(f"Node.js {result.stdout.strip()} detected")
            return True
    except Exception:
        pass
    print_error("Node.js not found. Please install Node.js from https://nodejs.org/")
    return False

def check_npm():
    """Check if npm is installed"""
    print_step("Checking npm installation...")
    try:
        # Try with shell=True for Windows compatibility
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print_success(f"npm {result.stdout.strip()} detected")
            return True
    except Exception:
        pass
    
    # Try alternative npm command for Windows
    try:
        result = subprocess.run(['npm.cmd', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print_success(f"npm {result.stdout.strip()} detected")
            return True
    except Exception:
        pass
    
    print_error("npm not found. Please install Node.js (includes npm) from https://nodejs.org/")
    print_warning("After installing Node.js, restart your terminal/command prompt and run this script again")
    return False

def install_backend_deps():
    """Install Python backend dependencies"""
    print_step("Installing backend dependencies...")
    backend_dir = Path(__file__).parent / 'backend'
    requirements_file = backend_dir / 'requirements.txt'
    
    if not requirements_file.exists():
        print_error("requirements.txt not found in backend directory")
        return False
    
    if run_command([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], cwd=backend_dir):
        print_success("Backend dependencies installed")
        return True
    else:
        print_error("Failed to install backend dependencies")
        return False

def install_frontend_deps():
    """Install Node.js frontend dependencies"""
    print_step("Installing frontend dependencies...")
    frontend_dir = Path(__file__).parent / 'frontend'
    
    if not (frontend_dir / 'package.json').exists():
        print_error("package.json not found in frontend directory")
        return False
    
    print("This may take a few minutes...")
    
    # Try npm command with shell=True for Windows
    is_windows = platform.system() == 'Windows'
    npm_cmd = 'npm.cmd' if is_windows else 'npm'
    
    if run_command([npm_cmd, 'install'], cwd=frontend_dir, shell=is_windows):
        print_success("Frontend dependencies installed")
        return True
    else:
        print_error("Failed to install frontend dependencies")
        return False

def check_env_file():
    """Check if .env file exists in backend"""
    print_step("Checking backend configuration...")
    backend_dir = Path(__file__).parent / 'backend'
    env_file = backend_dir / '.env'
    
    if env_file.exists():
        print_success(".env file found")
        return True
    else:
        print_warning(".env file not found")
        print(f"{Colors.YELLOW}Creating .env file...{Colors.END}")
        try:
            with open(env_file, 'w') as f:
                f.write("# Discord User Token (optional - can also enter via web UI)\n")
                f.write("# DISCORD_TOKEN=your_token_here\n")
            print_success(".env file created (you can add your token later)")
            return True
        except Exception as e:
            print_error(f"Failed to create .env file: {e}")
            return False

def start_servers():
    """Start both backend and frontend servers"""
    print_header("Starting Servers")
    
    backend_dir = Path(__file__).parent / 'backend'
    frontend_dir = Path(__file__).parent / 'frontend'
    
    is_windows = platform.system() == 'Windows'
    
    print_step("Starting backend server...")
    print(f"{Colors.CYAN}Backend will run on http://localhost:5000{Colors.END}")
    
    if is_windows:
        # Windows: use 'start' command to open new terminal windows
        backend_cmd = f'start "Untie Backend" cmd /k "cd /d {backend_dir} && python server.py"'
        frontend_cmd = f'start "Untie Frontend" cmd /k "cd /d {frontend_dir} && npm run dev"'
        
        subprocess.Popen(backend_cmd, shell=True)
        time.sleep(2)
        
        print_step("Starting frontend server...")
        print(f"{Colors.CYAN}Frontend will run on http://localhost:5173{Colors.END}")
        subprocess.Popen(frontend_cmd, shell=True)
    else:
        # Unix-like systems: use nohup or screen
        try:
            # Try to use gnome-terminal, xterm, or other terminal emulators
            backend_cmd = ['gnome-terminal', '--', 'bash', '-c', f'cd {backend_dir} && python3 server.py; exec bash']
            frontend_cmd = ['gnome-terminal', '--', 'bash', '-c', f'cd {frontend_dir} && npm run dev; exec bash']
            
            subprocess.Popen(backend_cmd)
            time.sleep(2)
            
            print_step("Starting frontend server...")
            print(f"{Colors.CYAN}Frontend will run on http://localhost:5173{Colors.END}")
            subprocess.Popen(frontend_cmd)
        except FileNotFoundError:
            # Fallback: run in background
            print_warning("Terminal emulator not found, running in background...")
            backend_process = subprocess.Popen(
                [sys.executable, 'server.py'],
                cwd=backend_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            time.sleep(2)
            
            print_step("Starting frontend server...")
            frontend_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=frontend_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            print_warning("Servers running in background")
            print(f"{Colors.YELLOW}To stop servers, use: kill {backend_process.pid} {frontend_process.pid}{Colors.END}")
    
    time.sleep(3)
    print_success("Servers started!")
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.GREEN}Untie is ready!{Colors.END}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'='*60}{Colors.END}")
    print(f"\n{Colors.CYAN}Open your browser and navigate to:{Colors.END}")
    print(f"{Colors.BOLD}{Colors.YELLOW}http://localhost:5173{Colors.END}\n")
    
    if is_windows:
        print(f"{Colors.YELLOW}Note: Two command prompt windows will open for backend and frontend servers.{Colors.END}")
        print(f"{Colors.YELLOW}Close those windows to stop the servers.{Colors.END}\n")

def main():
    """Main setup function"""
    print_header("Untie Setup")
    print(f"{Colors.CYAN}Discord Activity Eraser{Colors.END}\n")
    
    # Check prerequisites
    if not check_python():
        sys.exit(1)
    
    if not check_node():
        sys.exit(1)
    
    if not check_npm():
        sys.exit(1)
    
    # Install dependencies
    print_header("Installing Dependencies")
    
    if not install_backend_deps():
        print_error("Backend setup failed")
        sys.exit(1)
    
    if not install_frontend_deps():
        print_error("Frontend setup failed")
        sys.exit(1)
    
    # Check configuration
    check_env_file()
    
    # Ask user if they want to start servers
    print(f"\n{Colors.BOLD}Setup complete!{Colors.END}")
    response = input(f"\n{Colors.CYAN}Start servers now? (Y/n): {Colors.END}").strip().lower()
    
    if response in ['', 'y', 'yes']:
        start_servers()
    else:
        print(f"\n{Colors.YELLOW}To start servers manually:{Colors.END}")
        print(f"  Backend:  cd backend && python server.py")
        print(f"  Frontend: cd frontend && npm run dev")
        print(f"\n{Colors.CYAN}Then open http://localhost:5173 in your browser{Colors.END}\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Setup interrupted by user{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
