#!/bin/bash

set -e  # Exit if any command fails

# STEP 1: Build static site
echo "▶ Building Nuxt 3 static site..."
npm run generate

# STEP 2: Add .nojekyll to prevent GitHub Pages from ignoring folders like _nuxt
touch .output/public/.nojekyll

# STEP 3: Go to the output folder
cd .output/public

# STEP 4: Deploy to gh-pages branch
echo "▶ Deploying to gh-pages..."
git init
git checkout -b gh-pages
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/mahdihoseinitabar/vocal-practice.git
git push -f origin gh-pages

# STEP 5: Done
echo "✅ Deployed successfully!"
echo "🌐 Visit: https://mahdihoseinitabar.github.io/vocal-practice/"
