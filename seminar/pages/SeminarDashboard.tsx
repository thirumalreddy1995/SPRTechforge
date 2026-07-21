import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/Components';
import { useSeminar } from '../context/SeminarContext';
import { runSeminarTests, SeminarTestResult } from '../tests/seminarTests';
import { formatSeminarDate } from '../lib/template';

const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: 'default' | 'good' | 'bad' | 'warn' }> = ({ label, value, tone = 'default' }) => {
  const tones = {
    default: 'text-gray-900',
    good: 'text-emerald-700',
    bad: 'text-red-600',
    warn: 'text-amber-600',
  };
  return (
    <Card className="text-center py-4">
      <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </Card>
  );
};

export const SeminarDashboard: React.FC = () => {
  const { candidates, registrations, questions, settings, isLoading } = useSeminar();
  const [testResults, setTestResults] = useState<SeminarTestResult[] | null>(null);

  const stats = useMemo(() => {
    const sent = candidates.filter(c => c.emailStatus === 'sent').length;
    const failed = candidates.filter(c => c.emailStatus === 'failed').length;
    const pending = candidates.filter(c => c.emailStatus === 'pending').length;
    const registered = registrations.filter(r => r.status === 'registered');
    return {
      total: candidates.length,
      sent,
      failed,
      pending,
      online: registered.filter(r => r.preferredMode === 'online').length,
      inPerson: registered.filter(r => r.preferredMode === 'in_person').length,
      declined: registrations.filter(r => r.status === 'declined').length,
      unanswered: questions.filter(q => !q.replyText).length,
    };
  }, [candidates, registrations, questions]);

  const { date, time } = formatSeminarDate(settings.dateTime);

  if (isLoading) return <div className="text-gray-500 p-8 text-center">Loading seminar data…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seminar &middot; Dashboard</h1>
          <p className="text-gray-600">
            {settings.title}{settings.dateTime ? ` — ${date}, ${time}` : ' — set the date in Settings'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/seminar/import"><Button variant="secondary">Import Candidates</Button></Link>
          <Link to="/seminar/campaign"><Button>Open Campaign</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Candidates" value={stats.total} />
        <Stat label="Invites Sent" value={stats.sent} tone="good" />
        <Stat label="Invites Failed" value={stats.failed} tone={stats.failed ? 'bad' : 'default'} />
        <Stat label="Invites Pending" value={stats.pending} />
        <Stat label="Registered · Online" value={stats.online} tone="good" />
        <Stat label="Registered · In Person" value={stats.inPerson} tone="good" />
        <Stat label="Declined" value={stats.declined} />
        <Stat label="Unanswered Questions" value={stats.unanswered} tone={stats.unanswered ? 'warn' : 'default'} />
      </div>

      {stats.unanswered > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded flex items-center justify-between flex-wrap gap-2">
          <p className="text-amber-800 text-sm font-medium">{stats.unanswered} candidate question(s) waiting for your reply.</p>
          <Link to="/seminar/questions"><Button variant="secondary">Open Question Inbox</Button></Link>
        </div>
      )}

      {stats.total === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 font-medium mb-1">No candidates yet.</p>
            <p className="text-gray-400 text-sm mb-4">Start by importing your Excel contact list, then configure the event and banner in Settings.</p>
            <Link to="/seminar/import"><Button>Import Candidates</Button></Link>
          </div>
        </Card>
      )}

      <Card
        title="Module Tests"
        action={<Button variant="outline" onClick={() => setTestResults(runSeminarTests())}>Run Module Tests</Button>}
      >
        {!testResults && <p className="text-gray-400 text-sm italic">Runs the seminar module's pure-logic test suite (import pipeline, phone/email normalization, header detection, templating, A/B rotation) in this browser — same convention as Admin &rarr; Test Runner.</p>}
        {testResults && (
          <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
            <p className="font-bold text-gray-800 mb-2">
              {testResults.filter(r => r.status === 'PASS').length}/{testResults.length} passed
            </p>
            {testResults.map(r => (
              <div key={r.name} className={`flex items-start gap-2 p-1.5 rounded ${r.status === 'PASS' ? '' : 'bg-red-50'}`}>
                <span className={`px-2 py-0.5 rounded text-xs font-bold w-14 text-center shrink-0 ${r.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                <span className="flex-1 text-gray-800">{r.name}{r.status === 'FAIL' && <span className="block text-red-600 text-xs">{r.message}</span>}</span>
                <span className="text-gray-400 text-xs shrink-0">{r.duration.toFixed(1)}ms</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
