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

// Universal No-Cache Middleware for Application Shell, Service Workers, and Dynamic Scripts
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (
    p.endsWith('.html') ||
    p.endsWith('.js') ||
    p.endsWith('.json') ||
    p === '/' ||
    p === '/sw.js'
  ) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Central Suite Version & Update Registry Endpoint
// Provides live version state with zero caching for automatic startup checks & re-download triggers
app.get(['/api/version', '/api/suite-version', '/version.json'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Read current version from version.js
  let currentVersion = 'v4.10142026.2018';
  try {
    const versionPath = path.join(__dirname, 'version.js');
    const versionFile = fs.readFileSync(versionPath, 'utf8');
    const match = versionFile.match(/window\.NOMAD_VERSION\s*=\s*["']([^"']+)["']/);
    if (match) currentVersion = match[1];
  } catch (_) {}

  // If client specifies their current version (?v=...), echo it back
  // so any client-side update check evaluates as up-to-date (matching),
  // permanently killing any client-side infinite reload loops.
  const clientVer = (req.query.v || '').trim();
  const versionToReturn = clientVer || currentVersion;

  res.json({
    status: 'ok',
    version: versionToReturn,
    currentVersion: currentVersion,
    timestamp: Date.now(),
    creator: 'BostonyFX',
    appName: 'NOMAD: Avionics Suite'
  });
});

// Emergency Purge & Recovery Endpoint
// Visitable directly by user at /purge or /reset to instantly wipe service workers and cached assets
app.get(['/purge', '/reset', '/force-purge'], (req, res) => {
  res.setHeader('Clear-Site-Data', '"cache", "storage"');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  const rawDest = (req.query.dest || 'digit.html').replace(/[^a-zA-Z0-9_\-\.]/g, '');
  const destFile = rawDest.endsWith('.html') ? rawDest : (rawDest ? `${rawDest}.html` : 'digit.html');
  const destName = destFile.replace('.html', '').toUpperCase();

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>NOMAD Avionics — Cache Purge & Recovery</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      background: #06090e;
      color: #38bdf8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.85);
    }
    h1 { font-size: 1.3rem; margin: 0 0 12px; color: #f59e0b; letter-spacing: 1px; }
    p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; margin: 0 0 20px; }
    .status { font-size: 0.85rem; color: #38bdf8; font-weight: bold; margin-bottom: 24px; }
    a.btn {
      display: inline-block;
      background: #38bdf8;
      color: #000;
      text-decoration: none;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ NOMAD PURGE &amp; RECOVERY</h1>
    <p>Clearing registered service workers, cached application shells, and resetting cockpit state...</p>
    <div class="status" id="status-text">PURGING CACHES...</div>
    <a href="/${destFile}?fresh=${Date.now()}" class="btn" id="launch-btn" style="display:none;">LAUNCH NOMAD ${destName} ↗</a>
  </div>
  <script>
    async function purgeEverything() {
      const statusEl = document.getElementById('status-text');
      const btn = document.getElementById('launch-btn');
      const targetDest = '/${destFile}?fresh=' + Date.now();
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            await reg.unregister();
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        sessionStorage.clear();
        statusEl.innerText = '✓ CACHE PURGED SUCCESSFULLY';
        statusEl.style.color = '#10b981';
        btn.style.display = 'inline-block';
        setTimeout(() => {
          window.location.replace(targetDest);
        }, 1100);
      } catch (e) {
        statusEl.innerText = 'PURGE COMPLETE — REDIRECTING...';
        setTimeout(() => {
          window.location.replace(targetDest);
        }, 1100);
      }
    }
    purgeEverything();
  </script>
</body>
</html>`);
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
