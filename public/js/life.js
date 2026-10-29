/* ---------- research: what people actually use AI for ---------- */
const RESEARCH=[
 ['~70%','of ChatGPT messages are now non-work — personal tasks, questions and everyday decisions.','NBER Working Paper 34255 · “How People Use ChatGPT” (2025)','https://www.nber.org/papers/w34255'],
 ['~80%','of conversations fall into three buckets: practical guidance, seeking information, and writing.','NBER w34255 / OpenAI usage study (2025)','https://openai.com/index/how-people-are-using-chatgpt/'],
 ['49%','of U.S. adults now use AI chatbots — and about a quarter use them every day.','Pew Research Center (2026)','https://www.pewresearch.org/short-reads/2025/10/01/relatively-few-americans-are-getting-news-from-ai-chatbots-like-chatgpt/'],
 ['Top 5','“Organizing my life” and “finding purpose” entered the top five gen-AI use cases, behind support and companionship.','Harvard Business Review · Zao-Sanders (2025)','https://hbr.org/2025/04/how-people-are-really-using-gen-ai-in-2025'],
 ['#1','Coding remains the single most common task people bring to Claude.','Anthropic Economic Index (Jan 2026)','https://www.anthropic.com/news/anthropic-economic-index-january-2026-report']
];

/* ---------- life areas + guided playbooks ---------- */
const AREAS={home:['Home & Family','heart','#f472b6'],money:['Money','chart','#4ade80'],work:['Work & Career','folder','#4c8dff'],learn:['Learning','cap','#a78bfa'],
 travel:['Travel','globe','#22d3ee'],health:['Health & Habits','flame','#fb923c'],write:['Writing & Messages','pencil','#eab308'],plan:['Organizing','cal','#14b8a6'],
 shop:['Shopping','cart','#f97316'],create:['Creativity','sparkles','#c084fc'],admin:['Paperwork','file','#94a3b8']};
// steps: [tool, title, prompt, tip]. {{key}} = your details, {{prev}} = what the previous step returned
const PLAYBOOKS=[
 {id:'meals',t:'Weekly meal plan + grocery list',a:'home',min:45,d:'Seven dinners that fit your diet and budget, then one combined shopping list by aisle.',k:'food dinner cook recipe groceries shopping list diet eat',
  v:[['people','Who’s eating','2 adults, 1 kid'],['diet','Diet or allergies','vegetarian, no nuts'],['budget','Weekly food budget','$90'],['time','Cooking time per night','30 minutes']],
  s:[['ChatGPT','Plan the week','Plan 7 dinners for {{people}}. Constraints: {{diet}}. Budget about {{budget}} for the whole week, max {{time}} of cooking per night. Reuse ingredients across meals to cut cost and waste. Give a table: day, meal, prep time, key ingredients. Mark two meals that make good leftovers for lunch.','Ask for swaps if a meal doesn’t appeal — it keeps the rest of the plan intact.'],
   ['Claude','Build the grocery list','Here is my meal plan:\n{{prev}}\n\nTurn it into one grocery list grouped by store section (produce, dairy, protein, pantry, frozen). Combine duplicates with total quantities, flag staples I probably already have (oil, salt, spices) and estimate the total cost.',''],
   ['Todoist AI Assistant','Make it tickable','Convert this grocery list into a plain checklist, one item per line, quantity first:\n{{prev}}','Paste into Todoist, Apple Notes or Google Keep — each line becomes a checkbox.']]},
 {id:'budget',t:'Monthly budget from your bank statement',a:'money',min:60,d:'Categorize a month of spending, find realistic savings and get a budget sheet.',k:'money budget spending save savings bank expenses finance subscriptions',
  v:[['income','Monthly take-home income','$3,800'],['goal','Savings goal','save $400/month for a trip']],
  s:[['Claude','Categorize your spending','I’m attaching last month’s transactions (bank CSV/PDF export with account numbers removed). Categorize every transaction into: housing, utilities, groceries, eating out, transport, subscriptions, shopping, health, other. Give totals per category and each as a % of my {{income}} income.','Delete account numbers and names before uploading. Claude handles long files and tables well.'],
   ['ChatGPT','Find the savings','Based on these category totals:\n{{prev}}\n\nShow me realistic ways to {{goal}}. List subscriptions I may have forgotten, the 3 categories with the most room to cut, and a 50/30/20-style plan adjusted to my numbers, in specific dollar amounts.',''],
   ['Rows AI','Create the budget sheet','Create a monthly budget sheet with columns: category, planned, actual, difference. Use these planned amounts:\n{{prev}}\nAdd conditional formatting that highlights any category over budget.','Prefer Google Sheets or Excel? The same prompt works with Gemini or Copilot inside them.']]},
 {id:'trip',t:'Plan a trip, day by day',a:'travel',min:120,d:'Researched with sources, then a walkable itinerary with food stops and rain backups.',k:'travel trip vacation holiday itinerary flight hotel visit city weekend',
  v:[['dest','Destination','Lisbon'],['days','Number of days','4'],['budget','Budget style','mid-range, ~$150/day'],['likes','What you enjoy','food, viewpoints, slow mornings']],
  s:[['Perplexity','Research with sources','I’m visiting {{dest}} for {{days}} days on a {{budget}} budget. Using current sources: best neighborhoods to stay in, events or closures in the coming months, typical costs (transit, meals, attractions) and tourist traps to avoid. Cite your sources.','Perplexity links every claim, so you can verify opening hours and prices before you trust them.'],
   ['ChatGPT','Build the itinerary','Using this research:\n{{prev}}\n\nCreate a {{days}}-day itinerary for {{dest}} for someone who enjoys {{likes}}. Group sights by neighborhood to minimize travel, add one rain backup per day, realistic walking times, and lunch/dinner ideas in the {{budget}} range. Format as a day-by-day table.',''],
   ['Google Gemini','Map it and pack','Turn this itinerary into a list of places (name + neighborhood) I can save in Google Maps, plus a packing list for {{dest}} weather during my trip:\n{{prev}}','Gemini connects to Google Maps and Gmail, so bookings and places land in one spot.']]},
 {id:'inbox',t:'Clear your inbox in 20 minutes',a:'work',min:40,d:'Triage everything, draft replies in your voice, then stop the repeat offenders.',k:'email inbox reply gmail outlook messages work admin',
  v:[['emails','Paste your unread emails (or short summaries)','',1],['tone','Your tone','friendly and brief']],
  s:[['Claude','Triage','Here are my unread emails:\n{{emails}}\n\nSort them into: reply today, can wait, FYI only, unsubscribe. For each “reply today”, write one line on what’s being asked of me.','Remove passwords, codes and anything sensitive before pasting.'],
   ['Claude','Draft the replies','Draft replies for the “reply today” emails below in a {{tone}} tone. Keep each under 90 words, answer the actual question, and end with a clear next step.\n{{prev}}',''],
   ['Gemini for Google Workspace','Automate next time','Help me create Gmail filters so these recurring email types skip my inbox:\n{{prev}}','On Outlook? Microsoft 365 Copilot does the same inside Outlook.']]},
 {id:'job',t:'Job application kit',a:'work',min:90,d:'Tailored resume bullets, a cover letter that isn’t generic, and interview practice.',k:'job resume cv cover letter interview career apply hiring',
  v:[['role','Job title','Product Designer'],['posting','Paste the job posting','',1],['resume','Paste your resume','',1]],
  s:[['Claude','Tailor your resume','Job posting:\n{{posting}}\n\nMy resume:\n{{resume}}\n\nRewrite my bullet points to match what this {{role}} role asks for, using their keywords only where they are true for me. Do not invent experience. Show before/after for each changed bullet, and list any requirement I don’t clearly meet.','Claude is strong at careful rewriting that stays faithful to the source.'],
   ['ChatGPT','Write the cover letter','Write a 220-word cover letter for the {{role}} role using these tailored points:\n{{prev}}\nOpen with why this company specifically, include one concrete achievement with a number, and avoid clichés like “I am writing to apply”.',''],
   ['Final Round AI','Practice the interview','Act as the hiring manager for this {{role}} role:\n{{posting}}\nAsk me 6 interview questions one at a time (2 behavioral, 2 role-specific, 1 curveball, 1 about salary). After each answer, score it 1–5 and show me how to tighten it with the STAR method.','ChatGPT’s voice mode works well for spoken practice too.'],
   ['Teal','Track the application','Summarize this application in one line for my job tracker: company, role, date applied, contact, and a follow-up date one week from today.','']]},
 {id:'learn',t:'Learn any skill in 30 days',a:'learn',min:60,d:'An 80/20 plan, explanations grounded in trusted sources, and flashcards to make it stick.',k:'learn skill course study practice teach beginner tutorial language',
  v:[['skill','Skill','Excel pivot tables'],['level','Current level','total beginner'],['time','Time per day','20 minutes']],
  s:[['Claude','Make the plan','Create a 30-day learning plan for {{skill}}. I’m a {{level}} with {{time}} per day. Week by week: what to learn, one small project per week, and how I’ll know I’ve got it. Prioritize the 20% of the skill that gives 80% of the results.',''],
   ['NotebookLM','Learn from trusted sources','(First add 3–5 good sources: official docs, a course PDF, video transcripts.) Using only these sources, explain week 1 of this plan in simple terms with examples:\n{{prev}}','NotebookLM answers only from the sources you add and links each claim back to them.'],
   ['Quizlet AI','Lock it in','Make 20 flashcards (term → simple definition + example) for this week’s material:\n{{prev}}','']]},
 {id:'doc',t:'Understand a confusing document',a:'admin',min:30,d:'Leases, bills, policies, contracts — plain English, key numbers and the questions to ask.',k:'contract lease bill policy insurance document legal letter terms understand explain',
  v:[['doc','Paste the document (or the confusing part)','',1],['concern','What worries you most','early termination fees']],
  s:[['Claude','Explain it in plain English','Explain this document in plain English, like I’m smart but not a lawyer:\n{{doc}}\n\nSummarize what I’m agreeing to, all money involved (amounts, dates, penalties), my rights, and anything unusual. Pay special attention to: {{concern}}. Quote the exact clause for anything important.','For understanding only — not legal or financial advice. For big decisions, check with a professional.'],
   ['ChatGPT','Get your questions ready','Based on this summary:\n{{prev}}\nWrite the 5 questions I should ask before signing, and a polite email asking for clarification on the most important one.','']]},
 {id:'study',t:'Study for an exam',a:'learn',min:90,d:'A study guide from your own notes, a spaced-repetition schedule and a practice quiz.',k:'exam test study revise school university notes quiz grades',
  v:[['subject','Subject','Biology 101'],['date','Exam date','next Friday'],['notes','Paste notes or topic list','',1]],
  s:[['NotebookLM','Build a study guide','(Add your lecture notes and slides as sources.) Create a study guide for {{subject}}: key concepts, definitions, and the 10 most likely exam questions. Topics: {{notes}}','Answers stay grounded in your own material, with citations.'],
   ['Claude','Schedule the revision','Make a day-by-day revision schedule until {{date}} for these topics, using spaced repetition (revisit each topic 1, 3 and 7 days after first studying it):\n{{prev}}',''],
   ['Gizmo','Practice quiz','Turn this study guide into a 25-question practice quiz with answers at the end:\n{{prev}}','']]},
 {id:'day',t:'Plan your day in 5 minutes',a:'plan',min:25,d:'Dump everything on your mind; get your top three, time blocks and what to drop.',k:'plan day schedule todo tasks priorities focus organize calendar productivity overwhelmed',
  v:[['tasks','Everything on your mind','',1],['hours','Available hours','9–6, meeting 2–3pm'],['energy','When you focus best','mornings']],
  s:[['Claude','Prioritize and time-block','Here’s everything on my plate:\n{{tasks}}\n\nI’m available {{hours}} and focus best in the {{energy}}. Pick my top 3 for today, schedule them as time blocks (hardest work in my focus window), batch small tasks, and tell me what to postpone or drop. Output a timeline.',''],
   ['Motion','Put it on the calendar','Convert this schedule into calendar events (title, start, end) in a simple list I can paste:\n{{prev}}','Motion and Reclaim can auto-schedule tasks and reshuffle them when meetings move.']]},
 {id:'msg',t:'Write a difficult message',a:'write',min:20,d:'Three tones to choose from — warm, neutral or firm — with a clear ask.',k:'message email text apology complaint landlord boss difficult write letter',
  v:[['who','Who it’s for','my landlord'],['situation','What happened','the heater has been broken for 10 days',1],['goal','What you want','get it fixed this week']],
  s:[['Claude','Draft three tones','Help me write a message to {{who}}. Situation: {{situation}}. My goal: {{goal}}. Write 3 versions: warm, neutral-professional, and firm. Each under 150 words, no passive-aggressive phrasing, a clear ask with a date.',''],
   ['Grammarly','Check the tone','Check this message for tone and clarity and suggest only minimal edits:\n{{prev}}','Grammarly’s tone detector tells you if it reads as confident, friendly or sharp.']]},
 {id:'fit',t:'A workout & habit plan you’ll keep',a:'health',min:40,d:'A 4-week beginner plan plus three tiny daily habits and a printable tracker.',k:'fitness workout exercise gym health habit weight sleep run',
  v:[['goal','Your goal','more energy, lose 5 kg'],['days','Days per week','3'],['equip','Equipment','none, at home']],
  s:[['ChatGPT','Get a 4-week plan','Create a 4-week beginner plan to reach: {{goal}}. {{days}} sessions per week, equipment: {{equip}}, 30 minutes max. Include warm-up, exercises with sets/reps, how to progress each week, and easy substitutes if something hurts.','General fitness info, not medical advice — check with a doctor if you have a condition.'],
   ['Claude','Turn it into habits','Turn this plan into 3 tiny daily habits (sleep, water, steps) with a simple weekly tracking table I can print, plus an “if I miss a day” rule:\n{{prev}}','']]},
 {id:'diy',t:'Fix something at home',a:'home',min:45,d:'Snap a photo, get likely causes, a safe step-by-step fix — and when to call a pro.',k:'fix repair home diy broken leak sink house appliance',
  v:[['problem','What’s wrong','kitchen sink drains slowly']],
  s:[['ChatGPT','Diagnose from a photo','(Attach a photo.) Problem: {{problem}}. Rank the most likely causes, give a safe step-by-step fix for a beginner, list the tools/parts needed, and tell me the clear signs I should call a professional instead.','ChatGPT and Gemini can both read photos — snap the problem area up close.'],
   ['Perplexity','Find the right part','Find the right replacement part or tool for this fix and compare 3 options with price and where to buy, with sources:\n{{prev}}','']]},
 {id:'homework',t:'Homework help that teaches',a:'home',min:30,d:'Hints and questions instead of answers, plus practice problems at the right level.',k:'homework kids child school math help parent tutor',
  v:[['grade','Grade','5th'],['topic','Topic or problem','dividing fractions']],
  s:[['Khanmigo','Guide, don’t solve','My {{grade}} grader is stuck on: {{topic}}. Guide them with hints and questions, one step at a time — don’t give the final answer.','Khanmigo is designed to tutor Socratically rather than hand over answers.'],
   ['Claude','Explain and practice','Explain {{topic}} for a {{grade}} grader using an everyday analogy, then give 3 practice problems of rising difficulty with answers hidden at the end.','']]},
 {id:'side',t:'Validate a side-business idea',a:'money',min:180,d:'Market research with sources, a one-page plan, a landing page and a logo.',k:'business startup side hustle idea entrepreneur launch customers sell',
  v:[['idea','Your idea','custom pet portraits'],['customer','Who it’s for','pet owners who love gifts'],['budget','Starting budget','$300']],
  s:[['Perplexity','Research the market','Research the market for: {{idea}}, aimed at {{customer}}. Find competitors, their prices, and what customers complain about in reviews. Cite sources.',''],
   ['Claude','Write a one-page plan','Using this research:\n{{prev}}\n\nWrite a one-page plan: problem, customer, offer, price, how I’ll get my first 10 customers with a {{budget}} budget, and the biggest risk plus how to test it this week.',''],
   ['Durable','Launch a landing page','Create a simple landing page with a waitlist signup for this offer:\n{{prev}}',''],
   ['Canva Magic Studio','Logo and launch posts','Generate a simple logo and 3 social post graphics for: {{idea}}.','']]},
 {id:'social',t:'A week of social posts for your business',a:'work',min:120,d:'Seven posts with hooks and hashtags, matching visuals, scheduled at the right times.',k:'social media instagram posts marketing small business content captions',
  v:[['biz','Your business','neighborhood bakery'],['platform','Platform','Instagram'],['promo','This week’s focus','new sourdough + weekend offer']],
  s:[['Claude','Write the posts','Write 7 {{platform}} posts for {{biz}}. This week’s focus: {{promo}}. Mix: 2 behind-the-scenes, 2 product, 1 customer story, 1 tip, 1 offer. Each with a hook first line, a caption under 80 words, and 5 relevant hashtags.',''],
   ['Canva Magic Studio','Make the visuals','Create matching visuals for each of these posts:\n{{prev}}',''],
   ['Buffer AI Assistant','Schedule them','Schedule these posts at the best times and adapt each caption for one more channel:\n{{prev}}','']]},
 {id:'deck',t:'Make a presentation in 15 minutes',a:'work',min:90,d:'Conclusion-first outline with speaker notes, turned into designed slides.',k:'presentation slides deck powerpoint talk pitch meeting',
  v:[['topic','Topic','Q3 results'],['audience','Audience','leadership team'],['minutes','Talk length','10 minutes']],
  s:[['Claude','Outline the story','Outline a {{minutes}} presentation on {{topic}} for {{audience}}: one idea per slide, slide title + 3 bullets + speaker notes. Start with the conclusion and end with a clear ask.',''],
   ['Gamma','Generate the slides','Generate a presentation from this outline:\n{{prev}}','Gamma turns text into designed slides and exports to PowerPoint or PDF.']]},
 {id:'meeting',t:'Never write meeting notes again',a:'work',min:30,d:'Transcript to decisions, owners and dates, then a follow-up email.',k:'meeting notes transcript minutes action items zoom call',
  v:[['meeting','Meeting name','Weekly team sync']],
  s:[['Otter.ai','Transcribe and summarize','Summarize this {{meeting}} transcript: decisions made, open questions, and action items with owner and due date.','Let attendees know you’re recording.'],
   ['Claude','Send the follow-up','Turn these action items into a short follow-up email to attendees:\n{{prev}}','']]},
 {id:'buy',t:'Make a smart buying decision',a:'shop',min:60,d:'Recent reviews compared with sources, then one clear recommendation.',k:'buy shopping compare product review best purchase deal',
  v:[['item','What you’re buying','robot vacuum'],['budget','Budget','$400'],['needs','Must-haves','handles pet hair, quiet']],
  s:[['Perplexity','Compare with sources','Compare the best {{item}} options under {{budget}} for: {{needs}}. Use recent reviews and tests, list pros/cons and common complaints, and cite sources.',''],
   ['ChatGPT','Get one recommendation','From this comparison:\n{{prev}}\nRecommend one option, explain the trade-off versus the runner-up, and tell me what to check in the return policy.','']]},
 {id:'event',t:'Plan a party or event',a:'home',min:90,d:'Theme, timeline, food quantities, activities and a two-week prep checklist.',k:'party event birthday wedding celebration plan guests',
  v:[['event','Event','8-year-old’s birthday'],['guests','Guests','15'],['budget','Budget','$250'],['date','Date','Saturday the 14th']],
  s:[['ChatGPT','Plan it','Plan {{event}} for {{guests}} guests on {{date}} with a {{budget}} budget: theme ideas, timeline of the day, food list with quantities, activities, and a 2-week prep checklist.',''],
   ['Canva Magic Studio','Design the invite','Design an invitation for {{event}} on {{date}}.','']]},
 {id:'memories',t:'Turn photos into a memory video',a:'create',min:60,d:'A story arc with captions, auto-edited clips and an original soundtrack.',k:'video photos memories montage music family trip wedding',
  v:[['occasion','Occasion','summer trip'],['mood','Mood','nostalgic and warm']],
  s:[['Claude','Write the story','Write a short story arc and on-screen captions for a 60-second {{occasion}} video with a {{mood}} mood: 8 scenes, one caption per scene under 8 words.',''],
   ['CapCut AI','Edit the video','Import your photos, use auto-cut, and add these captions:\n{{prev}}',''],
   ['Suno','Make the soundtrack','Generate a 60-second instrumental track: {{mood}}, for a {{occasion}} montage.','']]}
];
const PBX=Object.fromEntries(PLAYBOOKS.map(p=>[p.id,p]));
function searchPlaybooks(v,n=4){
  const toks=v.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);if(!toks.length)return[];
  return PLAYBOOKS.map(p=>{const hay=(p.t+' '+p.d+' '+p.k+' '+AREAS[p.a][0]).toLowerCase();let s=0;for(const w of toks){if(p.k.includes(w))s+=4;else if(hay.includes(w))s+=2;else if(w.length>4&&hay.includes(w.slice(0,-1)))s+=1}return[s,p]})
    .filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,n).map(x=>x[1]);
}

/* ---------- tool insights (researched, mid-2026) ---------- */
const SRC={bench:['BenchLM · SWE-bench Verified (Jul 2026)','https://benchlm.ai/benchmarks/swe-bench-verified'],aei:['Anthropic Economic Index (Jan 2026)','https://www.anthropic.com/news/anthropic-economic-index-january-2026-report'],
 nber:['NBER w34255 · How People Use ChatGPT','https://www.nber.org/papers/w34255'],dr:['Deep research compared (TWiT, 2026)','https://twit.tv/posts/tech/chatgpt-vs-gemini-vs-claude-vs-perplexity-which-ai-does-deep-research-best-2026'],
 dr2:['Perplexity vs ChatGPT vs Claude (Dupple, 2026)','https://dupple.com/blog/perplexity-vs-chatgpt-vs-claude'],img:['Best AI image generators 2026 (Dupple)','https://dupple.com/learn/best-ai-image-generators'],
 img2:['Best image generator (getimg.ai, 2026)','https://getimg.ai/blog/best-image-generator'],vid:['Best AI video generators 2026 (MASV)','https://massive.io/gear-guides/the-best-ai-video-generator-comparison/'],
 vid2:['Sora, Veo, Kling, Runway compared (Upsampler)','https://upsampler.com/blog/best-ai-video-generators-sora-veo-kling-runway-2026'],sora:['Sora alternatives after shutdown (Piktochart)','https://piktochart.com/blog/best-sora-alternatives/'],
 gem:['Perplexity vs Gemini (Fast.io, 2026)','https://fast.io/resources/perplexity-vs-gemini-comparison-2026/']};
const off=(n,u)=>[`${n} (official)`,u];
const INSIGHTS={
 'Claude':{s:'The builder’s pick: strongest at coding, long documents and careful writing. Claude models topped the SWE-bench Verified coding leaderboard in mid-2026, and Claude Code works as an agent in your terminal.',best:['Coding & refactoring','Long documents & analysis','Careful, faithful writing'],watch:'For broad multi-source web research, Perplexity (inline citations) and ChatGPT’s deep research are more often rated ahead; ChatGPT also bundles image generation and voice.',vs:[['ChatGPT','all-in-one app with images, voice and deep research'],['Perplexity','fast answers with sources you can check']],src:[SRC.bench,SRC.aei,SRC.dr]},
 'ChatGPT':{s:'The all-rounder with the biggest reach — about 10% of the world’s adults by mid-2025 — and the widest toolset: deep research, image generation, voice, file analysis and custom GPTs. Reviewers often rank its deep research near the top for broad, structured reports.',best:['Research reports','Everyday questions & decisions','Images + voice in one app'],watch:'For large codebases and long-running coding agents, Claude is generally preferred; for quick answers you can verify, Perplexity’s inline citations are faster to check.',vs:[['Claude','coding and long-document work'],['Perplexity','cited, current answers']],src:[SRC.nber,SRC.dr,SRC.dr2]},
 'Perplexity':{s:'An answer engine built around citations — every answer links its sources. Most 2026 comparisons rate it the strongest for sourced web research and current events.',best:['Fact-finding with sources','Current events & prices','Product comparisons'],watch:'Less suited to long creative writing or building software than Claude or ChatGPT. Citations make claims checkable, not automatically correct.',vs:[['ChatGPT','longer structured reports'],['Claude','analysis of documents you upload']],src:[SRC.dr2,SRC.dr,SRC.gem]},
 'Google Gemini':{s:'Wired into Google — Search, Gmail, Docs, Maps and YouTube — and praised for speed and fresh news coverage. Google’s Nano Banana image model is a top pick for editing photos.',best:['Google Workspace tasks','Fast, current answers','Image editing'],watch:'ChatGPT and Claude are more often preferred for long-form writing and coding.',vs:[['Perplexity','research with inline citations'],['ChatGPT','broadest feature set']],src:[SRC.gem,SRC.img,SRC.dr]},
 'Microsoft Copilot':{s:'Free AI assistant built into Windows and Edge, backed by OpenAI models with web results.',best:['Quick help on Windows','Web-grounded answers'],watch:'For work files, Microsoft 365 Copilot (paid) is the one that reads your Word, Excel and Outlook content.',vs:[['ChatGPT','more features in one app']],src:[off('Microsoft Copilot','https://copilot.microsoft.com')]},
 'Microsoft 365 Copilot':{s:'The pick if your life runs on Word, Excel, Outlook and Teams — it works directly on your own files, email and meetings.',best:['Email in Outlook','Excel analysis','Teams meeting recaps'],watch:'Outside the Microsoft ecosystem, standalone assistants like ChatGPT or Claude are more flexible.',vs:[['Gemini for Google Workspace','the same idea for Gmail and Docs']],src:[off('Microsoft 365 Copilot','https://microsoft.com/microsoft-365/copilot')]},
 'Gemini for Google Workspace':{s:'AI inside Gmail, Docs, Sheets and Meet — drafts, summaries and analysis on your own Google files.',best:['Gmail triage','Docs drafting','Sheets help'],watch:'Most useful if you already work in Google Workspace.',vs:[['Microsoft 365 Copilot','Outlook, Word and Excel']],src:[off('Google Workspace','https://workspace.google.com/solutions/ai')]},
 'Midjourney':{s:'The aesthetics specialist — still the go-to for striking, stylized images and concept art.',best:['Concept art','Moodboards','Stylized imagery'],watch:'Weaker at legible text inside images than GPT Image or Ideogram; less precise for editing than Google’s Nano Banana.',vs:[['Ideogram','posters and text in images'],['Adobe Firefly','commercially safe assets']],src:[SRC.img,SRC.img2]},
 'Ideogram':{s:'Built for images that include readable text — posters, ads, logos.',best:['Posters & ads','Logos with words'],watch:'Big-lab models (GPT Image, Nano Banana) have largely caught up on text rendering — worth comparing.',vs:[['Midjourney','pure aesthetics']],src:[SRC.img,SRC.img2]},
 'Adobe Firefly':{s:'The commercially safer choice, integrated across Photoshop and Express.',best:['Commercial work','Editing in Photoshop'],watch:'Reviewers say you pay partly for licensing peace of mind rather than best-looking output.',vs:[['Midjourney','more striking aesthetics']],src:[SRC.img]},
 'Runway':{s:'Editing-led AI video with the strongest creative controls and lip sync (Gen-4.5).',best:['Editing & control','Lip sync','Filmmaking workflows'],watch:'Google Veo is often rated higher on raw quality with native audio; Kling is cheaper per clip.',vs:[['Google Veo','top cinematic quality with audio'],['Kling AI','best value']],src:[SRC.vid,SRC.vid2]},
 'Google Veo':{s:'Frequently rated the best overall AI video generator in 2026, with synchronized native audio.',best:['Cinematic quality','Native audio'],watch:'Runway offers more editing control; Kling is the budget option.',vs:[['Runway','editing control'],['Kling AI','value']],src:[SRC.vid,SRC.vid2]},
 'Kling AI':{s:'The value pick — strong quality per dollar, 4K without an enterprise plan and long clips.',best:['Value','Longer clips'],watch:'Veo and Runway lead on top-end quality and control.',vs:[['Google Veo','top quality'],['Runway','editing control']],src:[SRC.vid,SRC.vid2]},
 'Sora':{s:'OpenAI’s video model. Several 2026 sources report the standalone Sora app and API being discontinued — check availability before relying on it.',best:['Cinematic text-to-video'],watch:'Google Veo, Runway and Kling are the commonly recommended alternatives.',vs:[['Google Veo','actively developed alternative']],src:[SRC.sora,SRC.vid2]},
 'ElevenLabs':{s:'The reference point for natural-sounding AI voices, voice cloning and multilingual dubbing.',best:['Voiceovers','Dubbing','Voice agents'],watch:'Murf and WellSaid target corporate narration with simpler team workflows.',vs:[['Murf AI','business voiceovers']],src:[off('ElevenLabs','https://elevenlabs.io')]},
 'Cursor':{s:'AI-native code editor with full-repo context — fast, in-editor multi-file edits.',best:['In-editor edits','Large refactors'],watch:'Claude Code is preferred for terminal-based agentic work; GitHub Copilot fits teams already in GitHub.',vs:[['Claude Code','terminal agent'],['GitHub Copilot','works in existing IDEs']],src:[off('Cursor','https://cursor.com'),SRC.bench]},
 'Claude Code':{s:'Agentic coding in your terminal: reads the repo, edits files, runs tests and commands — powered by the models that led SWE-bench Verified in 2026.',best:['Multi-step coding tasks','Refactors & debugging'],watch:'Prefer an IDE-first experience? Cursor or GitHub Copilot.',vs:[['Cursor','editor-first'],['GitHub Copilot','IDE + GitHub integration']],src:[SRC.bench,SRC.aei]},
 'GitHub Copilot':{s:'Works inside the editor you already use and inside GitHub itself — completions, chat, PR reviews and agents.',best:['Everyday completion','PR reviews'],watch:'Cursor and Claude Code are stronger for large autonomous changes.',vs:[['Cursor','AI-native editor']],src:[off('GitHub Copilot','https://github.com/features/copilot')]},
 'Notion AI':{s:'AI that knows your workspace — search, summarize and write across your own notes and databases.',best:['Workspace Q&A','Meeting notes','Docs'],watch:'Only as good as what’s in your Notion.',vs:[['Mem','auto-organized personal notes']],src:[off('Notion AI','https://notion.so/product/ai')]},
 'NotebookLM':{s:'Answers only from sources you upload, with citations back to each — the most trustworthy way to study or research a fixed set of documents.',best:['Studying','Research you can trust','Audio overviews'],watch:'It won’t search the open web — use Perplexity for that.',vs:[['Perplexity','open-web research']],src:[off('NotebookLM','https://notebooklm.google.com')]},
 'Gamma':{s:'The fastest prompt-to-deck tool: designed, web-native slides from an outline, exportable to PowerPoint.',best:['Quick decks','Docs & one-pagers'],watch:'For brand-locked corporate decks, Plus AI works inside PowerPoint/Slides.',vs:[['Beautiful.ai','layout rules']],src:[off('Gamma','https://gamma.app')]},
 'Canva Magic Studio':{s:'AI inside the design tool most people already know — templates, generation and brand kits in one place.',best:['Social graphics','Invites & flyers'],watch:'Midjourney leads on pure image aesthetics.',vs:[['Adobe Express AI','Adobe ecosystem']],src:[off('Canva','https://canva.com')]},
 'Grammarly':{s:'Real-time writing polish in nearly every app you type in, with tone detection.',best:['Email polish','Tone checks'],watch:'For rewriting whole drafts, Claude or ChatGPT go further.',vs:[['Wordtune','sentence rewrites']],src:[off('Grammarly','https://grammarly.com')]},
 'Otter.ai':{s:'Reliable general-purpose meeting transcription with summaries and action items.',best:['Meeting notes','Searchable transcripts'],watch:'Granola writes nicer notes without a bot joining the call.',vs:[['Granola','bot-free notes'],['Fireflies.ai','CRM integrations']],src:[off('Otter.ai','https://otter.ai')]},
 'Suno':{s:'Complete songs with vocals from a prompt — the fastest way to a finished track.',best:['Full songs','Soundtracks'],watch:'Udio offers finer control when shaping a song.',vs:[['Udio','detailed iteration']],src:[off('Suno','https://suno.com')]},
 'Lovable':{s:'Prompt to a working full-stack web app you can edit and deploy.',best:['MVPs','Internal tools'],watch:'For production codebases, an IDE agent like Cursor or Claude Code gives more control.',vs:[['Bolt.new','in-browser dev'],['v0','React UI generation']],src:[off('Lovable','https://lovable.dev')]},
 'Khanmigo':{s:'A tutor that guides with questions instead of handing over answers — built by Khan Academy.',best:['Homework help','Teacher planning'],watch:'Photomath is quicker for checking math steps.',vs:[['Photomath','math step checks']],src:[off('Khan Academy','https://khanacademy.org/khan-labs')]},
 'Motion':{s:'Auto-schedules your tasks into your calendar and reshuffles them when plans change.',best:['Time blocking','Busy calendars'],watch:'Reclaim AI is lighter and focuses on protecting habits and focus time.',vs:[['Reclaim AI','focus time & habits']],src:[off('Motion','https://usemotion.com')]}
};
function insightFor(t){
  const ins=INSIGHTS[t.n];if(ins)return{...ins,curated:true};
  const peers=ALL.filter(x=>x.ci===t.ci&&x.id!==t.id).sort((a,b)=>a.rank-b.rank).slice(0,2);
  return{s:`A ${CATS[t.ci].short.toLowerCase()} tool focused on ${t.best.toLowerCase()}. ${t.desc}`,best:[t.best],watch:`Compare with ${peers.map(p=>p.n).join(' and ')} — the most established tools in ${CATS[t.ci].short}.`,vs:peers.map(p=>[p.n,p.best.toLowerCase()]),src:[[`${t.n} (official site)`,'https://'+t.url]]};
}
const shortWhy=t=>{const i=INSIGHTS[t.n];return i?i.s.split(/(?<=\.)\s/)[0]:`Best at: ${t.best.toLowerCase()}.`};

/* ---------- prompt templating ---------- */
const DEEP={'ChatGPT':q=>'https://chatgpt.com/?q='+encodeURIComponent(q),'Claude':q=>'https://claude.ai/new?q='+encodeURIComponent(q),'Perplexity':q=>'https://www.perplexity.ai/search?q='+encodeURIComponent(q)};
function fillPrompt(p,vars,labels,prev,prevN){
  const plain=p.replace(/\{\{(\w+)\}\}/g,(m,k)=>k==='prev'?(prev||`[paste the result of step ${prevN}]`):(vars[k]?.trim()||`[${labels[k]||k}]`));
  const html=esc(p).replace(/\{\{(\w+)\}\}/g,(m,k)=>{if(k==='prev')return prev?`<b class="fv">${esc(prev.length>220?prev.slice(0,220)+'…':prev)}</b>`:`<mark>paste result of step ${prevN}</mark>`;const v=vars[k]?.trim();return v?`<b class="fv">${esc(v)}</b>`:`<mark>${esc(labels[k]||k)}</mark>`});
  return{plain,html};
}
async function copyText(t){try{await navigator.clipboard.writeText(t)}catch{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}}

/* ---------- guided runner ---------- */
S.d.runs=S.d.runs||{};
function runSource(key){
  if(key.startsWith('pb:')){const p=PBX[key.slice(3)];return{key,title:p.t,desc:p.d,area:p.a,min:p.min,vars:p.v,steps:p.s.map(([tool,title,prompt,tip])=>({tool,title,prompt,tip}))}}
  const steps=wf.s.map(k=>{const L=stepOf(k);return{tool:L.tool,title:L.t,prompt:L.prompt||'Help me with this task: {{input}}\n\nContext from the previous step:\n{{prev}}',tip:'',par:!!L.par}});
  return{key,title:wf.n,desc:wf.d,area:'work',min:steps.length*12,vars:[['input','Your task or topic',wf.input||'describe what you want to get done',1]],steps};
}
function openRunner(key){
  const src=runSource(key),st=S.d.runs[key]=S.d.runs[key]||{v:{},done:[],notes:[],swap:{}};
  if(key.startsWith('wf:')&&wf.input&&!st.v.input)st.v.input=wf.input;
  const labels=Object.fromEntries(src.vars.map(v=>[v[0],v[1]]));
  // {{prev}} is everything the previous stage produced; parallel steps share the same input
  const stg=stagesOf(src.steps),stageOf=i=>stg.findIndex(g=>g.includes(i)),prevIdx=i=>{const k=stageOf(i);return k>0?stg[k-1]:[]};
  const prevText=i=>{const P=prevIdx(i).filter(j=>st.notes[j]);return P.length>1?P.map(j=>`Step ${j+1}:\n${st.notes[j]}`).join('\n\n'):P.length?st.notes[P[0]]:''};
  const prevLabel=i=>prevIdx(i).map(j=>j+1).join(' & ')||i;
  $('#modal').classList.add('wide');
  openModal(`<div class="run">
    <div class="run-h"><div><div class="eyebrow">Guided run · ${esc(AREAS[src.area][0])}</div><h2 class="modal-h">${esc(src.title)}</h2><p class="muted-sm">${esc(src.desc)}</p></div><button class="dr-x static" data-close aria-label="Close">${ic('x',18)}</button></div>
    <div class="run-grid">
      <aside class="run-side">
        <div class="res-h" style="padding-left:0">Your details</div>
        ${src.vars.map(([k,l,ph,ml])=>`<label class="fld"><span>${esc(l)}</span>${ml?`<textarea data-var="${k}" rows="4" placeholder="${esc(ph||'Paste here…')}">${esc(st.v[k]||'')}</textarea>`:`<input data-var="${k}" value="${esc(st.v[k]||'')}" placeholder="${esc(ph)}">`}</label>`).join('')}
        <div class="run-prog"><div class="card-h" style="margin:0"><b id="runCount"></b><span class="muted-sm">est. ~${src.min} min saved</span></div><div class="bar-track"><i id="runBar"></i></div></div>
        <div class="run-acts">
          <button class="btn sm" id="runExport">${ic('file',14)} Export checklist</button>
          <button class="btn sm ghost" id="runTasks">${ic('folder',14)} Add to Projects</button>
          ${key.startsWith('pb:')?`<button class="btn sm ghost" id="runWf">${ic('flow',14)} Edit as workflow</button>`:''}
          <button class="btn sm ghost" id="runReset">${ic('trash',14)} Reset</button>
        </div>
        <p class="muted-sm tiny">Prompts update as you type. Paste each tool’s answer into the step’s notes and the next prompt picks it up automatically.</p>
      </aside>
      <div class="run-steps" id="runSteps"></div>
    </div></div>`);
  const draw=()=>{
    $('#runSteps').innerHTML=src.steps.map((s,i)=>{
      const tn=st.swap[i]||s.tool,t=byName(tn)||monoFor(tn),prev=prevText(i),f=fillPrompt(s.prompt,st.v,labels,prev,prevLabel(i)),done=st.done.includes(i);
      const alts=t.ci!=null?ALL.filter(x=>x.ci===t.ci).sort((a,b)=>a.rank-b.rank).slice(0,8):[];
      const open=DEEP[tn]?DEEP[tn](f.plain):t.url?'https://'+t.url:'#';
      return`<div class="rstep glass ${done?'done':''}" data-step="${i}">
        <div class="rs-h"><button class="rs-check" data-tick="${i}" aria-label="Mark step ${i+1} done">${ic('check',14)}</button><div class="rs-t"><em>Step ${i+1}${s.par?' · runs in parallel':''}</em><h4>${esc(s.title)}</h4></div>
          <div class="rs-tool" ${t.id!=null?`data-open="${t.id}"`:''}>${logoHTML(t,30)}<div class="res-t">${esc(tn)}<em>${t.c||''}</em></div></div></div>
        <p class="rs-why">${ic('sparkle',13)} ${esc(t.id!=null?shortWhy(t):'')}</p>
        <div class="rs-prompt"><div class="rs-ph"><span>Prompt</span>${alts.length>1?`<select data-swap="${i}" aria-label="Swap tool">${alts.map(a=>`<option ${a.n===tn?'selected':''}>${esc(a.n)}</option>`).join('')}</select>`:''}</div><pre>${f.html}</pre></div>
        <div class="rs-acts"><button class="btn sm solid" data-copy="${i}">${ic('layers',14)} Copy prompt</button><a class="btn sm" href="${open}" target="_blank" rel="noopener" data-openstep="${i}">${DEEP[tn]?'Open in '+esc(tn)+' with prompt':'Open '+esc(tn)} ${ic('ext',13)}</a></div>
        ${s.tip?`<p class="rs-tip">${ic('target',13)} ${esc(s.tip)}</p>`:''}
        <textarea class="rs-notes" data-note-i="${i}" rows="2" placeholder="Paste what ${esc(tn)} gave you (optional) — it feeds step ${i+2>src.steps.length?'your export':i+2}.">${esc(st.notes[i]||'')}</textarea>
      </div>`}).join('');
    const n=st.done.length;$('#runCount').textContent=`${n} of ${src.steps.length} steps done`;$('#runBar').style.width=n/src.steps.length*100+'%';
  };
  const box=$('#modalBody');
  box.oninput=e=>{const v=e.target.closest('[data-var]'),nt=e.target.closest('[data-note-i]');
    if(v){st.v[v.dataset.var]=v.value;S.save();clearTimeout(box._t);box._t=setTimeout(()=>{const a=document.activeElement;draw();a&&a.focus&&a.focus()},250)}
    if(nt){const c=+nt.dataset.noteI;st.notes[c]=nt.value;S.save();clearTimeout(box._n);box._n=setTimeout(()=>src.steps.forEach((s,i)=>{if(!prevIdx(i).includes(c))return;const pre=$(`[data-step="${i}"] pre`);if(pre)pre.innerHTML=fillPrompt(s.prompt,st.v,labels,prevText(i),prevLabel(i)).html}),300)}};
  box.onchange=e=>{const sw=e.target.closest('[data-swap]');if(sw){st.swap[+sw.dataset.swap]=sw.value;S.save();draw()}};
  box.onclick=async e=>{
    const tk=e.target.closest('[data-tick]'),cp=e.target.closest('[data-copy]'),os=e.target.closest('[data-openstep]');
    if(tk){const i=+tk.dataset.tick,was=st.done.includes(i);st.done=was?st.done.filter(x=>x!==i):[...st.done,i];
      if(!was){const tn=st.swap[i]||src.steps[i].tool;S.d.toolUse=S.d.toolUse||{};S.d.toolUse[tn]=(S.d.toolUse[tn]||0)+1;track('g',byName(tn)?.ci,Math.round(src.min/src.steps.length))}
      S.save();draw();if(st.done.length===src.steps.length){toast(`All done — you just saved ~${src.min} minutes`,'check');log(`Finished “${src.title}”`,'check')}}
    if(cp){const i=+cp.dataset.copy,s=src.steps[i];await copyText(fillPrompt(s.prompt,st.v,labels,prevText(i),prevLabel(i)).plain);cp.innerHTML=ic('check',14)+' Copied';setTimeout(()=>cp.innerHTML=ic('layers',14)+' Copy prompt',1400)}
    if(os){const i=+os.dataset.openstep,s=src.steps[i];copyText(fillPrompt(s.prompt,st.v,labels,prevText(i),prevLabel(i)).plain);if(!st.done.length&&!i)log(`Started “${src.title}”`,'play')}
    if(e.target.closest('#runExport')){
      const md=[`# ${src.title}`,'',src.desc,'','## Your details',...src.vars.map(([k,l])=>`- **${l}:** ${st.v[k]||'—'}`),'','## Steps',
        ...src.steps.flatMap((s,i)=>{const tn=st.swap[i]||s.tool,t=byName(tn);return[`### ${st.done.includes(i)?'[x]':'[ ]'} ${i+1}. ${s.title} — ${tn}`,t?`Open: https://${t.url}`:'','```',fillPrompt(s.prompt,st.v,labels,prevText(i),prevLabel(i)).plain,'```',st.notes[i]?`**Result:**\n${st.notes[i]}`:'',''] })].join('\n');
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));a.download=src.title.replace(/[^\w]+/g,'-').toLowerCase()+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Checklist downloaded','file')}
    if(e.target.closest('#runTasks')){src.steps.forEach((s,i)=>{if(!st.done.includes(i))addTask(`${s.title} (${st.swap[i]||s.tool})`,'idea','Content',i?'Medium':'High')});toast(`${src.steps.length-st.done.length} tasks added to your board`,'folder')}
    if(e.target.closest('#runWf')){wf={n:src.title,d:src.desc,input:Object.values(st.v).filter(Boolean).join(', '),s:src.steps.map(s=>{const t=byName(s.tool)||monoFor(s.tool),c=t.ci!=null?CATS[t.ci]:{icon:'sparkle',color:'#4c8dff'};return{i:c.icon,t:s.title,d:s.tip||t.best||'',tool:s.tool,c:c.color,r:'Step complete',prompt:s.prompt}})};renderFlow();closeOverlays();go('builder',{tab:'builder'});toast('Opened in the workflow builder — click any step to edit','flow')}
    if(e.target.closest('#runReset')){S.d.runs[key]={v:{},done:[],notes:[],swap:{}};S.save();openRunner(key)}
  };
  draw();setTimeout(()=>$('#modalBody [data-var]')?.focus(),60);
}
const openPlaybook=id=>openRunner('pb:'+id);
const _close=closeOverlays;closeOverlays=function(){_close();$('#modal').classList.remove('wide')};

/* ---------- playbook cards ---------- */
function pbCard(p,i=0){const A=AREAS[p.a],st=S.d.runs['pb:'+p.id],pr=st?st.done.length/p.s.length:0;
  const tools=[...new Set(p.s.map(s=>s[0]))].map(n=>byName(n)).filter(Boolean);
  return`<button class="glass glow pbcard" data-pb="${p.id}" style="--d:${(i%12)*.3};--ac:${A[2]}">
    <div class="pb-top"><span class="pb-area">${ic(A[1],13)}${A[0]}</span><span class="pb-time">${ic('clock',12)} ~${p.min} min saved</span></div>
    <h4>${esc(p.t)}</h4><p>${esc(p.d)}</p>
    ${pr?`<div class="bar-track"><i style="width:${pr*100}%"></i></div>`:''}
    <div class="tc-f"><span class="stack-ic">${tools.slice(0,4).map(t=>logoHTML(t,26)).join('')}</span><span class="muted-sm">${p.s.length} steps</span><span class="go-sm">${ic('arrow',14)}</span></div></button>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pb]');if(b){e.stopPropagation();openPlaybook(b.dataset.pb)}},true);

/* ---------- task helper: “what do you need to get done?” ---------- */
function helperAnswer(text){
  const pbs=searchPlaybooks(text,2);
  const fromPb=[...new Set(pbs.flatMap(p=>p.s.map(s=>s[0])))].map(byName).filter(Boolean);
  const tl=fromPb.length?fromPb.slice(0,5):searchTools(text,4);
  const starter=`You are an expert assistant helping me with an everyday task.\nTask: ${text}\n\nFirst ask me up to 3 short questions to understand my situation. Then give me a clear step-by-step plan, with anything I can copy and use directly (messages, lists, templates). Keep it practical.`;
  return`<div class="helper-out">
    ${pbs.length?`<div class="res-h">Guided playbooks</div><div class="pb-mini">${pbs.map(p=>`<button class="lrow" data-pb="${p.id}"><span class="badge sq" style="--c:${AREAS[p.a][2]};width:34px;height:34px">${ic(AREAS[p.a][1],15)}</span><div class="res-t">${esc(p.t)}<em>${p.s.length} steps · ~${p.min} min saved</em></div><span class="btn sm solid">Start ${ic('arrow',13)}</span></button>`).join('')}</div>`:''}
    <div class="res-h">Or start right now with a ready prompt</div>
    <div class="rs-prompt"><pre>${esc(starter)}</pre></div>
    <div class="rs-acts"><a class="btn sm solid" target="_blank" rel="noopener" href="${DEEP.ChatGPT(starter)}">Open in ChatGPT ${ic('ext',13)}</a><a class="btn sm" target="_blank" rel="noopener" href="${DEEP.Claude(starter)}">Open in Claude ${ic('ext',13)}</a><a class="btn sm" target="_blank" rel="noopener" href="${DEEP.Perplexity(text)}">Search on Perplexity ${ic('ext',13)}</a><button class="btn sm ghost" data-copystarter>${ic('layers',13)} Copy</button></div>
    ${tl.length?`<div class="res-h">Tools that fit</div><div class="tool-chips">${tl.map(t=>`<button class="tool-chip" data-open="${t.id}">${logoHTML(t,20)}${esc(t.n)}</button>`).join('')}</div>`:''}
  </div>`;
}
const HELPER_EX=['Plan meals for the week','Reply to a tough email','Plan a 4-day trip','Understand my lease','Study for an exam','Make a budget'];
function openHelper(text=''){
  openModal(`<div class="eyebrow">Ask Lunorb</div><h2 class="modal-h">What do you need to <span class="grad">get done?</span></h2>
    <label class="mini-search pal-in">${ic('sparkle',18)}<input id="helpQ" placeholder="e.g. “plan a birthday party for 15 kids”" value="${esc(text)}" autocomplete="off"><button class="go" id="helpGo" style="width:36px;height:36px" aria-label="Ask">${ic('arrow',15)}</button></label>
    <div class="chips">${HELPER_EX.map(x=>`<button class="chip" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div><div id="helpOut"></div>`);
  const run=()=>{const v=$('#helpQ').value.trim();if(!v)return $('#helpQ').focus();$('#helpOut').innerHTML=helperAnswer(v);log(`Asked Lunorb: “${v}”`,'sparkle')};
  $('#helpGo').onclick=run;$('#helpQ').onkeydown=e=>{if(e.key==='Enter')run()};
  $('#modalBody').onclick=async e=>{const ex=e.target.closest('[data-ex]');if(ex){$('#helpQ').value=ex.dataset.ex;run()}
    if(e.target.closest('[data-copystarter]')){await copyText($('#helpOut .rs-prompt pre').textContent);toast('Prompt copied','layers')}};
  if(text)run();else setTimeout(()=>$('#helpQ').focus(),40);
}
$('#helperBtn').onclick=()=>openHelper();

/* ---------- everyday page ---------- */
let lifeArea='all';
function renderLife(){
  $('#lifeAreas').innerHTML=`<button class="chip ${lifeArea==='all'?'on':''}" data-area="all">All <em>${PLAYBOOKS.length}</em></button>`+Object.entries(AREAS).filter(([k])=>PLAYBOOKS.some(p=>p.a===k)).map(([k,[n,i,c]])=>`<button class="chip ${lifeArea===k?'on':''}" data-area="${k}"><span style="color:${c}">${ic(i,13)}</span>${n}<em>${PLAYBOOKS.filter(p=>p.a===k).length}</em></button>`).join('');
  const L=PLAYBOOKS.filter(p=>lifeArea==='all'||p.a===lifeArea);
  $('#pbGrid').innerHTML=L.map(pbCard).join('');
  const going=PLAYBOOKS.filter(p=>{const r=S.d.runs['pb:'+p.id];return r&&(r.done.length||Object.values(r.v).some(Boolean))&&r.done.length<p.s.length});
  $('#pbGoing').hidden=!going.length;$('#pbGoingGrid').innerHTML=going.map(pbCard).join('');
}
$('#lifeAreas').onclick=e=>{const b=e.target.closest('[data-area]');if(b){lifeArea=b.dataset.area;renderLife()}};
$('#research').innerHTML=RESEARCH.map(([n,t,src,u],i)=>`<div class="glass stat-card" data-a style="--d:${8+i*.4}"><b class="grad">${n}</b><p>${t}</p><a href="${u}" target="_blank" rel="noopener">${ic('book',12)} ${src}</a></div>`).join('');
const lq=$('#lifeQ'),lres=$('#lifeResults');
function lifeResults(){const v=lq.value.trim();if(!v){lres.classList.remove('on');return}
  const pbs=searchPlaybooks(v,4),tl=searchTools(v,4);
  lres.innerHTML=(pbs.length?'<div class="res-h">Guided playbooks</div>'+pbs.map(p=>`<div class="res" data-pb="${p.id}"><span class="badge sq" style="--c:${AREAS[p.a][2]};width:28px;height:28px">${ic(AREAS[p.a][1],14)}</span><div class="res-t">${esc(p.t)}<em>${esc(p.d)}</em></div><small>~${p.min} min</small></div>`).join(''):'')+
    (tl.length?'<div class="res-h">Tools</div>'+tl.map(t=>`<div class="res" data-open="${t.id}">${logoHTML(t,28)}<div class="res-t">${esc(t.n)}<em>${esc(t.best)}</em></div><small>${t.c}</small></div>`).join(''):'')+
    `<div class="res-h">Anything else</div><div class="res" data-askhelp>${ic('sparkle',18)}<div class="res-t">Get a plan for “${esc(v)}”<em>Ready-to-use prompt + matching tools</em></div><small>↵</small></div>`;
  lres.classList.add('on')}
lq.addEventListener('input',lifeResults);lq.addEventListener('focus',lifeResults);
lq.addEventListener('keydown',e=>{if(e.key==='Enter'&&lq.value.trim()){lres.classList.remove('on');openHelper(lq.value.trim())}});
lres.addEventListener('click',e=>{if(e.target.closest('[data-askhelp]')){lres.classList.remove('on');openHelper(lq.value.trim())}});
$('#lifeGo').onclick=()=>lq.value.trim()?openHelper(lq.value.trim()):lq.focus();
document.addEventListener('click',e=>{if(!e.target.closest('#lifeSearch'))lres.classList.remove('on')});
$('#lifeChips').innerHTML=HELPER_EX.map(x=>`<button class="chip" data-ex2="${esc(x)}">${esc(x)}</button>`).join('');
$('#lifeChips').onclick=e=>{const b=e.target.closest('[data-ex2]');if(b)openHelper(b.dataset.ex2)};
ENTER.life=renderLife;
SCN.life={...SCN.home,seed:97,trees:.8};

/* ---------- home: everyday row + continue ---------- */
function renderHomeLife(){
  $('#homePb').innerHTML=['meals','inbox','trip','budget'].map((id,i)=>pbCard(PBX[id],i)).join('');
}
const _homeEnter=ENTER.home;ENTER.home=()=>{_homeEnter&&_homeEnter();renderHomeLife()};

/* ---------- drawer: “why it stands out” + compare ---------- */
const _openTool=openTool;
openTool=function(key){
  _openTool(key);const t=typeof key==='number'?ALL[key]:byName(key);if(!t)return;
  const ins=insightFor(t);
  $('#drawer .best').insertAdjacentHTML('afterend',`<div class="insight">
    <div class="eyebrow">${ins.curated?'Why it stands out':'What it’s for'}</div><p>${esc(ins.s)}</p>
    <div class="ins-grid"><div><span>${ic('check',13)} Strongest at</span><ul>${ins.best.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></div>
      <div><span>${ic('eye',13)} Where others lead</span><p>${esc(ins.watch)}</p></div></div>
    ${ins.vs.length?`<div class="ins-vs">${ins.vs.map(([n,why])=>{const o=byName(n);return o?`<button class="tool-chip" data-open="${o.id}">${logoHTML(o,20)}${esc(n)} <em>— ${esc(why)}</em></button>`:''}).join('')}</div>`:''}
    <div class="ins-src"><span>Sources</span>${ins.src.map(([l,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join('')}${ins.curated?'<em>Reviewed Oct 2026 · rankings change fast</em>':''}</div></div>`);
  const pbs=PLAYBOOKS.filter(p=>p.s.some(s=>s[0]===t.n)).slice(0,3);
  if(pbs.length)$('#drawer .dr-acts').insertAdjacentHTML('afterend',`<div class="sec-h" style="margin:26px 0 10px"><h3 style="font-size:16px">Use it in a guided playbook</h3></div><div class="pb-mini">${pbs.map(p=>`<button class="lrow" data-pb="${p.id}"><span class="badge sq" style="--c:${AREAS[p.a][2]};width:30px;height:30px">${ic(AREAS[p.a][1],14)}</span><div class="res-t">${esc(p.t)}<em>~${p.min} min saved</em></div>${ic('chev',14)}</button>`).join('')}</div>`);
  $('#drawer .dr-acts').insertAdjacentHTML('beforeend',`<button class="btn ghost" data-compare="${t.id}">${ic('layers',15)} Compare</button>`);
};
function openCompare(ids){
  const T=ids.map(i=>ALL[i]),c=CATS[T[0].ci],pool=ALL.filter(x=>x.ci===T[0].ci).sort((a,b)=>a.rank-b.rank);
  const row=(l,f)=>`<tr><th>${l}</th>${T.map(t=>`<td>${f(t)}</td>`).join('')}</tr>`;
  $('#modal').classList.add('wide');
  openModal(`<div class="run-h"><div><div class="eyebrow">Compare · ${esc(c.name)}</div><h2 class="modal-h">Side by side</h2></div><button class="dr-x static" data-close aria-label="Close">${ic('x',18)}</button></div>
   <div class="cmp-wrap"><table class="cmp"><thead><tr><th></th>${T.map((t,i)=>`<th><div class="cmp-h">${logoHTML(t,40)}<select data-cmp="${i}">${pool.map(p=>`<option value="${p.id}" ${p.id===t.id?'selected':''}>${esc(p.n)}</option>`).join('')}</select></div></th>`).join('')}</tr></thead><tbody>
    ${row('Stands out for',t=>esc(insightFor(t).s.split(/(?<=\.)\s/)[0]))}${row('Best at',t=>esc(t.best))}
    ${row('Audience',t=>t.aud.map(a=>`<span class="pill">${esc(a)}</span>`).join(' '))}${row('Pricing',t=>t.free?'Free / open-source':'See website')}${row('API',t=>t.api?'Yes':'—')}
    ${row('',t=>`<button class="btn sm" data-open="${t.id}">Details</button> <a class="btn sm ghost" href="https://${esc(t.url)}" target="_blank" rel="noopener">Site ${ic('ext',12)}</a>`)}
   </tbody></table></div>`);
  $('#modalBody').onchange=e=>{const s=e.target.closest('[data-cmp]');if(s){ids[+s.dataset.cmp]=+s.value;openCompare(ids)}};
}
document.addEventListener('click',e=>{const c=e.target.closest('[data-compare]');if(!c)return;e.stopPropagation();const t=ALL[+c.dataset.compare];
  const peers=ALL.filter(x=>x.ci===t.ci&&x.id!==t.id).sort((a,b)=>a.rank-b.rank).slice(0,2);closeOverlays();openCompare([t.id,...peers.map(p=>p.id)])},true);

/* ---------- workflow builder: real prompts, step settings, guided run ---------- */
const LIB_PROMPTS={research:'Research {{input}}. Summarize the 5 most important findings with sources, plus 3 trends worth acting on.',
 visuals:'Create a moodboard and 4 image concepts for {{input}}. Context:\n{{prev}}',copy:'Write 5 headline options and short supporting copy for {{input}}, based on:\n{{prev}}',
 video:'Turn this concept into a 15-second video: describe 3 shots with camera movement and on-screen text.\n{{prev}}',analyze:'Analyze this data for {{input}}: key metrics, patterns, and 3 recommendations.\n{{prev}}',
 design:'Design a layout (landing page or social post) for {{input}} using:\n{{prev}}',voice:'Write and voice a 30-second script for {{input}} based on:\n{{prev}}',
 summarize:'Condense everything below into a one-page brief with the key decisions and next steps:\n{{prev}}',publish:'Create a 1-week publishing schedule across channels for:\n{{prev}}'};
Object.entries(LIB_PROMPTS).forEach(([k,p])=>LIB[k].prompt=p);
let selStep=null;
const _renderFlow=renderFlow;
renderFlow=function(){_renderFlow();
  const inp=$('#flow .node[data-n="in"] .dd');if(inp)inp.textContent=wf.input?wf.input.slice(0,60)+(wf.input.length>60?'…':''):'Click to describe your task';
  $$('#flow .node').forEach(n=>n.classList.toggle('sel',String(selStep)===n.dataset.n));renderPanel()};
function stepObj(i){const k=wf.s[i];if(typeof k==='string')wf.s[i]={...LIB[k]};return wf.s[i]}
function renderPanel(){
  const P=$('#wfPanel');if(!P)return;
  if(selStep==='in'){P.innerHTML=`<div class="eyebrow">Input</div><h4>What’s the task?</h4><p class="muted-sm">This fills <code>{{input}}</code> in every step’s prompt.</p><textarea class="pn-in" id="wfInput" rows="5" placeholder="e.g. launch campaign for our new oat-milk latte">${esc(wf.input||'')}</textarea><button class="btn sm solid" id="pnRun">${ic('play',13)} Run guided</button>`;return}
  if(selStep==null||!wf.s[selStep]){
    const tools=[...new Set(wf.s.map(k=>stepOf(k).tool))];
    P.innerHTML=`<div class="eyebrow">Workflow</div><h4>${esc(wf.n)}</h4><div class="pn-stats"><div><b>${wf.s.length}</b><span>steps</span></div><div><b>~${wf.s.length*12}</b><span>min saved</span></div><div><b>${tools.length}</b><span>tools</span></div></div>
      <div class="stack-ic" style="margin:6px 0 14px">${tools.map(n=>logoHTML(tool(n),28)).join('')}</div>
      <ol class="pn-how"><li>Click <b>Input</b> to describe your task.</li><li>Click any step to swap its tool or edit its prompt.</li><li>Press <b>Run guided</b> — copy each prompt, open the tool, paste results back.</li></ol>
      <button class="btn sm solid" id="pnRun">${ic('play',13)} Run guided</button>`;return}
  const L=stepOf(wf.s[selStep]),T=tool(L.tool),pool=T.ci!=null?ALL.filter(x=>x.ci===T.ci).sort((a,b)=>a.rank-b.rank).slice(0,12):[];
  P.innerHTML=`<div class="pn-top"><div class="eyebrow">Step ${selStep+1}</div><button class="go-sm" id="pnClose" aria-label="Close">${ic('x',13)}</button></div>
    <input class="pn-title" id="pnTitle" value="${esc(L.t)}" aria-label="Step name">
    <label class="fld"><span>Tool</span><div class="pn-tool">${logoHTML(T,30)}<select id="pnTool">${(pool.length?pool:[T]).map(p=>`<option ${p.n===T.n?'selected':''}>${esc(p.n)}</option>`).join('')}</select></div></label>
    <p class="rs-why">${ic('sparkle',13)} ${esc(T.id!=null?shortWhy(T):'')}</p>
    <label class="pn-par"><input type="checkbox" id="pnPar" ${L.par?'checked':''} ${selStep?'':'disabled'}><span>${ic('branch',13)} Run alongside the step above</span></label>
    <label class="fld"><span>Prompt <em>use {{input}} and {{prev}}</em></span><textarea id="pnPrompt" rows="7">${esc(L.prompt||'')}</textarea></label>
    <div class="pn-row"><button class="btn sm ghost" id="pnUp" ${selStep?'':'disabled'}>${ic('up',13)}</button><button class="btn sm ghost" id="pnDown" ${selStep<wf.s.length-1?'':'disabled'}>${ic('down',13)}</button><button class="btn sm ghost" id="pnLib">${ic('search',13)} Any tool…</button><button class="btn sm ghost" id="pnDel">${ic('trash',13)}</button></div>`;
}
$('#wfPanel').addEventListener('input',e=>{
  if(e.target.id==='wfInput'){wf.input=e.target.value;const d=$('#flow .node[data-n="in"] .dd');if(d)d.textContent=wf.input.slice(0,60)||'Click to describe your task'}
  if(e.target.id==='pnPrompt')stepObj(selStep).prompt=e.target.value;
  if(e.target.id==='pnTitle'){stepObj(selStep).t=e.target.value;const tt=$(`#flow .node[data-n="${selStep}"] .tt`);if(tt)tt.lastChild.textContent=e.target.value}});
$('#wfPanel').addEventListener('change',e=>{if(e.target.id==='pnPar'){stepObj(selStep).par=e.target.checked;renderFlow();toast(e.target.checked?'Step now runs in parallel':'Step now runs after the one above','branch');return}if(e.target.id==='pnTool'){const s=stepObj(selStep),t=byName(e.target.value);s.tool=t.n;s.c=CATS[t.ci].color;s.i=CATS[t.ci].icon;renderFlow();toast(`Step ${selStep+1} now uses ${esc(t.n)}`,'flow')}});
$('#wfPanel').addEventListener('click',e=>{
  const id=e.target.closest('button')?.id;if(!id)return;
  if(id==='pnRun')openRunner('wf:'+wf.n);
  if(id==='pnClose'){selStep=null;renderFlow()}
  if(id==='pnDel'){if(wf.s.length<=1)return toast('A workflow needs at least one step','x');removeStep(selStep);selStep=null;renderFlow()}
  if(id==='pnUp'||id==='pnDown'){const j=selStep+(id==='pnUp'?-1:1),a=stepObj(selStep),b=stepObj(j);if(stagesOf(wf.s).some(g=>g.includes(selStep)&&g.includes(j)))[a.par,b.par]=[b.par,a.par];[wf.s[selStep],wf.s[j]]=[b,a];selStep=j;renderFlow()}
  if(id==='pnLib'){setTab('library');$('#libQ').focus()}});
$('#flow').addEventListener('click',e=>{if(running||e.target.closest('.kebab,.conn,[data-add],[data-del]'))return;const n=e.target.closest('.node');if(!n)return;
  selStep=n.dataset.n==='in'?'in':n.dataset.n==='out'?null:+n.dataset.n;renderFlow();if(selStep==='in')$('#wfInput')?.focus()});
$('#runGuided').onclick=()=>{if(!wf.input){selStep='in';renderFlow();$('#wfInput')?.focus();return toast('First describe your task in the Input step','target')}openRunner('wf:'+wf.n)};
const _addToolStep=addToolStep;addToolStep=function(t){_addToolStep(t);const s=wf.s[wf.s.length-1];s.prompt=`Using ${t.n}: ${t.best.toLowerCase()} for {{input}}.\n\nContext from the previous step:\n{{prev}}`;selStep=wf.s.length-1;renderFlow()};
const _loadTpl=loadTpl;loadTpl=function(k){selStep=null;_loadTpl(k)};

/* ---------- mobile tab bar ---------- */
$('#tabbar').addEventListener('click',e=>{const b=e.target.closest('[data-helper]');if(b)openHelper()});
const _go=go;go=function(n,o){_go(n,o);$$('#tabbar [data-go]').forEach(a=>a.classList.toggle('on',a.dataset.go===cur))};
