#!/bin/bash

# 构建项目
echo "Building the project..."
cd frontend
npm run build

echo "Build completed!"
echo "Files are ready in frontend/dist directory"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to your GitHub repository settings"
echo "3. Navigate to Pages section"
echo "4. Select 'GitHub Actions' as the source"
echo "5. The site will be automatically deployed when you push to master branch"