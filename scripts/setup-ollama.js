#!/usr/bin/env node

/**
 * Setup script for Ollama local LLM
 * Downloads the llama3.1 model for offline use
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🦙 Setting up Ollama for MediBuddy...\n');

// Find Ollama installation on Windows
function findOllama() {
  const candidates = [
    'ollama', // Try PATH first
    'C:\\Program Files\\Ollama\\ollama.exe',
    'C:\\Program Files (x86)\\Ollama\\ollama.exe',
    path.join(os.homedir(), 'AppData\\Local\\Programs\\Ollama\\ollama.exe')
  ];

  for (const candidate of candidates) {
    try {
      const result = execSync(`"${candidate}" --version`, { encoding: 'utf-8', stdio: 'pipe' });
      console.log(`✅ Found Ollama: ${candidate}`);
      return candidate;
    } catch (e) {
      continue;
    }
  }

  return null;
}

try {
  // Check if ollama is installed
  console.log('Checking if Ollama is installed...');
  const ollamaPath = findOllama();
  
  if (!ollamaPath) {
    throw new Error('Ollama not found in PATH or common install locations');
  }

  // Check if model exists
  console.log('\nChecking if llama3.1 model exists...');
  try {
    const models = execSync(`"${ollamaPath}" list`, { encoding: 'utf-8' });
    if (models.includes('llama3.1')) {
      console.log('✅ Model llama3.1 is already installed\n');
      console.log('Ready to use! Run:\n');
      console.log('  Terminal 1: ollama serve');
      console.log('  Terminal 2: npm start\n');
      return;
    }
  } catch (e) {
    console.log('Model list unavailable, trying to pull model anyway...');
  }

  console.log('Downloading llama3.1 model...');
  console.log('(This may take a few minutes on first run)\n');
  
  execSync(`"${ollamaPath}" pull llama3.1`, { stdio: 'inherit' });
  
  console.log('\n✅ Setup complete!\n');
  console.log('You can now run:\n');
  console.log('  Terminal 1: ollama serve');
  console.log('  Terminal 2: npm start\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nTo fix:\n');
  console.error('1. Make sure Ollama is installed from: https://ollama.com/download');
  console.error('2. If installed, try running ollama from its installation folder');
  console.error('3. Or add Ollama to your PATH environment variable');
  process.exit(1);
}
