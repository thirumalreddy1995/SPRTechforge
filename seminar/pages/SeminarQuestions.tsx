import React, { useMemo, useState } from 'react';
import { Button, Card } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { useSeminar } from '../context/SeminarContext';
import { buildTemplateVars, escapeHtml, renderTemplate } from '../lib/template';
import { isSeminarMailerConfigured, sendSeminarEmail } from '../services/seminarMailer';
import { generateSeminarId } from '../lib/token';
import * as utils from '../../utils';

// Question inbox: newest first, unanswered highlighted. A reply saves to the
// thread (visible on the candidate's public page) AND is emailed to them.

export const SeminarQuestions: React.FC = () => {
  const { showToast } = useApp();
  const { questions, candidates, settings, updateQuestion, addCampaignLog, isLoading } = useSeminar();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unanswered'>('all');

  const candidateById = useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates]);

  const sorted = useMemo(
    () =>
      [...questions]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .filter(q => (filter === 'unanswered' ? !q.replyText : true)),
    [questions, filter],
  );
  const unansweredCount = questions.filter(q => !q.replyText).length;

  const reply = async (questionId: string) => {
    const q = questions.find(x => x.id === questionId);
    const text = (drafts[questionId] || '').trim();
    if (!q || !text) return;
    const candidate = candidateById.get(q.candidateId);
    setSendingId(questionId);
    try {
      const now = new Date().toISOString();
      let emailed = false;
      if (candidate?.email && isSeminarMailerConfigured()) {
        const vars = buildTemplateVars(candidate, settings);
        const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;">
          <p>Hi ${escapeHtml(candidate.fullName)},</p>
          <p>You asked about the seminar:</p>
          <blockquote style="border-left:3px solid #d1d5db;margin:0;padding:4px 12px;color:#6b7280;">${escapeHtml(q.questionText)}</blockquote>
          <p style="white-space:pre-wrap;">${escapeHtml(text)}</p>
          <p>You can reply with more questions on your page: <a href="${escapeHtml(vars.link)}">${escapeHtml(vars.link)}</a></p>
          <p>— ${escapeHtml(vars.trainer)}</p>
        </div>`;
        const subject = renderTemplate('Re: your question about the {date} seminar', vars, false);
        try {
          await sendSeminarEmail({ to: candidate.email, subject, html, bannerUrl: undefined, fromName: settings.fromName });
          emailed = true;
          await addCampaignLog({ id: generateSeminarId('semlog'), candidateId: candidate.id, channel: 'email_reply', sentAt: now, error: null });
        } catch (e: any) {
          showToast(`Reply saved, but the email failed: ${e.message || e}`, 'error');
          await addCampaignLog({ id: generateSeminarId('semlog'), candidateId: candidate.id, channel: 'email_reply', sentAt: now, error: String(e?.message || e) });
        }
      }
      await updateQuestion(questionId, { replyText: text, repliedAt: now, replyEmailed: emailed });
      setDrafts(prev => ({ ...prev, [questionId]: '' }));
      if (emailed) showToast('Reply saved and emailed to the candidate', 'success');
      else showToast(candidate?.email ? 'Reply saved to the thread' : 'Reply saved (candidate has no email on file)', 'success');
    } catch (e: any) {
      showToast(`Reply failed: ${e.message || e}`, 'error');
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) return <div className="text-gray-500 p-8 text-center">Loading questions…</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seminar &middot; Questions</h1>
          <p className="text-gray-600">{unansweredCount} unanswered. Replies appear on the candidate's page and are emailed to them.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>All ({questions.length})</Button>
          <Button variant={filter === 'unanswered' ? 'primary' : 'outline'} onClick={() => setFilter('unanswered')}>Unanswered ({unansweredCount})</Button>
          <Button
            variant="outline"
            disabled={sorted.length === 0}
            onClick={() => {
              utils.downloadCSV(
                sorted.map(q => {
                  const c = candidateById.get(q.candidateId);
                  return {
                    Candidate: c?.fullName || 'Unknown', Email: c?.email || '', Phone: c?.phone || '',
                    'Degree Group': c?.degreeGroup || '',
                    Question: q.questionText, 'Asked At': new Date(q.createdAt).toLocaleString(),
                    Reply: q.replyText || '', 'Replied At': q.repliedAt ? new Date(q.repliedAt).toLocaleString() : '',
                    'Reply Emailed': q.replyEmailed ? 'Yes' : 'No',
                  };
                }),
                utils.csvFilename('seminar-questions'),
              );
              showToast(`Exported ${sorted.length} questions`, 'success');
            }}
          >
            &#11015; Export CSV
          </Button>
        </div>
      </div>

      {sorted.length === 0 && (
        <Card><p className="text-gray-400 text-center italic py-8">No questions {filter === 'unanswered' ? 'awaiting a reply' : 'yet'}.</p></Card>
      )}

      {sorted.map(q => {
        const candidate = candidateById.get(q.candidateId);
        const unanswered = !q.replyText;
        return (
          <Card key={q.id} className={unanswered ? 'border-l-4 border-l-amber-400' : ''}>
            <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
              <div>
                <p className="font-bold text-gray-900">{candidate?.fullName || 'Unknown candidate'}</p>
                <p className="text-xs text-gray-500">
                  {candidate?.email || candidate?.phone || '—'} &middot; {candidate?.degreeGroup || ''} &middot; {new Date(q.createdAt).toLocaleString()}
                </p>
              </div>
              {unanswered
                ? <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">Awaiting reply</span>
                : <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">Replied{q.replyEmailed ? ' & emailed' : ''}</span>}
            </div>

            <p className="text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{q.questionText}</p>

            {q.replyText ? (
              <div className="mt-3 pl-4 border-l-2 border-emerald-300">
                <p className="text-xs text-emerald-700 font-bold mb-1">Your reply &middot; {q.repliedAt ? new Date(q.repliedAt).toLocaleString() : ''}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{q.replyText}</p>
              </div>
            ) : (
              <div className="mt-3 flex gap-2 items-end">
                <textarea
                  rows={2}
                  placeholder="Write your reply…"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={drafts[q.id] || ''}
                  onChange={e => setDrafts(prev => ({ ...prev, [q.id]: e.target.value }))}
                />
                <Button onClick={() => reply(q.id)} disabled={sendingId === q.id || !(drafts[q.id] || '').trim()}>
                  {sendingId === q.id ? 'Sending…' : 'Reply'}
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
