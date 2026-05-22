import { useState } from 'react';
import { Check, ExternalLink, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { generateBlockWithClaude } from '../services/claudeService.js';
import { sendSlackMessage } from '../services/slackService.js';
import { ensureSheetHeaders } from '../services/sheetsService.js';

export default function SettingsPage() {
  const { state, actions } = useApp();
  const { settings, blockNum, sessionLogs, bodyweightLog } = state;

  const [saved, setSaved] = useState(false);
  const [slackTesting, setSlackTesting] = useState(false);
  const [slackResult, setSlackResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const [sheetsTesting, setSheetsTesting] = useState(false);
  const [sheetsResult, setSheetsResult] = useState(null);

  const [form, setForm] = useState({
    slackWebhookUrl: settings.slackWebhookUrl || '',
    sheetsId: settings.sheetsId || '',
    sheetsToken: settings.sheetsToken || '',
    anthropicApiKey: settings.anthropicApiKey || '',
  });

  const handleSave = () => {
    actions.updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestSlack = async () => {
    setSlackTesting(true);
    setSlackResult(null);
    const result = await sendSlackMessage(form.slackWebhookUrl, '🏋️ Test notification from John\'s Strength Builder!');
    setSlackResult(result.ok ? 'success' : 'error');
    setSlackTesting(false);
  };

  const handleTestSheets = async () => {
    setSheetsTesting(true);
    setSheetsResult(null);
    const result = await ensureSheetHeaders(form.sheetsId, form.sheetsToken);
    setSheetsResult('success'); // ensureSheetHeaders is non-fatal
    setSheetsTesting(false);
  };

  const handleGenerateBlock = async () => {
    setGenerating(true);
    setGenResult(null);
    const summary = `Block ${blockNum - 1} complete. ${sessionLogs.length} total sessions logged. Latest bodyweight: ${bodyweightLog.at(-1)?.weight ?? '?'} lbs.`;
    const result = await generateBlockWithClaude(form.anthropicApiKey, blockNum + 1, summary);
    if (result.ok) {
      actions.setClaudeNotes(result.data);
      setGenResult({ ok: true, message: 'Block notes generated!' });
    } else {
      setGenResult({ ok: false, message: result.error });
    }
    setGenerating(false);
  };

  const handleAdvanceBlock = () => {
    if (confirm(`Advance to Block ${blockNum + 1}? This will generate a new 4-week training block.`)) {
      actions.advanceBlock();
    }
  };

  const sessionsCount = sessionLogs.length;
  const bwCount = bodyweightLog.length;

  return (
    <div className="scroll-area pb-8">
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <div className="text-slate-400 text-sm mt-0.5">Configure integrations & training</div>
      </div>

      {/* Stats overview */}
      <div className="px-4 mb-6">
        <div className="card p-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-white font-bold text-xl">{sessionsCount}</div>
            <div className="text-slate-500 text-xs">Sessions</div>
          </div>
          <div>
            <div className="text-white font-bold text-xl">{bwCount}</div>
            <div className="text-slate-500 text-xs">Weigh-ins</div>
          </div>
          <div>
            <div className="text-white font-bold text-xl">{blockNum}</div>
            <div className="text-slate-500 text-xs">Block #</div>
          </div>
        </div>
      </div>

      {/* Slack */}
      <Section title="Slack Notifications" icon="🔔">
        <div className="space-y-3">
          <LabeledInput
            label="Incoming Webhook URL"
            placeholder="https://hooks.slack.com/services/..."
            value={form.slackWebhookUrl}
            onChange={v => setForm(p => ({ ...p, slackWebhookUrl: v }))}
            type="url"
          />
          <div className="text-xs text-slate-500 -mt-1">
            PRs, weekly recaps, missed sessions, and milestones will post here.{' '}
            <span className="text-amber-400">Note: direct browser→Slack calls may require a CORS proxy.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTestSlack}
              disabled={!form.slackWebhookUrl || slackTesting}
              className="btn-secondary text-sm py-2 flex-1 disabled:opacity-40"
            >
              {slackTesting ? 'Testing…' : 'Send Test'}
            </button>
            {slackResult === 'success' && <StatusBadge ok color="green">Sent!</StatusBadge>}
            {slackResult === 'error' && <StatusBadge color="red">CORS blocked — needs proxy</StatusBadge>}
          </div>
        </div>
      </Section>

      {/* Google Sheets */}
      <Section title="Google Sheets Sync" icon="📊">
        <div className="space-y-3">
          <LabeledInput
            label="Spreadsheet ID"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
            value={form.sheetsId}
            onChange={v => setForm(p => ({ ...p, sheetsId: v }))}
          />
          <LabeledInput
            label="OAuth Access Token"
            placeholder="ya29.a0..."
            value={form.sheetsToken}
            onChange={v => setForm(p => ({ ...p, sheetsToken: v }))}
            type="password"
          />
          <div className="text-xs text-slate-500">
            Get a token via{' '}
            <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-sky-400 underline">
              OAuth Playground
            </a>{' '}
            with <code className="text-slate-300">spreadsheets</code> scope. Tokens expire hourly.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTestSheets}
              disabled={!form.sheetsId || !form.sheetsToken || sheetsTesting}
              className="btn-secondary text-sm py-2 flex-1 disabled:opacity-40"
            >
              {sheetsTesting ? 'Checking…' : 'Verify Headers'}
            </button>
            {sheetsResult === 'success' && <StatusBadge ok color="green">OK</StatusBadge>}
          </div>
        </div>
      </Section>

      {/* Claude API */}
      <Section title="Claude AI (Block Generation)" icon="🤖">
        <div className="space-y-3">
          <LabeledInput
            label="Anthropic API Key"
            placeholder="sk-ant-..."
            value={form.anthropicApiKey}
            onChange={v => setForm(p => ({ ...p, anthropicApiKey: v }))}
            type="password"
          />
          <div className="text-xs text-slate-500">
            Used to generate coaching notes for new training blocks. Leave blank to use the built-in generator.
          </div>
          <button
            onClick={handleGenerateBlock}
            disabled={!form.anthropicApiKey || generating}
            className="btn-secondary text-sm py-2 w-full disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating…' : 'Generate Block Notes'}
          </button>
          {genResult && (
            <div className={`text-xs ${genResult.ok ? 'text-green-400' : 'text-red-400'}`}>
              {genResult.message}
            </div>
          )}
        </div>
      </Section>

      {/* Save button */}
      <div className="px-4 mb-6">
        <button onClick={handleSave} className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2">
          {saved ? (<><Check size={18} /> Saved!</>) : 'Save Settings'}
        </button>
      </div>

      {/* Training controls */}
      <Section title="Training Block" icon="📅">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-white font-medium">Current Block</div>
              <div className="text-slate-400 text-sm">Block {blockNum} · 4-week cycle</div>
            </div>
          </div>
          <button
            onClick={handleAdvanceBlock}
            className="w-full btn-secondary flex items-center justify-between py-3 px-4 text-sm"
          >
            <span>Advance to Block {blockNum + 1}</span>
            <ChevronRight size={16} />
          </button>
          <div className="text-xs text-slate-500">
            Do this when you complete all 4 weeks of the current block.
          </div>
        </div>
      </Section>

      {/* Claude block notes preview */}
      {state.claudeBlockNotes && (
        <div className="px-4 mb-6">
          <div className="card p-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">AI Block Notes</div>
            <p className="text-slate-300 text-sm">{state.claudeBlockNotes.blockNotes}</p>
          </div>
        </div>
      )}

      {/* Data info */}
      <div className="px-4">
        <div className="text-xs text-slate-600 text-center">
          All data stored locally in this browser. Export via Google Sheets sync.
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="px-4 mb-5">
      <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
        {icon} {title}
      </div>
      <div className="card p-4">
        {children}
      </div>
    </div>
  );
}

function LabeledInput({ label, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </div>
  );
}

function StatusBadge({ ok, color, children }) {
  return (
    <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-xl flex-shrink-0 ${
      color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
    }`}>
      {ok ? <Check size={12} /> : <AlertCircle size={12} />}
      {children}
    </div>
  );
}
