#!/usr/bin/env python3

"""
Simple HTTP server for Location Intelligence Data Viewer
Usage: python3 serve.py
"""

import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8888

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with CORS enabled"""

    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


def main():
    # Change to parent directory so resources/ is accessible
    parent_dir = Path(__file__).parent.parent
    import os
    os.chdir(parent_dir)

    print(f"Serving from: {parent_dir}")

    # Create server
    Handler = CORSHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("\n" + "="*60)
        print("🌍 Location Intelligence Data Viewer")
        print("="*60)
        print(f"\n✅ Server running at: http://localhost:{PORT}")
        print(f"📁 Serving from: {parent_dir}")
        print(f"\n🌐 Available viewers:")
        print(f"   - 3D Globe: http://localhost:{PORT}/globe.html")
        print(f"   - 2D Map:   http://localhost:{PORT}/index.html")
        print("\n💡 Opening 3D globe viewer...")
        print("\nPress Ctrl+C to stop\n")

        # Open browser to globe viewer
        webbrowser.open(f"http://localhost:{PORT}/globe.html")

        # Start serving
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped")


if __name__ == "__main__":
    main()
