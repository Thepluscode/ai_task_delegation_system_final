# Robot Service Troubleshooting Guide

This guide provides solutions for common issues when running the Robot Service.

## Quick Start with Fixes

Follow these steps to resolve initialization issues:

```bash
# 1. Clean up existing artifacts
cd AutomatedAIPlatform/services/robot-service
npm run clean  # Uses the newly added script

# 2. Reinstall dependencies
npm install --legacy-peer-deps

# 3. Test database connection (optional)
node test-db-connection.js

# 4. Try running with debug mode
npm run debug
```

## Available Scripts

New scripts have been added to help diagnose and fix issues:

- `npm run debug`: Runs the service with extra diagnostic logging
- `npm run start:simple`: Runs with a simplified module configuration
- `npm run clean`: Removes node_modules, dist, and package-lock.json

## Common Issues & Solutions

### 1. Module Resolution Problems

**Symptoms**: Cannot find module './app.module' or similar errors

**Solutions**:
- Ensure TypeScript is properly building the files: `npm run build`
- Try simplified bootstrap: `npm run start:simple`
- Check for circular dependencies between modules

### 2. Database Connection Issues

**Symptoms**: Silent failures when starting the service

**Solutions**:
- Run the database test script: `node test-db-connection.js`
- Verify database credentials in .env file
- Make sure PostgreSQL is running: `brew services list` (Mac) or `systemctl status postgresql` (Linux)

### 3. Dependency Issues

**Symptoms**: Package conflicts, version mismatches

**Solutions**:
- Clean reinstall with: `npm run clean && npm install --legacy-peer-deps`
- Update specific dependencies with compatibility issues:
  ```bash
  npm install pino-pretty@^9.0.0 --save-exact --legacy-peer-deps
  npm install nestjs-pino@^3.1.0 --save-exact --legacy-peer-deps
  ```

### 4. TypeScript Compilation Errors

**Symptoms**: TypeScript errors about types or interfaces

**Solutions**:
- Use `tsconfig-paths/register` to ensure proper module resolution
- Run with transpile-only to bypass type checking during development:
  ```bash
  npx ts-node -T src/main.ts
  ```

## Advanced Diagnosis

For more in-depth diagnosis:

1. **Check module initialization**:
   - `src/debug-bootstrap.ts` provides verbose logging
   - Each step of the bootstrap process is logged

2. **Test with minimal configuration**:
   - `src/simplified-app.module.ts` is a minimal module config
   - Run with: `npm run start:simple`

3. **Check for dependency conflicts**:
   - Run `npm ls nestjs-pino` and `npm ls @nestjs/microservices` to check versions
   - Resolve peer dependency conflicts if found

## Contact Support

If issues persist after trying these solutions, please:
1. Collect logs using the debug script
2. Note any specific error messages
3. Document environment details (Node.js version, OS, etc.)
4. Contact the development team with this information