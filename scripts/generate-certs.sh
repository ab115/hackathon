#!/bin/bash
# ============================================================
# Generate Self-Signed SSL Certificates for Development
# ============================================================
# Usage: ./scripts/generate-certs.sh

set -e

CERT_DIR="./certs"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

# Create certs directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Check if certificates already exist
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
    echo "✅ Certificates already exist in $CERT_DIR"
    exit 0
fi

echo "🔐 Generating self-signed SSL certificates..."

# Generate private key and certificate valid for 365 days
openssl req -x509 -newkey rsa:4096 -keyout "$KEY_FILE" -out "$CERT_FILE" -days 365 -nodes \
    -subj "/C=IN/ST=India/L=India/O=HackFusion/CN=localhost"

# Set proper permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo "✅ Certificates generated successfully!"
echo "📍 Certificate: $CERT_FILE"
echo "📍 Key: $KEY_FILE"
echo ""
echo "ℹ️  These are self-signed certificates for development only."
echo "⚠️  For production, use proper certificates from a certificate authority."
