#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting build process...\n')

// Check Node.js version
const nodeVersion = process.version
const requiredVersion = '18.0.0'

console.log(`📋 Node.js version: ${nodeVersion}`)

if (nodeVersion < `v${requiredVersion}`) {
  console.error(`❌ Node.js ${requiredVersion} or higher is required`)
  process.exit(1)
}

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found')
  process.exit(1)
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
console.log(`📦 Building ${packageJson.name} v${packageJson.version}\n`)

// Build steps
const steps = [
  {
    name: 'Installing dependencies',
    command: 'npm ci',
    icon: '📥'
  },
  {
    name: 'Type checking',
    command: 'npm run type-check',
    icon: '🔍'
  },
  {
    name: 'Linting',
    command: 'npm run lint',
    icon: '🧹'
  },
  {
    name: 'Running tests',
    command: 'npm test -- --passWithNoTests',
    icon: '🧪'
  },
  {
    name: 'Building application',
    command: 'npm run build',
    icon: '🔨'
  }
]

// Execute build steps
for (const step of steps) {
  console.log(`${step.icon} ${step.name}...`)
  
  try {
    const startTime = Date.now()
    execSync(step.command, { stdio: 'inherit' })
    const duration = Date.now() - startTime
    console.log(`✅ ${step.name} completed in ${duration}ms\n`)
  } catch (error) {
    console.error(`❌ ${step.name} failed`)
    console.error(error.message)
    process.exit(1)
  }
}

// Check build output
const buildDir = '.next'
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found')
  process.exit(1)
}

// Get build size
const getBuildSize = (dir) => {
  let size = 0
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)
    
    if (stats.isDirectory()) {
      size += getBuildSize(filePath)
    } else {
      size += stats.size
    }
  }
  
  return size
}

const buildSize = getBuildSize(buildDir)
const buildSizeMB = (buildSize / 1024 / 1024).toFixed(2)

console.log(`📊 Build size: ${buildSizeMB} MB`)

// Generate build report
const buildReport = {
  timestamp: new Date().toISOString(),
  version: packageJson.version,
  nodeVersion,
  buildSize: buildSizeMB,
  success: true
}

fs.writeFileSync('build-report.json', JSON.stringify(buildReport, null, 2))

console.log('\n🎉 Build completed successfully!')
console.log(`📄 Build report saved to build-report.json`)

// Optional: Run bundle analyzer if ANALYZE=true
if (process.env.ANALYZE === 'true') {
  console.log('\n📈 Running bundle analyzer...')
  try {
    execSync('npm run analyze', { stdio: 'inherit' })
  } catch (error) {
    console.warn('⚠️ Bundle analyzer failed:', error.message)
  }
}
