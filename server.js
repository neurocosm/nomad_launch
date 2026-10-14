/**
 * ====================================================================
 * NOMAD HUD & Telemetry Navigation System
 * 
 * Proprietary & Created by BostonyFX
 * All rights reserved.
 * ====================================================================
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Central Suite Version & Update Registry Endpoint
// Provides live version state with zero caching for automatic startup checks & re-download triggers
app.get(['/api/version', '/api/suite-version'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const versionPath = path.join(__dirname, 'version.js');
    const versionFile = fs.readFileSync(versionPath, 'utf8');
    const match = versionFile.match(/window\.NOMAD_VERSION\s*=\s*["']([^"']+)["']/);
    const version = match ? match[1] : 'v4.10142026.0738';
    const stats = fs.statSync(versionPath);

    res.json({
      status: 'ok',
      version: version,
      timestamp: Date.now(),
      mtime: stats.mtimeMs,
      creator: 'BostonyFX',
      appName: 'NOMAD: Avionics Suite'
    });
  } catch (err) {
    res.json({
      status: 'ok',
      version: 'v4.10142026.0738',
      timestamp: Date.now(),
      creator: 'BostonyFX'
    });
  }
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'NOMAD: Hyperspace' });
});

// Atmospheric & Weather Telemetry Proxy Endpoint
// Proxies Open-Meteo requests to bypass client ad-blockers, tracking prevention, and iframe restrictions
app.get('/api/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 42.3765;
    const lon = parseFloat(req.query.lon) || -71.2356;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,uv_index,surface_pressure,pressure_msl&temperature_unit=fahrenheit&timezone=auto`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.warn('Server weather proxy warning:', err.message);
    res.status(502).json({ error: 'Failed to fetch atmospheric telemetry', message: err.message });
  }
});

// Reverse Geocoding Proxy Endpoint
// Proxies Nominatim & OpenStreetMap requests with valid server User-Agent, bypassing browser CORS & ad-blockers
app.get('/api/geocode', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    const targetZoom = req.query.zoom || 18;
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${targetZoom}&addressdetails=1&extratags=1&namedetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NomadAvionicsSuite/4.0 (contact: support@nomadsuite.app)' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    try {
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon);
      const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
      const pRes = await fetch(photonUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        return res.json(pData);
      }
    } catch (_) {}
    res.status(502).json({ error: 'Failed to reverse geocode', message: err.message });
  }
});

// Dynamic Project Backup Endpoint: Generates and serves a clean .ZIP archive of the entire project
app.get(['/api/download-zip', '/download-zip', '/download'], (req, res) => {
  try {
    const zipPythonCmd = `
import os, zipfile
exclude_dirs = {'.git', 'node_modules', '.cache', '.npm', '.aistudio', '__pycache__'}
exclude_files = {'nomad_suite.zip', 'nomad-roadtrip.zip'}
with zipfile.ZipFile('nomad_suite.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        for file in files:
            if file in exclude_files or file.startswith('.'):
                continue
            path = os.path.join(root, file)
            arcname = os.path.relpath(path, '.')
            zipf.write(path, arcname)
`;
    execSync(`python3 -c "${zipPythonCmd.replace(/"/g, '\\"')}"`, { cwd: __dirname });
    const zipPath = path.join(__dirname, 'nomad_suite.zip');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="nomad_suite.zip"');
    res.download(zipPath, 'nomad_suite.zip');
  } catch (err) {
    console.error('Failed to create zip:', err);
    res.status(500).send('Error creating zip archive');
  }
});

// Canonical redirect for legacy nomad_digit path
app.get(['/nomad_digit', '/nomad_digit.html'], (req, res) => {
  res.redirect(301, '/digit.html');
});

// Dedicated routes for Launch Control -> redirect to index.html
app.get(['/launch', '/launch.html', '/launcher', '/nomad_launch'], (req, res) => {
  res.redirect(301, '/index.html');
});

// Serve static assets with html extension support
app.use(express.static(__dirname, {
  extensions: ['html']
}));

// Root fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback for HTML navigation requests
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
    return;
  }
  res.status(404).send('Not found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NOMAD: Hyperspace server running on http://0.0.0.0:${PORT}`);
});
