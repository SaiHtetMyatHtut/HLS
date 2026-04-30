/**
 * Generates an analytics dashboard HTML file from Supabase leaderboard data.
 * Run with:  npm run dashboard
 * Opens dashboard.html in your default browser automatically.
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const supabase = createClient(
	process.env.PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
	{ auth: { autoRefreshToken: false, persistSession: false } }
);

interface Entry {
	name: string;
	score: number;
	played_at: string;
}

async function fetchData(): Promise<Entry[]> {
	const { data, error } = await supabase
		.from('leaderboard')
		.select('name, score, played_at')
		.order('played_at', { ascending: true });

	if (error) {
		console.error('Failed to fetch data:', error.message);
		process.exit(1);
	}
	return (data ?? []) as Entry[];
}

function buildHTML(entries: Entry[]): string {
	// ── computed stats ──────────────────────────────────────────────────────
	const totalGames = entries.length;
	const uniquePlayers = new Set(entries.map((e) => e.name)).size;
	const avgScore = totalGames ? Math.round(entries.reduce((s, e) => s + e.score, 0) / totalGames) : 0;
	const maxScore = totalGames ? Math.max(...entries.map((e) => e.score)) : 0;
	const minScore = totalGames ? Math.min(...entries.map((e) => e.score)) : 0;

	// top 10 by best score
	const bestByPlayer = new Map<string, number>();
	for (const e of entries) {
		bestByPlayer.set(e.name, Math.max(bestByPlayer.get(e.name) ?? 0, e.score));
	}
	const top10 = [...bestByPlayer.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	// games per day
	const perDay = new Map<string, number>();
	for (const e of entries) {
		perDay.set(e.played_at, (perDay.get(e.played_at) ?? 0) + 1);
	}
	const sortedDays = [...perDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));

	// score distribution buckets: 0-99, 100-199, ... 400-500
	const buckets = ['0–99', '100–199', '200–299', '300–399', '400–500'];
	const bucketCounts = [0, 0, 0, 0, 0];
	for (const e of entries) {
		const idx = Math.min(Math.floor(e.score / 100), 4);
		bucketCounts[idx]++;
	}

	// players with multiple entries
	const gameCountByPlayer = new Map<string, number>();
	for (const e of entries) {
		gameCountByPlayer.set(e.name, (gameCountByPlayer.get(e.name) ?? 0) + 1);
	}
	const multiPlayers = [...gameCountByPlayer.entries()].filter(([, c]) => c > 1).length;
	const singlePlayers = uniquePlayers - multiPlayers;

	// recent 10 entries
	const recent = [...entries].reverse().slice(0, 10);

	// avg score per day
	const sumByDay = new Map<string, { sum: number; count: number }>();
	for (const e of entries) {
		const cur = sumByDay.get(e.played_at) ?? { sum: 0, count: 0 };
		sumByDay.set(e.played_at, { sum: cur.sum + e.score, count: cur.count + 1 });
	}
	const avgByDay = sortedDays.map(([day]) => {
		const d = sumByDay.get(day)!;
		return Math.round(d.sum / d.count);
	});

	const generatedAt = new Date().toLocaleString();

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>HealthyPick — Analytics Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --teal: #46c4b8;
    --purple: #8b5cf6;
    --yellow: #fbbf24;
    --red: #f87171;
    --bg: #f9faf5;
    --card: #ffffff;
    --border: #000000;
    --text: #111827;
    --muted: #6b7280;
  }
  body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 24px; }
  h1 { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 4px; }
  .subtitle { color: var(--muted); font-size: 0.875rem; margin-bottom: 32px; }
  .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px; margin-bottom: 28px; }
  .card {
    background: var(--card);
    border: 3px solid var(--border);
    border-radius: 16px;
    padding: 20px 24px;
    box-shadow: 4px 4px 0 #000;
  }
  .stat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 6px; }
  .stat-value { font-size: 2.4rem; font-weight: 900; line-height: 1; }
  .stat-sub { font-size: 0.78rem; color: var(--muted); margin-top: 4px; }
  .teal { color: var(--teal); }
  .purple { color: var(--purple); }
  .yellow { color: var(--yellow); }
  .red { color: var(--red); }
  .card h2 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 16px; }
  .chart-wrap { position: relative; height: 240px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding: 0 0 10px; border-bottom: 2px solid #e5e7eb; }
  td { padding: 9px 0; border-bottom: 1px solid #f3f4f6; }
  tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; border: 2px solid currentColor; }
  .score-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .score-bar { height: 8px; border-radius: 99px; background: var(--teal); }
  .medal { font-size: 1.1rem; }
  footer { text-align: center; color: var(--muted); font-size: 0.78rem; margin-top: 32px; }
</style>
</head>
<body>

<h1>📊 HealthyPick Analytics</h1>
<p class="subtitle">Generated ${generatedAt} &nbsp;·&nbsp; Supabase leaderboard data</p>

<!-- ── KPI cards ── -->
<div class="grid-4">
  <div class="card">
    <div class="stat-label">Total Games Played</div>
    <div class="stat-value teal">${totalGames.toLocaleString()}</div>
    <div class="stat-sub">all recorded sessions</div>
  </div>
  <div class="card">
    <div class="stat-label">Unique Players</div>
    <div class="stat-value purple">${uniquePlayers.toLocaleString()}</div>
    <div class="stat-sub">${multiPlayers} with multiple games</div>
  </div>
  <div class="card">
    <div class="stat-label">Average Score</div>
    <div class="stat-value yellow">${avgScore}</div>
    <div class="stat-sub">out of 500 pts</div>
  </div>
  <div class="card">
    <div class="stat-label">Top Score</div>
    <div class="stat-value red">${maxScore}</div>
    <div class="stat-sub">lowest: ${minScore} pts</div>
  </div>
</div>

<!-- ── charts row ── -->
<div class="grid-2">

  <div class="card">
    <h2>Games Per Day</h2>
    <div class="chart-wrap">
      <canvas id="dailyChart"></canvas>
    </div>
  </div>

  <div class="card">
    <h2>Score Distribution</h2>
    <div class="chart-wrap">
      <canvas id="distChart"></canvas>
    </div>
  </div>

  <div class="card">
    <h2>Average Score Per Day</h2>
    <div class="chart-wrap">
      <canvas id="avgChart"></canvas>
    </div>
  </div>

  <div class="card">
    <h2>Single vs Returning Players</h2>
    <div class="chart-wrap">
      <canvas id="retentionChart"></canvas>
    </div>
  </div>

</div>

<!-- ── tables row ── -->
<div class="grid-2">

  <div class="card">
    <h2>🏆 Top 10 Players (Best Score)</h2>
    <table>
      <thead><tr><th>#</th><th>Player</th><th>Best Score</th><th></th></tr></thead>
      <tbody>
        ${top10.map(([name, score], i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
          const pct = Math.round((score / 500) * 100);
          return `<tr>
            <td><span class="medal">${medal}</span></td>
            <td><strong>${name}</strong></td>
            <td><strong>${score}</strong> pts</td>
            <td style="width:120px">
              <div class="score-bar-wrap">
                <div class="score-bar" style="width:${pct}%;max-width:100px"></div>
                <span style="font-size:0.72rem;color:#6b7280">${pct}%</span>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="card">
    <h2>🕐 10 Most Recent Entries</h2>
    <table>
      <thead><tr><th>Player</th><th>Score</th><th>Date</th></tr></thead>
      <tbody>
        ${recent.map((e) => {
          const color = e.score >= 400 ? 'var(--teal)' : e.score >= 250 ? 'var(--yellow)' : 'var(--red)';
          return `<tr>
            <td>${e.name}</td>
            <td><span class="badge" style="color:${color};border-color:${color}">${e.score} pts</span></td>
            <td style="color:#6b7280">${e.played_at}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

</div>

<footer>HealthyPick Analytics &nbsp;·&nbsp; Data from Supabase &nbsp;·&nbsp; ${totalGames} records across ${uniquePlayers} players</footer>

<script>
const TEAL   = '#46c4b8';
const PURPLE = '#8b5cf6';
const YELLOW = '#fbbf24';
const RED    = '#f87171';

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

// Games per day — bar
new Chart(document.getElementById('dailyChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(sortedDays.map(([d]) => d))},
    datasets: [{
      data: ${JSON.stringify(sortedDays.map(([, c]) => c))},
      backgroundColor: TEAL,
      borderRadius: 6,
    }]
  },
  options: {
    ...defaultOptions,
    scales: {
      x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  }
});

// Score distribution — bar
new Chart(document.getElementById('distChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(buckets)},
    datasets: [{
      data: ${JSON.stringify(bucketCounts)},
      backgroundColor: [RED, YELLOW, YELLOW, TEAL, PURPLE],
      borderRadius: 6,
    }]
  },
  options: {
    ...defaultOptions,
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { stepSize: 5 } }
    }
  }
});

// Avg score per day — line
new Chart(document.getElementById('avgChart'), {
  type: 'line',
  data: {
    labels: ${JSON.stringify(sortedDays.map(([d]) => d))},
    datasets: [{
      data: ${JSON.stringify(avgByDay)},
      borderColor: PURPLE,
      backgroundColor: PURPLE + '22',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: PURPLE,
    }]
  },
  options: {
    ...defaultOptions,
    scales: {
      x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
      y: { beginAtZero: false }
    }
  }
});

// Retention — doughnut
new Chart(document.getElementById('retentionChart'), {
  type: 'doughnut',
  data: {
    labels: ['Returning (2+ games)', 'One-time players'],
    datasets: [{
      data: [${multiPlayers}, ${singlePlayers}],
      backgroundColor: [TEAL, '#e5e7eb'],
      borderWidth: 3,
      borderColor: '#fff',
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { font: { size: 12 }, padding: 16 }
      }
    },
    cutout: '65%',
  }
});
</script>
</body>
</html>`;
}

async function main() {
	console.log('📊  Fetching leaderboard data…');
	const entries = await fetchData();
	console.log(`   ${entries.length} entries found.`);

	const html = buildHTML(entries);
	const outPath = resolve(process.cwd(), 'dashboard.html');
	writeFileSync(outPath, html, 'utf-8');
	console.log(`✅  Dashboard written to ${outPath}`);

	// Open in default browser
	try {
		const cmd = process.platform === 'win32' ? `start "" "${outPath}"` :
		            process.platform === 'darwin' ? `open "${outPath}"` : `xdg-open "${outPath}"`;
		execSync(cmd, { shell: 'cmd.exe' });
		console.log('🌐  Opened in browser.');
	} catch {
		console.log('   (Could not auto-open — open dashboard.html manually.)');
	}
}

main();
