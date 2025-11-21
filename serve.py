#!/usr/bin/env python3
"""
Simple HTTP server for the Cuphead-inspired browser game.
Run this script to start a local web server.
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🎮 Cuphead-Inspired Boss Rush Game")
        print(f"=" * 50)
        print(f"Server running at http://localhost:{PORT}")
        print(f"Open your browser and navigate to the URL above")
        print(f"Press Ctrl+C to stop the server")
        print(f"=" * 50)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")

if __name__ == "__main__":
    main()
