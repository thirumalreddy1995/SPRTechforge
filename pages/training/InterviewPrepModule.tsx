import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button } from '../../components/Components';
import * as utils from '../../utils';
import { InterviewPrepSession, InterviewPrepResponse } from '../../types';

// ─── Q&A Bank ─────────────────────────────────────────────────────────────────
interface QAPair { id: string; category: string; question: string; modelAnswer: string; }

const QA_BANK: QAPair[] = [
  { id: 'mt1', category: 'Manual Testing', question: 'What is the difference between Verification and Validation?', modelAnswer: 'Verification ensures we are building the product right by reviewing documents and designs while Validation ensures we are building the right product by testing it against user requirements. Verification is a static process and Validation is a dynamic process that tests the final product.' },
  { id: 'mt2', category: 'Manual Testing', question: 'What is Boundary Value Analysis?', modelAnswer: 'Boundary Value Analysis tests values at the boundaries of valid input ranges including the minimum maximum and values just inside and outside those boundaries. It is based on the principle that defects are most likely to occur at the edges of input partitions rather than in the middle.' },
  { id: 'mt3', category: 'Manual Testing', question: 'What is the difference between Smoke and Sanity Testing?', modelAnswer: 'Smoke Testing is a broad shallow test of major functionality to verify the build is stable enough for further testing. Sanity Testing is a narrow focused test on specific functionality after a bug fix to confirm the fix works correctly without breaking related areas.' },
  { id: 'mt4', category: 'Manual Testing', question: 'What is Regression Testing and when do you run it?', modelAnswer: 'Regression Testing re-runs previously passing test cases after code changes to ensure existing functionality has not been broken. It is typically automated and executed after every build bug fix or new feature deployment to catch unintended side effects quickly.' },
  { id: 'mt5', category: 'Manual Testing', question: 'What is Exploratory Testing?', modelAnswer: 'Exploratory Testing is an approach where testers simultaneously design and execute tests based on their knowledge and intuition without predefined test scripts. It is most effective when requirements are unclear or when testing complex systems where scripted tests may miss unexpected defects.' },
  { id: 'sel1', category: 'Selenium & C#', question: 'How does Selenium WebDriver work?', modelAnswer: 'Selenium WebDriver communicates directly with the browser using browser specific drivers such as ChromeDriver or GeckoDriver. The test code sends HTTP commands to the WebDriver server which translates them into native browser actions and returns the result back to the test framework.' },
  { id: 'sel2', category: 'Selenium & C#', question: 'What is the Page Object Model?', modelAnswer: 'The Page Object Model is a design pattern where each web page is represented as a class that encapsulates its elements and interaction methods. It separates page logic from test logic reduces code duplication and makes tests easier to maintain when the user interface changes.' },
  { id: 'sel3', category: 'Selenium & C#', question: 'What is the difference between Implicit and Explicit Wait?', modelAnswer: 'Implicit Wait sets a global timeout that Selenium applies to every element lookup throughout the session. Explicit Wait uses WebDriverWait and ExpectedConditions to wait for a specific condition on a specific element. Explicit Wait is preferred because it is more precise and avoids unnecessary delays in the test.' },
  { id: 'sel4', category: 'Selenium & C#', question: 'How do you handle StaleElementReferenceException?', modelAnswer: 'StaleElementReferenceException occurs when a referenced DOM element is no longer attached because the page refreshed or the DOM changed. You handle it by relocating the element inside a try catch block with retry logic or by using the Page Object Model to always fetch fresh element references when needed.' },
  { id: 'sel5', category: 'Selenium & C#', question: 'What is the Actions class in Selenium?', modelAnswer: 'The Actions class in Selenium C Sharp is used to perform complex user interactions such as mouse hover drag and drop right click double click and keyboard key combinations. It builds a chain of actions that are executed together as a single composite action using the Build and Perform methods.' },
  { id: 'sel6', category: 'Selenium & C#', question: 'How do you take a screenshot on test failure in C#?', modelAnswer: 'On test failure you cast the WebDriver to the ITakesScreenshot interface and call GetScreenshot followed by SaveAsFile to save the image to disk. This is done in the NUnit TearDown method by checking TestContext CurrentContext Result Outcome to detect failure and including the test name in the file path.' },
  { id: 'api1', category: 'API Testing', question: 'What is the difference between REST and SOAP APIs?', modelAnswer: 'REST is an architectural style that uses standard HTTP methods and typically returns JSON or XML data. SOAP is a protocol with a strict XML based message format and built-in standards for security and transactions. REST is lightweight and stateless while SOAP provides more built-in enterprise level features for complex integrations.' },
  { id: 'api2', category: 'API Testing', question: 'How do you perform API testing using RestSharp in C#?', modelAnswer: 'In RestSharp you create a RestClient with the base URL and a RestRequest with the endpoint path and HTTP method. You add headers query parameters or a JSON body using AddJsonBody or AddHeader then execute the request with ExecuteAsync and assert the StatusCode and deserialize the response content for validation.' },
  { id: 'api3', category: 'API Testing', question: 'What HTTP status codes do you validate in API tests?', modelAnswer: 'Key status codes to validate include 200 for a successful GET request 201 for resource creation 204 for successful deletion with no content 400 for bad request or invalid input 401 for unauthorized access 403 for forbidden access 404 for resource not found and 500 for internal server errors.' },
  { id: 'api4', category: 'API Testing', question: 'How do you test Bearer Token authentication in an API?', modelAnswer: 'To test Bearer Token authentication you first make a POST request to the token endpoint with valid credentials and extract the access token from the response body. You then include this token in the Authorization header of subsequent requests using the format Bearer followed by the token value and verify that protected endpoints return 200 and unauthorized requests return 401.' },
  { id: 'fw1', category: 'Test Frameworks', question: 'What are the key attributes in NUnit?', modelAnswer: 'Key NUnit attributes include TestFixture to mark a test class Test to mark a test method SetUp for code running before each test TearDown for code running after each test OneTimeSetUp and OneTimeTearDown for class level initialization and cleanup and TestCase for inline parameterized data driven tests.' },
  { id: 'fw2', category: 'Test Frameworks', question: 'What is the Arrange-Act-Assert pattern?', modelAnswer: 'Arrange Act Assert also known as triple A structures each test into three clear phases. Arrange sets up the preconditions and test data. Act executes the single operation being tested. Assert verifies that the actual outcome matches the expected result. This pattern improves readability and ensures each test has a single well defined purpose.' },
  { id: 'fw3', category: 'Test Frameworks', question: 'How do you implement data-driven testing in NUnit?', modelAnswer: 'Data driven testing in NUnit uses the TestCase attribute to pass multiple inline parameter sets to a single test method with NUnit creating a separate test run for each set. For larger or external datasets TestCaseSource points to a method or IEnumerable property that returns test case objects keeping test logic separate from test data.' },
  { id: 'bdd1', category: 'BDD & SpecFlow', question: 'What is BDD and how does it differ from TDD?', modelAnswer: 'BDD or Behavior Driven Development focuses on the observable behavior of the system from the user perspective using natural language scenarios written in Gherkin. TDD or Test Driven Development focuses on writing unit tests before production code at a technical level. BDD bridges communication between business stakeholders developers and testers through shared readable specifications.' },
  { id: 'bdd2', category: 'BDD & SpecFlow', question: 'How does SpecFlow work in C#?', modelAnswer: 'SpecFlow binds Gherkin feature files written in plain English to C Sharp step definition classes using Given When and Then binding attributes. When a scenario runs SpecFlow matches each Gherkin step to a corresponding step definition method using regular expressions or Cucumber expressions and executes them in sequence.' },
  { id: 'bdd3', category: 'BDD & SpecFlow', question: 'What is ScenarioContext in SpecFlow?', modelAnswer: 'ScenarioContext is a thread safe dictionary injected into step definition classes that allows sharing state and data between different step definition methods within the same scenario execution. You store values using a string key and retrieve them in subsequent steps avoiding the need for global static variables across step definitions.' },
  { id: 'bdd4', category: 'BDD & SpecFlow', question: 'What are SpecFlow Hooks?', modelAnswer: 'SpecFlow Hooks are tagged methods that execute at defined points in the test lifecycle. BeforeScenario and AfterScenario run around each scenario for setup and teardown. BeforeFeature and AfterFeature run once per feature file. BeforeStep and AfterStep run around individual steps and are decorated with the corresponding hook attribute.' },
  { id: 'az1', category: 'Azure DevOps', question: 'What is the structure of an Azure DevOps pipeline YAML file?', modelAnswer: 'An Azure DevOps YAML pipeline starts with a trigger defining when it runs followed by optional variables and a pool defining the build agent. Below that are stages each containing jobs and each job contains a sequence of steps. Each step is either a script or a task with defined inputs. Stages can run sequentially or in parallel depending on their dependency configuration.' },
  { id: 'az2', category: 'Azure DevOps', question: 'How do you publish test results in an Azure DevOps pipeline?', modelAnswer: 'You add the PublishTestResults task to your pipeline YAML and specify the testResultsFormat such as NUnit the testResultsFiles path pattern to find the result XML files and a testRunTitle for the dashboard display. After the task runs the test results appear in the Tests tab of the pipeline run with pass fail and skip counts visible to the team.' },
  { id: 'az3', category: 'Azure DevOps', question: 'What is a Service Connection in Azure DevOps?', modelAnswer: 'A Service Connection is a named secure store of credentials and configuration that connects Azure DevOps to an external service such as an Azure subscription GitHub repository Docker registry or Kubernetes cluster. Pipelines reference service connections by name to authenticate with external services without exposing sensitive credentials directly in the pipeline code.' },
];

const CATEGORIES = [...new Set(QA_BANK.map(q => q.category))];

// ─── Speed settings ───────────────────────────────────────────────────────────
// rate = TTS speech rate (0.1–1.0); pauseMs = silence after each sentence/clause
interface SpeedSetting { label: string; rate: number; pauseMs: number; color: string; }
const SPEED_SETTINGS: SpeedSetting[] = [
  { label: 'Very Slow', rate: 0.4,  pauseMs: 3000, color: '#7c3aed' },
  { label: 'Slow',      rate: 0.55, pauseMs: 2200, color: '#2563eb' },
  { label: 'Normal',    rate: 0.75, pauseMs: 1500, color: '#16a34a' },
  { label: 'Fast',      rate: 0.9,  pauseMs: 900,  color: '#d97706' },
  { label: 'Very Fast', rate: 1.1,  pauseMs: 500,  color: '#dc2626' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STOP = new Set(['a','an','the','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','must','to','of','in','on','at','by','for','with','into','from','and','but','or','not','it','its','we','you','he','she','they','this','that','which','who','what','how','as','such','then','than','also','each','more','most','other','some','any','very','just']);
const normWords = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));

// Split answer at sentence/clause boundaries (full stop, comma) keeping punctuation attached
function splitAtPunctuation(answer: string): string[] {
  const parts = answer.split(/([.?!,;])/).filter(s => s.length > 0);
  const segs: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (/^[.?!,;]$/.test(parts[i])) {
      if (segs.length > 0) segs[segs.length - 1] += parts[i];
    } else {
      const t = parts[i].trim();
      if (t) segs.push(t);
    }
  }
  return segs.filter(s => s.trim().length > 0);
}

// Longer pause after sentence-ending punctuation, shorter after commas
function getPause(seg: string, speed: SpeedSetting): number {
  const last = seg.trim().slice(-1);
  return ['.','?','!'].includes(last) ? speed.pauseMs * 1.5 : speed.pauseMs;
}

function scoreAnswer(spoken: string, modelAnswer: string): { score: number; missedKeywords: string[] } {
  const modelWords = normWords(modelAnswer).filter(w => w.length > 3);
  if (!modelWords.length) return { score: 0, missedKeywords: [] };
  const spokenSet = new Set(normWords(spoken));
  const matched = modelWords.filter(w => spokenSet.has(w));
  const missed = [...new Set(modelWords.filter(w => !spokenSet.has(w)))].slice(0, 6);
  return { score: Math.round((matched.length / modelWords.length) * 100), missedKeywords: missed };
}

function getGrade(s: number) { return s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : s >= 45 ? 'D' : 'F'; }
function scoreCol(s: number) { return s >= 75 ? '#16a34a' : s >= 60 ? '#2563eb' : s >= 45 ? '#d97706' : '#dc2626'; }
function scoreBg(s: number) { return s >= 75 ? 'bg-green-50 border-green-200' : s >= 60 ? 'bg-blue-50 border-blue-200' : s >= 45 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'; }
function scoreLabel(s: number) { return s >= 90 ? 'Excellent' : s >= 75 ? 'Good' : s >= 60 ? 'Fair' : s >= 45 ? 'Needs Work' : 'Keep Practising'; }

function deriveFeedback(rs: InterviewPrepResponse[]) {
  const cat: Record<string, number[]> = {};
  rs.forEach(r => { (cat[r.category] = cat[r.category] || []).push(r.score); });
  const avgs = Object.entries(cat).map(([c, sc]) => ({ c, avg: Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) })).sort((a,b)=>a.avg-b.avg);
  return { improvement: avgs.filter(x=>x.avg<70).slice(0,3).map(x=>x.c), strong: avgs.filter(x=>x.avg>=70).slice(-2).map(x=>x.c) };
}

// ─── Expression analysis ──────────────────────────────────────────────────────
interface ExpressionReport { calmScore: number; engagementScore: number; stressEvents: number; feedback: string[]; recommendation: string; }

function buildExpressionReport(motionScores: number[], presenceScores: number[]): ExpressionReport {
  if (!motionScores.length) return { calmScore: 0, engagementScore: 0, stressEvents: 0, feedback: ['No video data captured.'], recommendation: 'Camera was unavailable during this session.' };
  const avg = motionScores.reduce((a,b)=>a+b,0)/motionScores.length;
  const stressEvents = motionScores.filter(m=>m>30).length;
  const calmScore = Math.max(0, Math.round(100 - avg * 2.5));
  const engagementScore = presenceScores.length ? Math.min(100, Math.round(presenceScores.reduce((a,b)=>a+b,0)/presenceScores.length)) : 0;
  const feedback: string[] = [];
  if (calmScore >= 80) feedback.push('Great composure — you remained calm and steady throughout.');
  else if (calmScore >= 60) feedback.push('Some nervous movement detected — try to sit still and relax your shoulders.');
  else feedback.push('High movement detected — practice controlled breathing before the interview.');
  if (engagementScore >= 75) feedback.push('Excellent camera engagement maintained throughout the session.');
  else if (engagementScore >= 50) feedback.push('Moderate camera engagement — look directly at the lens as if talking to the interviewer.');
  else feedback.push('Low camera engagement — maintain steady eye contact with the camera during your answers.');
  if (stressEvents > 3) feedback.push(`${stressEvents} stress spikes detected — try the 4-4-6 breathing technique before your interview.`);
  const recommendation = calmScore >= 75 && engagementScore >= 70 ? 'Body language is interview-ready. Focus on verbal accuracy.' : calmScore < 60 ? 'Work on physical composure — record yourself daily to build camera confidence.' : 'Continue practising. Your verbal answers are improving nicely.';
  return { calmScore, engagementScore, stressEvents, feedback, recommendation };
}

// ─── ScoreRing ────────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const r = size * 0.38, c = 2 * Math.PI * r, col = scoreCol(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)', position:'absolute' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="6" strokeDasharray={c} strokeDashoffset={c*(1-score/100)} strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:size*0.22, fontWeight:900, color:col, fontFamily:'monospace' }}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-bold tracking-wider uppercase" style={{ color:col }}>{scoreLabel(score)}</span>
    </div>
  );
};

// ─── Session history card ─────────────────────────────────────────────────────
const SessionCard: React.FC<{ session: InterviewPrepSession; onDelete:(id:string)=>void }> = ({ session, onDelete }) => {
  const [open, setOpen] = useState(false);
  const gc: Record<string,string> = { A:'bg-green-100 text-green-700', B:'bg-blue-100 text-blue-700', C:'bg-yellow-100 text-yellow-700', D:'bg-orange-100 text-orange-700', F:'bg-red-100 text-red-700' };
  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50" onClick={()=>setOpen(o=>!o)}>
        <div className="flex flex-col items-center w-16 shrink-0">
          <span className="text-2xl font-black" style={{ color:scoreCol(session.overallScore) }}>{session.overallScore}%</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gc[session.grade]||gc.F}`}>Grade {session.grade}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 text-sm">{new Date(session.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
          <div className="text-xs text-slate-500">{session.totalQuestions} questions · {session.strongAreas.length ? `Strong: ${session.strongAreas.join(', ')}` : 'Complete more sessions to identify strengths'}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e=>{e.stopPropagation();onDelete(session.id);}} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${open?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
          {session.improvementAreas.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Improvement Areas</div>
              <div className="flex flex-wrap gap-1">{session.improvementAreas.map(a=><span key={a} className="text-xs bg-orange-100 text-orange-700 border border-orange-300 px-2 py-0.5 rounded-full">{a}</span>)}</div>
            </div>
          )}
          {session.responses.map((r,i)=>(
            <div key={i} className={`p-3 rounded-lg border ${scoreBg(r.score)}`}>
              <div className="flex justify-between items-start gap-2 mb-1">
                <div className="text-xs font-semibold text-slate-700 flex-1">Q{i+1}: {r.question}</div>
                <span className="text-sm font-black shrink-0" style={{color:scoreCol(r.score)}}>{r.score}%</span>
              </div>
              <div className="text-xs text-slate-500 mb-1"><b>You said:</b> {r.spokenAnswer || <em>Nothing captured</em>}</div>
              {r.missedKeywords.length>0 && <div className="text-xs">Missed: {r.missedKeywords.map(k=><span key={k} className="inline-block bg-red-100 text-red-700 px-1.5 py-0.5 rounded mr-1">{k}</span>)}</div>}
              <div className="text-xs text-slate-400 italic mt-1">{r.feedback}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Phase type ───────────────────────────────────────────────────────────────
type Phase = 'setup' | 'reading-question' | 'prompting' | 'reviewing' | 'results';

// ─── Main component ───────────────────────────────────────────────────────────
export const InterviewPrepModule: React.FC = () => {
  const { user, candidates, interviewPrepSessions, addInterviewPrepSession, deleteInterviewPrepSession, showToast } = useApp();

  const isCandidate = user?.role === 'candidate';
  const isAdmin = user?.role === 'admin' || user?.username === 'thirumalreddy@sprtechforge.com';
  const linkedCandidate = isCandidate ? candidates.find(c => c.id === user?.linkedCandidateId) : null;
  const mySessions = isCandidate ? interviewPrepSessions.filter(s => s.candidateId === (linkedCandidate?.id || user?.id)) : [];

  const [view, setView] = useState<'session'|'history'|'admin'>(() => isAdmin ? 'admin' : 'session');
  const [adminFilter, setAdminFilter] = useState('');

  // Config
  const [selectedCats, setSelectedCats] = useState<string[]>(CATEGORIES.slice(0, 3));
  const [qCount, setQCount] = useState(5);
  const [speedIdx, setSpeedIdx] = useState(2);

  // Session state
  const [phase, setPhase] = useState<Phase>('setup');
  const [sessionQs, setSessionQs] = useState<QAPair[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [responses, setResponses] = useState<InterviewPrepResponse[]>([]);
  const [currentReview, setCurrentReview] = useState<InterviewPrepResponse | null>(null);

  // Segment state — one segment = one sentence or clause from the model answer
  const [segments, setSegments] = useState<string[]>([]);
  const [segIdx, setSegIdx] = useState(0);         // index of currently speaking segment
  const [segPlayed, setSegPlayed] = useState(0);   // how many segments have been spoken so far
  const [liveTranscript, setLiveTranscript] = useState('');

  // Video / expression
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [liveMotion, setLiveMotion] = useState(0);
  const [expressionReport, setExpressionReport] = useState<ExpressionReport | null>(null);

  // Browser support
  const [ttsOk, setTtsOk] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackText, setFallbackText] = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────────
  const recRef        = useRef<any>(null);
  const interimRef    = useRef('');
  const speedIdxRef   = useRef(2);
  const sessionQsRef  = useRef<QAPair[]>([]);
  const qIdxRef       = useRef(0);
  const segsRef       = useRef<string[]>([]);
  const finalizedRef  = useRef(false);
  // cancelledRef: set to true on resetSession — all async callbacks check this before proceeding
  const cancelledRef  = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const streamRef     = useRef<MediaStream|null>(null);
  const prevFrameRef  = useRef<Uint8ClampedArray|null>(null);
  const motionRef     = useRef<number[]>([]);
  const presenceRef   = useRef<number[]>([]);
  const frameTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => { speedIdxRef.current = speedIdx; }, [speedIdx]);

  // Browser capability check
  useEffect(() => {
    setTtsOk('speechSynthesis' in window);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = 'en-US';
      r.onresult = (e: any) => {
        let full = '';
        for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript + ' ';
        interimRef.current = full.trim();
        setLiveTranscript(full.trim());
      };
      r.onerror = (e: any) => { if (e.error !== 'aborted' && e.error !== 'no-speech') setUseFallback(true); };
      recRef.current = r;
    } else {
      setUseFallback(true);
    }
    return () => {
      window.speechSynthesis?.cancel();
      recRef.current?.abort();
      stopFrameCapture();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Attach stream to video element after every render — ensures it survives any re-mount
  useEffect(() => {
    if (cameraReady && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  });

  // ── Camera ──────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      motionRef.current = []; presenceRef.current = []; prevFrameRef.current = null;
      setCameraError('');
      setCameraReady(true);
    } catch (e: any) {
      setCameraError(e.message || 'Camera access denied');
      setCameraReady(false);
    }
  };

  const startFrameCapture = () => {
    frameTimerRef.current = setInterval(() => {
      const video = videoRef.current, canvas = canvasRef.current;
      if (!video || !canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      canvas.width = 80; canvas.height = 60;
      ctx.drawImage(video, 0, 0, 80, 60);
      const frame = ctx.getImageData(0, 0, 80, 60);
      let brightness = 0;
      for (let y = 20; y < 40; y++) for (let x = 30; x < 50; x++) {
        const i = (y*80+x)*4; brightness += (frame.data[i]+frame.data[i+1]+frame.data[i+2])/3;
      }
      presenceRef.current.push(Math.min(100,(brightness/400/128)*100));
      if (prevFrameRef.current) {
        let diff = 0;
        for (let i = 0; i < frame.data.length; i += 8) diff += Math.abs(frame.data[i]-prevFrameRef.current[i]) + Math.abs(frame.data[i+1]-prevFrameRef.current[i+1]) + Math.abs(frame.data[i+2]-prevFrameRef.current[i+2]);
        const motion = Math.min(100,(diff/(frame.data.length/8))*3);
        motionRef.current.push(motion);
        setLiveMotion(Math.round(motion));
      }
      prevFrameRef.current = new Uint8ClampedArray(frame.data);
    }, 1500);
  };

  const stopFrameCapture = () => {
    if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
  };

  // ── TTS — cancellation-safe ────────────────────────────────────────────
  // onEnd only fires if the session has not been cancelled
  const speakRaw = (text: string, rate: number, onEnd: () => void) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.lang = 'en-US';
    utt.onend = () => { if (!cancelledRef.current) onEnd(); };
    utt.onerror = () => { if (!cancelledRef.current) onEnd(); };
    window.speechSynthesis.speak(utt);
  };

  // ── STR helpers ──────────────────────────────────────────────────────────
  const startRec = () => { if (!useFallback && recRef.current) { try { recRef.current.start(); } catch(_){} } };
  const stopRec  = () => { if (!useFallback && recRef.current) { try { recRef.current.stop();  } catch(_){} } };

  const clearPauseTimer = () => {
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
  };

  // ── CORE: speak each sentence/clause sequentially with pauses ────────────
  const speakSegments = (si: number) => {
    if (cancelledRef.current) return;
    const allSegs = segsRef.current;
    if (si >= allSegs.length) { finishQuestion(); return; }

    const speed = SPEED_SETTINGS[speedIdxRef.current];
    setSegIdx(si);
    setSegPlayed(si + 1);

    speakRaw(allSegs[si], speed.rate, () => {
      if (cancelledRef.current) return;
      // Brief pause after each segment (longer after sentences, shorter after clauses)
      const pause = getPause(allSegs[si], speed);
      pauseTimerRef.current = setTimeout(() => {
        if (cancelledRef.current) return;
        speakSegments(si + 1);
      }, pause);
    });
  };

  // ── Finish one question ────────────────────────────────────────────────
  const finishQuestion = () => {
    if (cancelledRef.current) return;
    stopRec();
    clearPauseTimer();
    window.speechSynthesis.cancel();

    const qa = sessionQsRef.current[qIdxRef.current];
    const spoken = (useFallback ? fallbackText : interimRef.current).trim();
    const { score, missedKeywords } = scoreAnswer(spoken, qa.modelAnswer);

    const feedback =
      score >= 90 ? 'Excellent — you echoed almost every key concept.' :
      score >= 75 ? 'Good. A few key terms were missed — review the model answer.' :
      score >= 60 ? 'Fair. Try to speak along more closely with each sentence.' :
      score >= 45 ? 'Needs work. Listen carefully and echo as you hear the phrases.' :
      'Keep practising. Choose a slower speed to give yourself more time.';

    const resp: InterviewPrepResponse = {
      questionId: qa.id, question: qa.question, category: qa.category,
      modelAnswer: qa.modelAnswer, spokenAnswer: spoken,
      score, feedback, missedKeywords,
    };

    const updatedResponses = [...responses, resp];
    setResponses(updatedResponses);
    setCurrentReview(resp);

    const isLast = qIdxRef.current + 1 >= sessionQsRef.current.length;
    if (isLast && !finalizedRef.current) {
      finalizedRef.current = true;
      stopFrameCapture();
      const overall = Math.round(updatedResponses.reduce((a,b)=>a+b.score,0)/updatedResponses.length);
      const { improvement, strong } = deriveFeedback(updatedResponses);
      const expr = buildExpressionReport(motionRef.current, presenceRef.current);
      setExpressionReport(expr);
      const cId = linkedCandidate?.id || user?.id || 'unknown';
      const cName = linkedCandidate?.name || user?.name || 'Candidate';
      addInterviewPrepSession({
        id: utils.generateId(), candidateId: cId, candidateName: cName,
        date: new Date().toISOString(), totalQuestions: updatedResponses.length,
        responses: updatedResponses, overallScore: overall, grade: getGrade(overall),
        improvementAreas: improvement, strongAreas: strong,
      });
    }
    setPhase('reviewing');
  };

  // ── Start session ──────────────────────────────────────────────────────
  const startSession = async () => {
    const pool = QA_BANK.filter(q => selectedCats.includes(q.category));
    if (!pool.length) { showToast('Select at least one category', 'error'); return; }
    const shuffled = [...pool].sort(() => Math.random()-0.5).slice(0, Math.min(qCount, pool.length));

    cancelledRef.current = false;
    sessionQsRef.current = shuffled;
    qIdxRef.current = 0;
    finalizedRef.current = false;
    motionRef.current = [];
    presenceRef.current = [];
    setSessionQs(shuffled);
    setQIdx(0);
    setResponses([]);
    setCurrentReview(null);
    setExpressionReport(null);
    setLiveTranscript('');
    setFallbackText('');
    interimRef.current = '';

    await startCamera();
    startFrameCapture();
    beginQuestion(shuffled, 0);
  };

  const beginQuestion = (qs: QAPair[], qi: number) => {
    if (cancelledRef.current) return;
    qIdxRef.current = qi;
    const speed = SPEED_SETTINGS[speedIdxRef.current];
    const allSegs = splitAtPunctuation(qs[qi].modelAnswer);
    segsRef.current = allSegs;
    interimRef.current = '';
    setLiveTranscript('');
    setFallbackText('');
    setSegments(allSegs);
    setSegIdx(0);
    setSegPlayed(0);
    setPhase('reading-question');

    // 1. Read the question
    speakRaw(`Question ${qi+1}: ${qs[qi].question}`, speed.rate, () => {
      if (cancelledRef.current) return;
      // 2. Brief gap, then begin reading the model answer segment by segment
      pauseTimerRef.current = setTimeout(() => {
        if (cancelledRef.current) return;
        setPhase('prompting');
        startRec();
        speakSegments(0);
      }, 800);
    });
  };

  const nextQuestion = () => {
    if (cancelledRef.current) return;
    const next = qIdxRef.current + 1;
    if (next >= sessionQsRef.current.length) { setPhase('results'); return; }
    setQIdx(next);
    beginQuestion(sessionQsRef.current, next);
  };

  // ── Reset / end session — stops everything immediately ─────────────────
  const resetSession = () => {
    // Set cancelled FIRST so all pending async callbacks become no-ops
    cancelledRef.current = true;
    clearPauseTimer();
    window.speechSynthesis.cancel();
    recRef.current?.abort();
    stopFrameCapture();
    // Stop and release the camera
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraError('');
    setPhase('setup');
    setSessionQs([]); setSegments([]); setSegIdx(0); setSegPlayed(0);
    setResponses([]); setCurrentReview(null);
    setLiveTranscript(''); setFallbackText('');
    interimRef.current = '';
    finalizedRef.current = false;
    setLiveMotion(0);
  };

  const currentQA = sessionQs[qIdx];
  const overall = responses.length ? Math.round(responses.reduce((a,b)=>a+b.score,0)/responses.length) : 0;
  const speed = SPEED_SETTINGS[speedIdx];

  // ─── Video panel JSX (NOT a sub-component — avoids remount/srcObject loss) ───
  const videoPanelJsx = (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-48 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-lg">
        {/* Video element is always rendered so ref stays stable */}
        <video ref={videoRef} autoPlay playsInline muted
          className={`w-full object-cover ${cameraReady ? '' : 'hidden'}`}
          style={{ minHeight: 120 }} />
        {!cameraReady && (
          <div className="w-48 h-32 flex flex-col items-center justify-center text-slate-500 px-3 text-center">
            <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span className="text-xs">{cameraError || 'Starting camera…'}</span>
          </div>
        )}
        {cameraReady && (
          <div className="absolute top-2 left-2 right-2">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width:`${liveMotion}%`, background: liveMotion<20?'#16a34a':liveMotion<40?'#d97706':'#dc2626' }}/>
              </div>
              <span className={`text-xs font-bold ${liveMotion<20?'text-green-400':liveMotion<40?'text-yellow-400':'text-red-400'}`}>{liveMotion<20?'Calm':liveMotion<40?'Alert':'Tense'}</span>
            </div>
          </div>
        )}
        {phase === 'prompting' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            <span className="text-xs text-white font-bold">REC</span>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"/>
      {cameraReady && <div className="text-xs text-slate-400">Expression being analysed</div>}
      {cameraError && <div className="text-xs text-red-400 text-center px-2 max-w-[12rem]">{cameraError}</div>}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (isAdmin && view === 'admin') {
    const filtered = interviewPrepSessions.filter(s=>!adminFilter||s.candidateName.toLowerCase().includes(adminFilter.toLowerCase())).sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
    const uniqueCands = [...new Set(interviewPrepSessions.map(s=>s.candidateId))];
    const avgAll = interviewPrepSessions.length ? Math.round(interviewPrepSessions.reduce((a,b)=>a+b.overallScore,0)/interviewPrepSessions.length) : 0;
    const candStats = uniqueCands.map(cid => {
      const ss = interviewPrepSessions.filter(s=>s.candidateId===cid);
      return { name:ss[0]?.candidateName||'Unknown', count:ss.length, avg:Math.round(ss.reduce((a,b)=>a+b.overallScore,0)/ss.length), best:Math.max(...ss.map(s=>s.overallScore)) };
    }).sort((a,b)=>b.avg-a.avg);
    return (
      <div>
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-slate-800">Interview Prep — Admin View</h1><p className="text-slate-500 text-sm mt-1">Monitor all candidates' practice sessions</p></div>
          <Button variant="secondary" onClick={()=>setView('session')}>Switch to Practice</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[{l:'Total Sessions',v:interviewPrepSessions.length,c:'text-blue-600',i:'📋'},{l:'Candidates Tested',v:uniqueCands.length,c:'text-purple-600',i:'👥'},{l:'Average Score',v:`${avgAll}%`,c:avgAll>=70?'text-green-600':'text-orange-600',i:'📊'},{l:'Grade A Sessions',v:interviewPrepSessions.filter(s=>s.grade==='A').length,c:'text-green-600',i:'🏆'}].map(s=>(
            <Card key={s.l}><div className="flex items-center gap-3"><span className="text-2xl">{s.i}</span><div><div className={`text-2xl font-black ${s.c}`}>{s.v}</div><div className="text-xs text-slate-500">{s.l}</div></div></div></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-widest">Candidate Leaderboard</h3>
            {!candStats.length ? <p className="text-sm text-slate-400 py-6 text-center">No sessions yet</p> : (
              <div className="space-y-2">{candStats.map((cs,i)=>(
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={()=>setAdminFilter(cs.name)}>
                  <span className="text-xs font-black text-slate-400 w-5 text-center">{i+1}</span>
                  <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-slate-700 truncate">{cs.name}</div><div className="text-xs text-slate-400">{cs.count} session{cs.count!==1?'s':''} · Best: {cs.best}%</div></div>
                  <span className="text-sm font-black" style={{color:scoreCol(cs.avg)}}>{cs.avg}%</span>
                </div>
              ))}</div>
            )}
          </Card>
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Filter by candidate name…" value={adminFilter} onChange={e=>setAdminFilter(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"/>
              {adminFilter && <button onClick={()=>setAdminFilter('')} className="text-xs text-slate-500 px-3 border border-slate-200 rounded-lg hover:bg-slate-50">Clear</button>}
            </div>
            {!filtered.length
              ? <Card><div className="text-center py-12 text-slate-400"><div className="text-4xl mb-2">🎙️</div><div className="font-semibold">{adminFilter?'No sessions match filter':'No sessions recorded yet'}</div></div></Card>
              : <div className="space-y-3">{filtered.map(s=>(
                  <div key={s.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-start gap-4">
                      <ScoreRing score={s.overallScore} size={60}/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm">{s.candidateName}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.grade==='A'?'bg-green-100 text-green-700':s.grade==='B'?'bg-blue-100 text-blue-700':s.grade==='C'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>Grade {s.grade}</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">{new Date(s.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})} · {s.totalQuestions} questions</div>
                        <div className="flex flex-wrap gap-1">
                          {s.improvementAreas.map(a=><span key={a} className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">{a}</span>)}
                          {s.strongAreas.map(a=><span key={a} className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{a}</span>)}
                        </div>
                      </div>
                      <button onClick={()=>deleteInterviewPrepSession(s.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                    <div className="px-4 pb-3 flex gap-1.5">{s.responses.map((r,i)=><div key={i} title={`Q${i+1}: ${r.score}%`} className="flex-1 h-2 rounded-full" style={{background:scoreCol(r.score),opacity:0.7}}/>)}</div>
                  </div>
                ))}</div>
            }
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'history') {
    const sorted = [...mySessions].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());
    return (
      <div>
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div><h1 className="text-2xl font-bold text-slate-800">My Practice History</h1><p className="text-slate-500 text-sm mt-1">{sorted.length} session{sorted.length!==1?'s':''} completed</p></div>
          <Button variant="secondary" onClick={()=>{resetSession();setView('session');}}>← Back to Practice</Button>
        </div>
        {!sorted.length
          ? <Card><div className="text-center py-16 text-slate-400"><div className="text-5xl mb-3">🎙️</div><div className="font-semibold text-slate-600">No sessions yet</div><div className="text-sm mt-1 mb-4">Complete a practice session to see your results here</div><button onClick={()=>{resetSession();setView('session');}} className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Start Practice</button></div></Card>
          : <div className="space-y-3">{sorted.map(s=><SessionCard key={s.id} session={s} onDelete={id=>{deleteInterviewPrepSession(id);showToast('Session deleted');}}/>)}</div>
        }
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Interview Prep — Prompt Practice</h1>
          <p className="text-slate-500 text-sm mt-1">System reads the answer aloud · Repeat along as you hear it · Scored on key concept coverage</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && <Button variant="secondary" onClick={()=>{resetSession();setView('admin');}}>Admin View</Button>}
          {isCandidate && <Button variant="secondary" onClick={()=>{resetSession();setView('history');}}>History ({mySessions.length})</Button>}
          {phase !== 'setup' && <Button variant="danger" onClick={resetSession}>End Session</Button>}
        </div>
      </div>

      {/* ── SETUP ── */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">1</span> Topic Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const active = selectedCats.includes(cat);
                  return (
                    <button key={cat} onClick={()=>setSelectedCats(p=>active?(p.length>1?p.filter(c=>c!==cat):p):[...p,cat])}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${active?'bg-blue-50 border-blue-400 text-blue-700':'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${active?'bg-blue-600 border-blue-600':'border-slate-300'}`}>
                        {active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                      </div>
                      {cat}
                    </button>
                  );
                })}
              </div>
            </Card>
            <Card>
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">2</span> Questions: <span className="text-blue-600 ml-1">{qCount}</span></h3>
              <input type="range" min={3} max={10} value={qCount} onChange={e=>setQCount(+e.target.value)} className="w-full accent-blue-600 cursor-pointer mb-1"/>
              <div className="flex justify-between text-xs text-slate-400"><span>3 Quick</span><span>10 Full</span></div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">3</span> Playback Speed</h3>
              <div className="grid grid-cols-5 gap-1 mb-3">
                {SPEED_SETTINGS.map((s,i)=>(
                  <button key={i} onClick={()=>setSpeedIdx(i)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all text-center ${speedIdx===i?'text-white border-transparent shadow-md':'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    style={speedIdx===i?{background:s.color,borderColor:s.color}:{}}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="p-3 rounded-lg text-xs text-slate-600 border" style={{background:`${speed.color}10`,borderColor:`${speed.color}30`}}>
                <div className="font-bold mb-1" style={{color:speed.color}}>{speed.label} Mode</div>
                <div>• TTS rate: <b>{speed.rate}×</b></div>
                <div>• Pause at commas: <b>{speed.pauseMs}ms</b></div>
                <div>• Pause at full stops: <b>{Math.round(speed.pauseMs * 1.5)}ms</b></div>
                <div className="mt-1 text-slate-400">{speedIdx===0?'Lots of breathing room to echo along':speedIdx===1?'Comfortable pace for learning':speedIdx===2?'Recommended for regular practice':speedIdx===3?'Moderate pressure — good for polishing':'Fast-paced interview simulation'}</div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-700 mb-3">How it works</h3>
              <ol className="space-y-1.5">
                {[
                  ['🔊','System reads the question aloud'],
                  ['📖','System reads the model answer sentence by sentence'],
                  ['🎙️','Speak along as you hear each sentence — mic captures your voice'],
                  ['⏸️','A brief pause at each comma and full stop gives you time to echo'],
                  ['📊','Score based on key concept coverage of your spoken response'],
                ].map(([ico,txt],i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-sm leading-4 shrink-0">{ico}</span><span>{txt}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              📷 Camera starts automatically when the session begins. Use headphones so the mic only captures your voice.
            </div>

            {!ttsOk && <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">⚠️ Text-to-speech not available in this browser.</div>}
            {useFallback && <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">⚠️ Microphone unavailable — you will type your responses instead.</div>}

            <Button onClick={startSession} className="w-full py-3 text-base font-bold">🎙️ Start Practice Session</Button>
          </div>
        </div>
      )}

      {/* ── ACTIVE (reading-question + prompting) ── */}
      {(phase === 'reading-question' || phase === 'prompting') && currentQA && (
        <div className="max-w-4xl">
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Question {qIdx+1} of {sessionQs.length} · {currentQA.category}</span>
              <span className="font-semibold" style={{color:speed.color}}>{speed.label} · {speed.rate}× TTS</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-500" style={{width:`${(qIdx/sessionQs.length)*100}%`,background:speed.color}}/>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              {/* Question */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                  {phase === 'reading-question' ? '🔊 Reading question…' : '📋 Question'}
                </div>
                <div className="text-base font-semibold text-slate-800 leading-relaxed">{currentQA.question}</div>
              </div>

              {/* Answer playback — sentence by sentence */}
              <div className={`rounded-xl border ${phase==='prompting'?'bg-slate-50 border-slate-300':'bg-slate-50 border-slate-200'}`}>
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5" style={{color:speed.color}}>
                    {phase === 'prompting'
                      ? <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"/>Listen &amp; speak along</>
                      : <>Preparing…</>}
                  </span>
                  {phase === 'prompting' && (
                    <span className="text-xs text-slate-400">{segPlayed} / {segments.length} phrases played</span>
                  )}
                </div>

                {/* Segment list */}
                <div className="px-4 pb-4 space-y-1.5">
                  {segments.map((seg, si) => {
                    const isActive  = si === segIdx && phase === 'prompting';
                    const isDone    = si < segPlayed && si !== segIdx;
                    const isPending = si > segIdx || phase === 'reading-question';
                    return (
                      <div key={si} className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                        isActive  ? 'text-white font-semibold shadow-md animate-pulse' :
                        isDone    ? 'bg-green-50 text-green-700 border border-green-100' :
                        isPending ? 'bg-white text-slate-300 border border-slate-100' :
                                    'bg-white text-slate-400'
                      }`} style={isActive ? { background: speed.color } : {}}>
                        {isActive && <span className="mr-1.5">🔊</span>}
                        {isDone   && <span className="mr-1.5 text-green-500">✓</span>}
                        {seg}
                      </div>
                    );
                  })}
                </div>

                {phase === 'reading-question' && (
                  <div className="px-4 pb-3 flex items-center gap-2 text-slate-400 text-xs">
                    <div className="w-4 h-4 rounded-full animate-pulse flex items-center justify-center shrink-0" style={{background:speed.color}}>
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
                    </div>
                    Answer playback begins after the question finishes…
                  </div>
                )}
              </div>

              {/* Live mic feed */}
              {phase === 'prompting' && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mic — your voice</div>
                  {useFallback
                    ? <textarea value={fallbackText} onChange={e=>setFallbackText(e.target.value)} placeholder="Type along as you hear each sentence…" className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400 resize-none" rows={3} autoFocus/>
                    : <div className="min-h-[44px] text-sm text-slate-700 leading-relaxed">{liveTranscript || <span className="text-slate-300 italic">Speak now…</span>}</div>
                  }
                </div>
              )}
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-3">
              {videoPanelJsx}
              <div className="p-3 rounded-xl border text-center" style={{background:`${speed.color}10`,borderColor:`${speed.color}30`}}>
                <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{color:speed.color}}>{speed.label}</div>
                <div className="text-xs text-slate-500">{speed.rate}× · {speed.pauseMs}ms pause</div>
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${phase==='prompting'?'bg-red-50 border-red-200':'bg-slate-50 border-slate-200'}`}>
                <div className={`w-3 h-3 rounded-full ${phase==='prompting'?'bg-red-500 animate-pulse':'bg-slate-300'}`}/>
                <span className={`text-xs font-bold ${phase==='prompting'?'text-red-600':'text-slate-400'}`}>
                  {phase==='prompting'?(useFallback?'Typing mode':'Microphone active'):'Mic standby'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEWING ── */}
      {phase === 'reviewing' && currentReview && (
        <div className="max-w-2xl">
          <Card>
            <div className="flex items-start gap-4 mb-5">
              <ScoreRing score={currentReview.score} size={80}/>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Question {qIdx+1} Result · {currentReview.category}</div>
                <div className="font-semibold text-slate-700 text-sm leading-relaxed">{currentReview.question}</div>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Model Answer</div>
                <div className="text-xs text-slate-600 leading-relaxed">{currentReview.modelAnswer}</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">What You Said</div>
                <div className="text-xs text-slate-600 leading-relaxed">{currentReview.spokenAnswer || <em className="text-slate-400">Nothing captured</em>}</div>
              </div>
              {currentReview.missedKeywords.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Key Terms to Practise</div>
                  <div className="flex flex-wrap gap-1">{currentReview.missedKeywords.map(k=><span key={k} className="text-xs bg-orange-100 text-orange-700 border border-orange-300 px-2 py-0.5 rounded-full">{k}</span>)}</div>
                </div>
              )}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 italic">💡 {currentReview.feedback}</div>
            </div>
            <div className="flex justify-end">
              <button onClick={nextQuestion} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                {qIdx+1>=sessionQs.length?'View Results →':'Next Question →'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === 'results' && (
        <div className="max-w-3xl">
          <Card>
            <div className="text-center mb-6">
              <ScoreRing score={overall} size={110}/>
              <div className="mt-4 text-xl font-bold text-slate-700">Session Complete</div>
              <div className="text-sm text-slate-500">{responses.length} questions · Grade {getGrade(overall)}</div>
            </div>
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Per-Question Scores</div>
              <div className="flex gap-1 items-end h-14">
                {responses.map((r,i)=>(
                  <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full rounded-t-sm" style={{height:`${Math.max(r.score,4)}%`,background:scoreCol(r.score),opacity:0.8}}/>
                    <div className="text-xs text-slate-400 mt-0.5 tabular-nums">{r.score}</div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">Q{i+1}: {r.score}%</div>
                  </div>
                ))}
              </div>
            </div>
            {(()=>{const {improvement,strong}=deriveFeedback(responses);return(
              <div className="grid grid-cols-2 gap-3 mb-5">
                {improvement.length>0 && <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg"><div className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">📈 Improve</div>{improvement.map(a=><div key={a} className="text-xs text-orange-700 mb-0.5">• {a}</div>)}</div>}
                {strong.length>0 && <div className="p-3 bg-green-50 border border-green-200 rounded-lg"><div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">💪 Strong</div>{strong.map(a=><div key={a} className="text-xs text-green-700 mb-0.5">• {a}</div>)}</div>}
              </div>
            );})()}
            {expressionReport && (
              <div className="mb-5 p-4 bg-slate-900 rounded-xl text-white">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">📷 Expression &amp; Composure Report</div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {[{l:'Calmness',v:expressionReport.calmScore},{l:'Engagement',v:expressionReport.engagementScore}].map(m=>(
                    <div key={m.l} className="text-center">
                      <div className="text-3xl font-black" style={{color:scoreCol(m.v)}}>{m.v}%</div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.l}</div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1"><div className="h-1.5 rounded-full" style={{width:`${m.v}%`,background:scoreCol(m.v)}}/></div>
                    </div>
                  ))}
                </div>
                {expressionReport.stressEvents>0 && <div className="text-xs text-red-400 mb-2">⚠️ {expressionReport.stressEvents} stress spike{expressionReport.stressEvents!==1?'s':''} detected</div>}
                <div className="space-y-1 mb-2">{expressionReport.feedback.map((f,i)=><div key={i} className="text-xs text-slate-300 flex items-start gap-1.5"><span className="text-slate-500 shrink-0">•</span><span>{f}</span></div>)}</div>
                <div className="p-2 bg-slate-800 rounded-lg text-xs text-blue-300 italic">💡 {expressionReport.recommendation}</div>
              </div>
            )}
            <div className="space-y-2 mb-5">
              {responses.map((r,i)=>(
                <div key={i} className={`p-3 rounded-lg border ${scoreBg(r.score)}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="text-xs font-semibold text-slate-700 flex-1">Q{i+1}: {r.question}</div>
                    <span className="text-sm font-black shrink-0" style={{color:scoreCol(r.score)}}>{r.score}%</span>
                  </div>
                  {r.missedKeywords.length>0 && <div className="mt-1 text-xs text-slate-500">Missed: {r.missedKeywords.map(k=><span key={k} className="inline-block bg-red-100 text-red-700 px-1.5 py-0.5 rounded mr-1 mb-0.5">{k}</span>)}</div>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={resetSession} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">🔄 Try Again</button>
              {isCandidate && <button onClick={()=>{resetSession();setView('history');}} className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">📋 View History</button>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
