const SUPABASE_URL = 'https://wggpvyjmsjqrwccijmqm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_j6Sd35RPYwDLw7mpvZuQww_df2u0bFp';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* ---------------------------------------------------------
   FALLBACK CONTENT
   Used if Supabase is empty or temporarily unavailable.
--------------------------------------------------------- */

let stories = [
  {
    title:'Tokenisation is moving from fintech idea to financial-market infrastructure',
    eyebrow:'Capital markets & technology',
    happened:"On 2 November, the Central Bank published feedback on DLT and tokenisation and set out priorities including settlement, collateral, regulatory clarity and a dedicated tokenisation access point.",
    mechanism:'The commercial mechanism starts with the ledger. Distributed ledger technology can potentially allow some financial-market processes to become more automated or integrated, potentially reducing reconciliation and improving transparency.',
    law:'For capital-markets lawyers, this creates questions about the legal character of a token, custody, settlement finality, security interests, insolvency and contractual allocation of risk.',
    takeaway:'The important question is not whether blockchain is fashionable; it is whether tokenisation changes the legal and economic plumbing of financial markets.',
    terms:'DLT means distributed ledger technology. Tokenisation means creating a digital representation of an asset or right on such a system. Settlement is the process by which a transaction is completed.',
    watch:'Watch whether the Central Bank moves from consultation and feedback toward concrete infrastructure, regulatory guidance or pilot activity.',
    sources:'Central Bank of Ireland — Financial Systems Conference, 2 November 2026'
  },
  {
    title:"Ireland now has a dedicated AI regulatory architecture",
    eyebrow:'AI regulation',
    happened:"The Regulation of Artificial Intelligence Act 2026 established the AI Office of Ireland as an independent statutory body and provides a national framework for implementing the EU AI Act.",
    mechanism:'The commercial mechanism is regulatory rather than financial, but it has direct economic consequences. Businesses may need governance, documentation, testing, human oversight, procurement controls and changes to internal processes.',
    law:'Technology and data-protection lawyers will need to consider whether a client is a provider or deployer, the relevant risk category, procurement terms, data, confidentiality, intellectual property and employment issues.',
    takeaway:'The AI Act is moving from a European rulebook into an Irish regulatory relationship with real supervisory consequences.',
    terms:'A provider broadly develops or places an AI system on the market. A deployer is an organisation using an AI system under its authority. Governance means the internal processes through which a business identifies and manages risk.',
    watch:'Watch how the AI Office interacts with existing Irish regulators and how enforcement practice develops.',
    sources:'AI Office of Ireland; Department of Enterprise, Tourism and Employment'
  },
  {
    title:'Pillar Two is changing how large groups think about Irish tax',
    eyebrow:'Corporate tax',
    happened:'Ireland has implemented the OECD and EU Pillar Two framework. In-scope multinational and large domestic groups generally face a 15% minimum effective tax rate on a jurisdictional basis.',
    mechanism:'If the relevant jurisdictional effective tax rate is below 15%, a top-up mechanism can increase the group’s tax burden. That can change the economics of an investment because post-tax cash flows may fall.',
    law:'Corporate-tax lawyers advise on group structures, acquisitions, financing and reorganisations where Pillar Two can affect cash taxes and post-deal modelling.',
    takeaway:'A tax rule can become a valuation issue: if tax changes post-deal, cash flows change; if cash flows change, price, financing and transaction structure can change too.',
    terms:'The IIR generally imposes a top-up tax at parent level where subsidiaries are taxed below the minimum rate. The UTPR can operate as a backstop. Ireland also has a domestic top-up tax.',
    watch:'Watch further Revenue guidance and how large groups incorporate Pillar Two into acquisition modelling.',
    sources:'Irish Revenue — Pillar Two guidance and Top-up Tax Information Return'
  },
  {
    title:"Ireland's logistics property market is becoming more specialised",
    eyebrow:'Real estate & logistics',
    happened:'Irish industrial and logistics property remains resilient, while the mix of new supply is shifting toward more mid-sized and smaller units.',
    mechanism:'Businesses have different requirements for location, floor area, loading facilities, power, access and lease length. Developers respond to those requirements when deciding what to build.',
    law:'Real-estate lawyers work across acquisition, title, planning, environmental issues, financing, construction, leasing and investment transactions.',
    takeaway:'Commercial property is not just about whether demand is strong; the composition of that demand changes what developers should build and what investors should buy.',
    terms:'An occupier is the business using a property. Yield relates property income to asset value. Vacancy risk is the risk that space remains unlet.',
    watch:'Watch new industrial and logistics supply, occupier take-up, rents, vacancy and planning constraints.',
    sources:'Addleshaw Goddard — Investing in growth: Ireland’s industrial and logistics sector'
  },
  {
    title:'A Dublin industrial business has been acquired by private capital',
    eyebrow:'M&A',
    happened:'Storage Systems Limited, a Dublin-based warehouse and commercial-storage business, has been sold to Cordovan Capital Management, with the CEO remaining in place.',
    mechanism:'Private capital deploys investors’ money into businesses where the investor believes it can create or realise value through growth, operational improvements, acquisitions or strategic repositioning.',
    law:'M&A lawyers conduct legal due diligence and translate findings into transaction documents, including representations, warranties, indemnities, limitations on liability and completion mechanics.',
    takeaway:'Ask three questions: why is the seller selling, why is the buyer buying, and where does the buyer expect future value to come from?',
    terms:'Due diligence investigates what a buyer is acquiring and the risks it is taking. A warranty is a contractual statement about the target. An indemnity is a promise to compensate for a specified loss.',
    watch:'Watch how private capital continues to target established Irish businesses and whether buyers increasingly use acquisitions as platforms for consolidation.',
    sources:'Dains Corporate Finance — sale of Storage Systems Limited to Cordovan Capital Management'
  }
];

/* ---------------------------------------------------------
   LOAD CONTENT FROM SUPABASE
--------------------------------------------------------- */

async function loadSupabaseContent() {
  try {
    const { data: briefing, error: briefingError } =
      await supabaseClient
        .from('briefings')
        .select('*')
        .order('publication_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (briefingError) {
      console.warn('Supabase briefing error:', briefingError);
      return;
    }

    if (!briefing) {
      console.log('No briefing found in Supabase. Using fallback content.');
      return;
    }

    const { data: dbStories, error: storiesError } =
      await supabaseClient
        .from('stories')
        .select('*')
        .eq('briefing_id', briefing.id)
        .order('id', { ascending: true });

    if (storiesError) {
      console.warn('Supabase stories error:', storiesError);
      return;
    }

    if (dbStories && dbStories.length > 0) {
      stories = dbStories.map(story => ({
        title: story.headline || story.title || 'Untitled story',
        eyebrow: story.category || story.practice_area || '',
        happened: story.summary || story.content || '',
        mechanism: story.content || '',
        law: story.practice_area
          ? `Relevant practice area: ${story.practice_area}`
          : '',
        takeaway: story.summary || '',
        terms: '',
        watch: story.watch_next || '',
        sources: story.source_name
          ? `${story.source_name}${story.source_url ? ' — ' + story.source_url : ''}`
          : ''
      }));

      console.log('Loaded', stories.length, 'stories from Supabase.');
    }

    /* Load interview questions if available */
    const { data: dbQuestions, error: questionsError } =
      await supabaseClient
        .from('questions')
        .select('*')
        .order('id', { ascending: true });

    if (!questionsError && dbQuestions && dbQuestions.length > 0) {
      window.supabaseQuestions = dbQuestions;
      console.log('Loaded', dbQuestions.length, 'questions from Supabase.');
    }

    /* Update briefing information on the page where those elements exist */
    const issueElement = document.getElementById('issueNumber');
    const dateElement = document.getElementById('briefingDate');
    const titleElement = document.getElementById('briefingTitle');
    const introElement = document.getElementById('briefingIntro');

    if (issueElement && briefing.issue_number) {
      issueElement.textContent = `Issue ${briefing.issue_number}`;
    }

    if (dateElement && briefing.publication_date) {
      dateElement.textContent = briefing.publication_date;
    }

    if (titleElement && briefing.title) {
      titleElement.textContent = briefing.title;
    }

    if (introElement && briefing.intro) {
      introElement.textContent = briefing.intro;
    }

  } catch (error) {
    console.warn('Could not connect to Supabase. Using fallback content.', error);
  }
}

/* ---------------------------------------------------------
   STORIES
--------------------------------------------------------- */

function openStory(i) {
  const s = stories[i];

  if (!s) return;

  document.getElementById('modalCard').innerHTML = `
    <button class="close" onclick="closeModal()">×</button>
    <div class="eyebrow">${s.eyebrow || ''}</div>
    <h2>${s.title || ''}</h2>

    <h4>What happened</h4>
    <p>${s.happened || ''}</p>

    <h4>Commercial mechanism</h4>
    <p>${s.mechanism || ''}</p>

    <h4>Why a lawyer cares</h4>
    <p>${s.law || ''}</p>

    ${s.terms ? `
      <h4>Key concepts</h4>
      <p>${s.terms}</p>
    ` : ''}

    <h4>Interview takeaway</h4>
    <p><b>${s.takeaway || ''}</b></p>

    ${s.watch ? `
      <h4>What to watch next</h4>
      <p>${s.watch}</p>
    ` : ''}

    ${s.sources ? `
      <h4>Sources</h4>
      <p>${s.sources}</p>
    ` : ''}
  `;

  document.getElementById('modal').classList.add('open');
}

function openNewStory(i) {
  openStory(i);
}

/* ---------------------------------------------------------
   WEEKLY TEST
--------------------------------------------------------- */

function openQuiz() {

  const questions = window.supabaseQuestions || [];

  /* If Supabase has questions, use them */
  if (questions.length > 0) {

    const selected = questions.slice(0, 5);

    let html = `
      <button class="close" onclick="closeModal()">×</button>
      <div class="eyebrow">Weekly test</div>
      <h2>Can you connect the story to the business?</h2>
    `;

    selected.forEach((q, index) => {
      html += `
        <div class="quiz-q">
          ${index + 1}. ${q.question || ''}
        </div>

        <button
          class="choice"
          onclick="showAnswer(this, ${index})">
          Reveal answer
        </button>

        <div
          id="answer-${index}"
          style="display:none;margin-bottom:20px;padding:14px;background:#f4f7f5;border-left:3px solid #2f765b;">
          <b>Answer:</b> ${q.answer || 'No answer provided yet.'}
        </div>
      `;
    });

    document.getElementById('modalCard').innerHTML = html;
    document.getElementById('modal').classList.add('open');
    return;
  }

  /* Fallback quiz */
  document.getElementById('modalCard').innerHTML = `
    <button class="close" onclick="closeModal()">×</button>
    <div class="eyebrow">Weekly test</div>
    <h2>Can you connect the story to the business?</h2>

    <div class="quiz-q">
      1. Why is the Central Bank's focus on tokenisation infrastructure commercially important?
    </div>

    <button class="choice" onclick="answer(this,true)">
      Because the efficiency of tokenised markets depends on legal certainty, interoperability and reliable settlement as well as the underlying technology.
    </button>

    <button class="choice" onclick="answer(this,false)">
      Because tokenisation is likely to replace every existing financial intermediary once institutions adopt distributed ledgers.
    </button>

    <button class="choice" onclick="answer(this,false)">
      Because the main commercial benefit is that tokenised assets no longer need to be subject to financial-services regulation.
    </button>

    <div class="quiz-q">
      2. What is the most useful way for a lawyer to think about Ireland's new AI regulatory architecture?
    </div>

    <button class="choice" onclick="answer(this,false)">
      It mainly creates a specialist court for disputes involving artificial intelligence.
    </button>

    <button class="choice" onclick="answer(this,true)">
      It turns EU-level AI obligations into a national compliance and supervisory environment that businesses need to operationalise.
    </button>

    <button class="choice" onclick="answer(this,false)">
      It means businesses can rely on the AI Office to approve individual AI tools before they are used commercially.
    </button>

    <div class="quiz-q">
      3. Why can Pillar Two affect the economics of an acquisition?
    </div>

    <button class="choice" onclick="answer(this,false)">
      Because it guarantees that every acquisition involving an Irish company will produce a 15% tax saving.
    </button>

    <button class="choice" onclick="answer(this,false)">
      Because it changes the legal ownership of the target whenever the buyer operates in more than one jurisdiction.
    </button>

    <button class="choice" onclick="answer(this,true)">
      Because changes to the group's effective tax burden can change post-tax cash flows, which can affect valuation, pricing and transaction structure.
    </button>

    <div class="quiz-q">
      4. What is the strongest commercial insight from the logistics-property story?
    </div>

    <button class="choice" onclick="answer(this,false)">
      If logistics demand is strong, the largest possible warehouse will normally have the highest investment value.
    </button>

    <button class="choice" onclick="answer(this,true)">
      The composition of occupier demand matters because it influences what developers build, who can lease it and how investors assess risk and value.
    </button>

    <button class="choice" onclick="answer(this,false)">
      Industrial property is mainly a financing issue because tenant demand has little effect on asset valuation.
    </button>

    <div class="quiz-q">
      5. In the Storage Systems transaction, why does the buyer's investment thesis matter to the lawyer?
    </div>

    <button class="choice" onclick="answer(this,false)">
      Because the lawyer decides whether the buyer's expected return is high enough and therefore sets the purchase price.
    </button>

    <button class="choice" onclick="answer(this,false)">
      Because the investment thesis determines which warranties are legally enforceable without reference to the negotiated agreement.
    </button>

    <button class="choice" onclick="answer(this,true)">
      Because understanding where the buyer expects value to come from helps the lawyer identify which diligence findings and contractual risks are commercially significant.
    </button>

    <p id="score" style="font-weight:800;margin-top:20px"></p>
  `;

  document.getElementById('modal').classList.add('open');
}

function openNewQuiz() {
  openQuiz();
}

function showAnswer(button, index) {
  button.disabled = true;

  const answer = document.getElementById(`answer-${index}`);

  if (answer) {
    answer.style.display = 'block';
  }
}

let score = 0;
let answered = 0;

function answer(btn, correct) {
  if (btn.disabled) return;

  btn.disabled = true;
  btn.style.borderColor = correct ? '#2f765b' : '#a14b4b';
  btn.style.background = correct ? '#edf7f1' : '#fbefef';

  if (correct) score++;

  answered++;

  if (answered === 5) {
    document.getElementById('score').textContent =
      `Score: ${score}/5 — ${
        score >= 4
          ? 'Excellent. You’re thinking about mechanisms, not headlines.'
          : score >= 3
          ? 'Good commercial instincts. Focus on connecting the event to the client and the legal consequence.'
          : 'Keep working on the “why does this matter commercially?” step.'
      }`;
  }
}

/* ---------------------------------------------------------
   INTERVIEW PRACTICE
--------------------------------------------------------- */

function openNewPractice(type) {

  const q = {
    deal1:'Discuss a recent deal that interested you.',
    deal2:'Why might a company choose to acquire another business rather than grow organically?',
    deal3:'What factors would you consider when deciding between an asset purchase and a share purchase?',
    deal4:'What is the commercial purpose of legal due diligence in an acquisition?',
    deal5:'What would you want to understand about a private-equity buyer’s investment thesis?',

    capital1:'Why might a company choose to raise debt rather than equity?',
    capital2:'How do higher interest rates affect a company’s investment and financing decisions?',
    capital3:'What is the difference between revenue, profit and cash flow, and why does it matter?',
    capital4:'What does a fall in a company’s share price actually tell you?',

    economy1:'How might a recent economic event affect a law firm’s clients?',
    economy2:'How can persistent inflation affect businesses and the legal work they need?',
    economy3:'Why do tariffs matter to a business that does not directly import the affected product?',
    economy4:'What makes Ireland attractive to multinational businesses, and what risks come with that model?',
    economy5:'How would higher construction costs change the economics of a property development?',

    tech1:'What commercial problem is the EU AI Act trying to solve?',
    tech2:'Why can data protection become a transaction issue in an M&A deal?',
    tech3:'How should a commercial lawyer think about a new regulation affecting a client?',
    tech4:'Why is cybersecurity a board-level commercial issue rather than just an IT issue?',
    tech5:'Why can planning and regulatory approvals determine whether an infrastructure project is commercially viable?',

    law1:'What challenges might the legal industry face in five years?',
    law2:'What does it mean for a law firm to be commercially minded?',
    law3:'Why might a client choose an international law firm over a strong domestic firm?',
    law4:'How could generative AI change the economics of legal services?',
    law5:'Tell me about a business story you have followed and explain why it matters to a commercial lawyer.'
  }[type];

  document.getElementById('modalCard').innerHTML = `
    <button class="close" onclick="closeModal()">×</button>

    <div class="eyebrow">Interview practice</div>

    <h2>${q}</h2>

    <p>
      <b>Try this structure:</b>
      give the headline answer first; explain the commercial mechanism;
      identify who is affected; connect it to a client or sector;
      then explain the legal implications.
      Aim for 60–90 seconds.
    </p>

    <textarea
      style="width:100%;min-height:200px;border:1px solid #d9dfdc;padding:14px;font:13px Inter,ui-sans-serif,system-ui,sans-serif;resize:vertical"
      placeholder="Type your answer here, or use this as a speaking prompt..."
    ></textarea>

    <button
      class="btn"
      style="margin-top:12px"
      onclick="alert('Self-check: did you explain the mechanism, identify the client impact, and connect it to legal work?')">
      Self-check answer →
    </button>
  `;

  document.getElementById('modal').classList.add('open');
}

/* ---------------------------------------------------------
   NAVIGATION
--------------------------------------------------------- */

function newPage(id, btn) {

  document
    .querySelectorAll('.new-page')
    .forEach(p => p.classList.remove('active'));

  document
    .getElementById(id)
    .classList.add('active');

  document
    .querySelectorAll('.new-nav button')
    .forEach(b => b.classList.remove('active'));

  if (btn) btn.classList.add('active');

  window.scrollTo(0, 0);
}

/* ---------------------------------------------------------
   MODAL
--------------------------------------------------------- */

function closeModal() {

  document
    .getElementById('modal')
    .classList.remove('open');

  score = 0;
  answered = 0;
}

document
  .getElementById('modal')
  .addEventListener('click', e => {
    if (e.target.id === 'modal') {
      closeModal();
    }
  });

/* ---------------------------------------------------------
   STARTUP
--------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', async () => {
  await loadSupabaseContent();
});
