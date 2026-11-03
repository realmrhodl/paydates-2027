#!/bin/sh
# Rebuild assets/tailwind.css (Tailwind v3.4, node_modules in /workspace/tmp/tw-build)
cd /workspace/tmp/tw-build && npx tailwindcss -c tailwind.config.js -i input.css -o /workspace/paydates-v2-concept/assets/tailwind.css --minify
