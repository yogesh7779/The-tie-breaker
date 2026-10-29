import { DecisionAnalysis } from '../types/decision';

export const SAMPLE_DECISIONS: DecisionAnalysis[] = [
  {
    id: 'dec-career-series-a',
    createdAt: '2026-10-29',
    prompt:
      'Should I accept a Founding Staff Engineer offer at a Series A AI infrastructure startup ($185k base + 1.25% equity) or stay as Principal Engineer at my public cloud company ($260k base + $140k liquid RSUs)?',
    context:
      'I have 18 months of personal liquid runway, no dependents, and want maximum career and financial leverage over the next 4 years.',
    title: 'Series A Founding Engineer vs. Public Cloud Principal Role',
    category: 'Career & Compensation',
    summary:
      'A classic trade-off between guaranteed $400k liquid annual compensation and high-ownership equity with architectural control at an early-stage company. With 18 months of runway and low fixed burn, asymmetric upside carries higher utility than marginal cash.',
    options: [
      {
        id: 'opt-startup',
        name: 'Series A Founding Staff Role',
        tagline: 'Lower guaranteed cash ($185k) in exchange for 1.25% ownership and 0-to-1 architectural scope.',
        recommended: true,
      },
      {
        id: 'opt-incumbent',
        name: 'Stay as Public Cloud Principal',
        tagline: 'Predictable $400k liquid compensation with established organizational leverage and lower volatility.',
        recommended: false,
      },
    ],
    tiebreakerVerdict: {
      winningOptionName: 'Series A Founding Staff Role',
      decisiveFactor: 'Asymmetric Career & Equity Optionality with Reversible Downside',
      rationale:
        'Because you hold 18 months of liquid runway and zero dependents, the $215k annual liquid cash gap does not impair your lifestyle or solvency. Meanwhile, building a core product from Series A to Series B compounds your technical reputation and network far faster than incremental scope at a large public incumbent—and you can always return to a Big Tech Staff/Principal seat within 18–24 months if the startup stalls.',
      keyConditionToFlip:
        'Stay at the public cloud company if the Series A startup has less than 20 months of net cash runway or lacks at least 3 paying design partners.',
      reversibility: 'Type 2 (Two-Way Door — Big Tech Principal roles remain accessible if startup exits or stalls)',
    },
    prosAndCons: [
      {
        optionName: 'Series A Founding Staff Role',
        pros: [
          {
            id: 'p-1',
            point: 'Direct 1.25% equity exposure to early-stage valuation expansion',
            detail:
              'A $250M–$500M exit or Series C secondary liquidity event yields $1.8M–$4.5M pre-tax even after 35% dilution, outperforming cumulative RSU savings.',
            impactWeight: 9,
            dimension: 'Financial',
          },
          {
            id: 'p-2',
            point: 'End-to-end ownership of core system architecture and hiring',
            detail:
              'You define the technical stack, engineering culture, and early customer delivery without cross-org alignment committees.',
            impactWeight: 9,
            dimension: 'Leverage',
          },
          {
            id: 'p-3',
            point: 'Direct executive and investor visibility',
            detail:
              'Working directly alongside founders and Tier-1 board partners creates direct access to future co-founders and seed capital.',
            impactWeight: 8,
            dimension: 'Career',
          },
          {
            id: 'p-4',
            point: 'High velocity of iteration and customer feedback loops',
            detail:
              'Features ship in days rather than quarters, accelerating technical learning across product, GTM, and infrastructure.',
            impactWeight: 7,
            dimension: 'Velocity',
          },
        ],
        cons: [
          {
            id: 'c-1',
            point: '$215,000 annual opportunity cost in guaranteed liquid compensation',
            detail:
              'Foregoing $75k base difference plus $140k in quarterly vesting RSUs reduces guaranteed annual savings rate.',
            impactWeight: 8,
            dimension: 'Financial',
          },
          {
            id: 'c-2',
            point: 'High probability (65%+) that startup equity takes 5–8 years to become liquid',
            detail:
              'Private shares cannot be easily sold without company-sponsored tender offers or M&A.',
            impactWeight: 7,
            dimension: 'Risk',
          },
          {
            id: 'c-3',
            point: 'Sustained 55+ hour weeks and on-call operational load',
            detail:
              'Early infrastructure teams carry direct customer reliability pressure with minimal SRE support.',
            impactWeight: 6,
            dimension: 'Sustainability',
          },
          {
            id: 'c-4',
            point: 'Product-market fit and GTM execution risk outside engineering control',
            detail:
              'Even world-class engineering can fail if enterprise sales cycles stall or market timing shifts.',
            impactWeight: 7,
            dimension: 'Risk',
          },
        ],
      },
      {
        optionName: 'Stay as Public Cloud Principal',
        pros: [
          {
            id: 'p-5',
            point: '$400,000 total annual liquid compensation with quarterly RSU liquidity',
            detail:
              'Provides immediate cash flow that can be compounded in diversified index funds or angel investments.',
            impactWeight: 9,
            dimension: 'Financial',
          },
          {
            id: 'p-6',
            point: 'Existing institutional trust and organizational capital',
            detail:
              'You already know the internal architecture, promotion criteria, and key decision-makers.',
            impactWeight: 7,
            dimension: 'Leverage',
          },
          {
            id: 'p-7',
            point: 'Predictable 40–45 hour workweek and mature on-call rotation',
            detail:
              'Dedicated platform, security, and SRE teams absorb operational toil and incident response.',
            impactWeight: 8,
            dimension: 'Sustainability',
          },
          {
            id: 'p-8',
            point: 'Massive deployment scale and enterprise distribution reach',
            detail:
              'Architectural changes impact millions of production workloads immediately upon rollout.',
            impactWeight: 7,
            dimension: 'Career',
          },
        ],
        cons: [
          {
            id: 'c-5',
            point: 'Capped financial upside tied to large-cap stock performance',
            detail:
              'Compensation grows linearly (10–15% per year) rather than exponentially.',
            impactWeight: 8,
            dimension: 'Financial',
          },
          {
            id: 'c-6',
            point: 'High coordination overhead and cross-team political friction',
            detail:
              '60%+ of Principal Engineer bandwidth is spent on design docs, alignment meetings, and dependency negotiation.',
            impactWeight: 8,
            dimension: 'Velocity',
          },
          {
            id: 'c-7',
            point: 'Narrower scope of business exposure',
            detail:
              'Insulated from pricing, enterprise sales negotiations, and fundraising mechanics.',
            impactWeight: 7,
            dimension: 'Career',
          },
          {
            id: 'c-8',
            point: 'Regret risk as personal obligations increase in 3–5 years',
            detail:
              'Taking an early-stage leap becomes significantly harder once you have a mortgage or family dependents.',
            impactWeight: 8,
            dimension: 'Timing',
          },
        ],
      },
    ],
    comparisonTable: {
      criteria: [
        {
          id: 'crit-1',
          criterion: '4-Year Asymmetric Financial Upside',
          description: 'Potential for step-function net worth expansion if execution succeeds.',
          weight: 5,
          scores: [
            {
              optionName: 'Series A Founding Staff Role',
              score: 9,
              note: '1.25% founding staff equity offers $2M–$5M+ upside in a mid-size or breakout outcome.',
            },
            {
              optionName: 'Stay as Public Cloud Principal',
              score: 6,
              note: 'Strong $1.6M gross 4-year earnings, but zero step-function multiplier.',
            },
          ],
        },
        {
          id: 'crit-2',
          criterion: 'Guaranteed Cash & Downside Protection',
          description: 'Certainty of near-term liquid income regardless of macro conditions.',
          weight: 3,
          scores: [
            {
              optionName: 'Series A Founding Staff Role',
              score: 5,
              note: '$185k base covers living expenses comfortably, though equity value can go to zero.',
            },
            {
              optionName: 'Stay as Public Cloud Principal',
              score: 9,
              note: '$400k liquid compensation vests quarterly like cash.',
            },
          ],
        },
        {
          id: 'crit-3',
          criterion: 'Technical Autonomy & Execution Velocity',
          description: 'Freedom to design systems and ship production code without bureaucratic drag.',
          weight: 5,
          scores: [
            {
              optionName: 'Series A Founding Staff Role',
              score: 10,
              note: 'Full architectural authority from day one; direct customer deployment.',
            },
            {
              optionName: 'Stay as Public Cloud Principal',
              score: 5,
              note: 'Heavy review cycles, legacy compatibility constraints, and quarterly planning.',
            },
          ],
        },
        {
          id: 'crit-4',
          criterion: 'Long-Term Career & Network Compounding',
          description: 'Value of the role for future CTO, founder, or executive opportunities.',
          weight: 4,
          scores: [
            {
              optionName: 'Series A Founding Staff Role',
              score: 9,
              note: 'Proves 0-to-1 builder credentials and builds direct VC/founder network.',
            },
            {
              optionName: 'Stay as Public Cloud Principal',
              score: 7,
              note: 'Prestigious credential, but incremental tenure yields diminishing signaling gains.',
            },
          ],
        },
        {
          id: 'crit-5',
          criterion: 'Work-Life Sustainability & Pacing',
          description: 'Predictability of hours, cognitive load, and burnout protection.',
          weight: 3,
          scores: [
            {
              optionName: 'Series A Founding Staff Role',
              score: 5,
              note: 'High intensity during customer onboarding and Series B milestones.',
            },
            {
              optionName: 'Stay as Public Cloud Principal',
              score: 8,
              note: 'Well-resourced teams and predictable vacation/on-call schedules.',
            },
          ],
        },
      ],
    },
    swot: {
      focalSubject: 'Accepting the Series A Founding Staff Engineer Offer',
      strengths: [
        {
          title: '18-Month Personal Runway Cushion',
          detail: 'Your low personal burn removes financial anxiety and lets you optimize for long-term equity value.',
          actionItem: 'Keep 12 months of living expenses in high-yield Treasury bills untouched.',
        },
        {
          title: 'Principal-Level Distributed Systems Pedigree',
          detail: 'Your public cloud experience directly de-risks the startup’s core technical scalability bottlenecks.',
          actionItem: 'Use this leverage to negotiate a 10-year option exercise window and early exercise (83b).',
        },
        {
          title: 'High Reversibility ("Boomerang" Safety Net)',
          detail: 'Leaving on strong terms preserves the ability to return at Principal level within 24 months.',
          actionItem: 'Give a generous 3-week transition handoff and maintain monthly touchpoints with your VP.',
        },
      ],
      weaknesses: [
        {
          title: 'Immediate $215k/yr Reduction in Liquid Cash Flow',
          detail: 'Lower annual savings rate reduces liquid capital deployment into public markets.',
          actionItem: 'Negotiate a guaranteed base bump to $215k automatically triggered upon Series B closing.',
        },
        {
          title: 'Single-Stock Illiquidity Concentration',
          detail: 'A high percentage of your 4-year net worth growth is tied to one private cap table.',
          actionItem: 'Request secondary sale participation rights (up to 15% of vested shares) in future priced rounds.',
        },
        {
          title: 'Unproven Internal Engineering Processes',
          detail: 'Early startups often lack CI/CD rigor, observability, and product specs.',
          actionItem: 'Dedicate your first 30 days to automating deployment pipelines before scaling feature headcount.',
        },
      ],
      opportunities: [
        {
          title: 'Path to VP of Engineering or Co-Founder/CTO Track',
          detail: 'Joining as the first Staff-level hire positions you as the natural technical leader as the team grows from 6 to 35.',
          actionItem: 'Establish explicit 12-month scope expansion milestones with the CEO in writing.',
        },
        {
          title: 'Secondary Liquidity at Series B / Series C',
          detail: 'AI infrastructure startups raising up-rounds frequently allow early employees to take $250k–$500k off the table.',
          actionItem: 'Verify current investor appetite and revenue growth rate prior to signing.',
        },
        {
          title: 'Direct Enterprise Customer Co-Design',
          detail: 'Working directly with Fortune 500 CTOs as design partners builds your personal industry reputation.',
          actionItem: 'Co-author technical architecture case studies and speak at industry conferences.',
        },
      ],
      threats: [
        {
          title: 'Hyperscaler Bundling & Commoditization',
          detail: 'Major cloud providers may release native competing tooling that compresses startup margins.',
          actionItem: 'Audit the startup’s multi-cloud moat and proprietary data flywheel before accepting.',
        },
        {
          title: 'Series B Valuation Reset or Down-Round Dilution',
          detail: 'If ARR growth lags, punitive liquidation preferences can dilute common shareholders.',
          actionItem: 'Ask the CEO for the current burn multiple, net runway in months, and Series A preferred terms.',
        },
        {
          title: 'Founder Alignment or Strategy Pivot Friction',
          detail: 'Co-founder disagreement on enterprise vs. open-source GTM can stall engineering momentum.',
          actionItem: 'Conduct backchannel reference calls with 2 current engineers and 1 seed investor.',
        },
      ],
    },
    stressTests: [
      {
        id: 'st-1',
        scenarioPrompt: 'What if the startup refuses a 10-year option exercise window and only has 11 months of cash runway?',
        doesVerdictFlip: true,
        newWinningOption: 'Stay as Public Cloud Principal',
        impactAnalysis:
          'An 11-month runway means the company must begin fundraising in 4–5 months, leaving insufficient time for your engineering work to materially move revenue metrics before financing risk hits. Combined with a rigid 90-day post-termination exercise window, you could be forced to pay steep tax/exercise costs on illiquid stock.',
        adjustedCriteriaNote:
          'Downside Protection drops from 5/10 to 2/10. Decline the offer unless they extend exercise window to at least 5 years.',
        timestamp: 'Initial Stress Test',
      },
    ],
  },
  {
    id: 'dec-build-vs-buy-auth',
    createdAt: '2026-10-28',
    prompt:
      'Should our 18-person B2B SaaS engineering team build a custom multi-tenant RBAC/SAML authentication engine in-house or adopt a managed enterprise identity provider?',
    context:
      'We have 4 Fortune 500 enterprise pilots blocked on SAML SSO + SCIM directory sync due in 6 weeks. Managed provider costs $36,000/year at our current MAU tier.',
    title: 'In-House Multi-Tenant SAML/RBAC vs. Managed Identity Platform',
    category: 'Product & Engineering',
    summary:
      'Weighing $36,000/year in recurring vendor spend and external platform dependency against dedicating 2 senior backend engineers for 8–10 weeks to build and maintain SAML, SCIM, and audit compliance in-house.',
    options: [
      {
        id: 'opt-managed',
        name: 'Adopt Managed Identity Platform',
        tagline: 'Ship SAML SSO & SCIM in 10 days for $36k/yr and keep engineers focused on core product.',
        recommended: true,
      },
      {
        id: 'opt-inhouse',
        name: 'Build Custom Auth & SCIM In-House',
        tagline: 'Zero vendor licensing fees and full schema control, but requires 8+ weeks of senior engineering.',
        recommended: false,
      },
    ],
    tiebreakerVerdict: {
      winningOptionName: 'Adopt Managed Identity Platform',
      decisiveFactor: 'Opportunity Cost of Senior Engineering Bandwidth & 6-Week Enterprise Pilot Deadline',
      rationale:
        'Two senior engineers for 8 weeks costs ~$65,000 in direct payroll alone—already exceeding the $36,000 annual vendor contract—while risking the 6-week deadline for 4 Fortune 500 pilots. Identity edge cases (IdP-initiated SAML assertions, SCIM group reconciliation, SOC2 audit trails) are undifferentiated heavy lifting.',
      keyConditionToFlip:
        'Build in-house (or migrate to open-source self-hosted) only when annual vendor licensing exceeds $120,000/yr or when strict air-gapped on-premise deployment is contractually required.',
      reversibility: 'Type 2 (Moderate — abstract auth behind an internal OIDC/JWT session interface to allow future migration)',
    },
    prosAndCons: [
      {
        optionName: 'Adopt Managed Identity Platform',
        pros: [
          {
            id: 'mp-1',
            point: 'Unblocks 4 Fortune 500 enterprise pilots within 10 business days',
            detail:
              'Pre-built Okta, Azure AD, and Ping Identity connectors eliminate custom XML assertion debugging.',
            impactWeight: 10,
            dimension: 'Velocity',
          },
          {
            id: 'mp-2',
            point: 'Preserves 320+ hours of senior backend engineering for core roadmap',
            detail:
              'Engineers remain focused on revenue-differentiating product features rather than SCIM provisioning edge cases.',
            impactWeight: 9,
            dimension: 'Leverage',
          },
          {
            id: 'mp-3',
            point: 'Turnkey SOC2 Type II compliance and security patching',
            detail:
              'Automated token rotation, brute-force protection, and enterprise admin portal out of the box.',
            impactWeight: 8,
            dimension: 'Risk',
          },
        ],
        cons: [
          {
            id: 'mc-1',
            point: '$36,000/year recurring COGS that scales with enterprise connection count',
            detail:
              'Per-SSO-connection pricing can compress gross margins if not passed through in enterprise tier pricing.',
            impactWeight: 7,
            dimension: 'Financial',
          },
          {
            id: 'mc-2',
            point: 'Synchronization latency between external IdP state and internal Postgres RBAC',
            detail:
              'Requires webhook handling and fallback polling to keep user roles synchronized.',
            impactWeight: 6,
            dimension: 'Architecture',
          },
        ],
      },
      {
        optionName: 'Build Custom Auth & SCIM In-House',
        pros: [
          {
            id: 'ip-1',
            point: 'Zero per-seat or per-SAML-connection vendor licensing fees',
            detail:
              'Protects gross margin at high scale and allows bundling SSO into mid-market plans for free.',
            impactWeight: 7,
            dimension: 'Financial',
          },
          {
            id: 'ip-2',
            point: 'Single unified database transaction boundary for users, tenants, and permissions',
            detail:
              'No webhook eventual-consistency lag between identity store and application permissions.',
            impactWeight: 8,
            dimension: 'Architecture',
          },
        ],
        cons: [
          {
            id: 'ic-1',
            point: 'High risk of missing the 6-week Fortune 500 pilot deadline',
            detail:
              'Enterprise IT quirks across legacy ADFS and custom SAML mappings routinely cause 3–4 week schedule slips.',
            impactWeight: 10,
            dimension: 'Velocity',
          },
          {
            id: 'ic-2',
            point: 'Permanent ongoing security maintenance and CVE liability',
            detail:
              'XML signature wrapping vulnerabilities and SCIM token lifecycle bugs become your team’s 24/7 responsibility.',
            impactWeight: 9,
            dimension: 'Risk',
          },
        ],
      },
    ],
    comparisonTable: {
      criteria: [
        {
          id: 'b-1',
          criterion: 'Speed to Unblock 6-Week Enterprise Deals',
          description: 'Certainty of production SAML + SCIM delivery before pilot expiration.',
          weight: 5,
          scores: [
            { optionName: 'Adopt Managed Identity Platform', score: 10, note: 'Production-ready in 1–2 sprints.' },
            { optionName: 'Build Custom Auth & SCIM In-House', score: 4, note: 'High probability of slipping past 6 weeks.' },
          ],
        },
        {
          id: 'b-2',
          criterion: 'Total 12-Month Cost (Vendor + Engineering Payroll)',
          description: 'Combined cash outlay plus fully burdened engineering time.',
          weight: 4,
          scores: [
            { optionName: 'Adopt Managed Identity Platform', score: 8, note: '$36k vendor fee + ~$8k integration time.' },
            { optionName: 'Build Custom Auth & SCIM In-House', score: 5, note: '~$65k initial build + ~$25k/yr maintenance.' },
          ],
        },
        {
          id: 'b-3',
          criterion: 'Security Posture & Audit Readiness',
          description: 'Resilience against auth vulnerabilities and enterprise infosec questionnaires.',
          weight: 5,
          scores: [
            { optionName: 'Adopt Managed Identity Platform', score: 9, note: 'Pre-audited SAML/SCIM state machines.' },
            { optionName: 'Build Custom Auth & SCIM In-House', score: 6, note: 'Requires external pen-testing and manual upkeep.' },
          ],
        },
        {
          id: 'b-4',
          criterion: 'Architectural Control & Data Locality',
          description: 'Freedom from third-party webhooks and external rate limits.',
          weight: 3,
          scores: [
            { optionName: 'Adopt Managed Identity Platform', score: 6, note: 'Requires webhook sync into primary database.' },
            { optionName: 'Build Custom Auth & SCIM In-House', score: 9, note: 'Native relational integrity inside core DB.' },
          ],
        },
      ],
    },
    swot: {
      focalSubject: 'Adopting Managed Identity Platform with Internal Auth Abstraction Layer',
      strengths: [
        {
          title: 'Immediate Self-Serve Admin Portal for Enterprise IT',
          detail: 'Customer IT admins configure Okta/Entra ID directly without engineering hand-holding.',
          actionItem: 'Embed the self-serve SSO setup wizard in your organization settings tab.',
        },
        {
          title: 'Zero Roadmap Disruption for Core Product Team',
          detail: '16 of 18 engineers stay 100% focused on core Q4 product deliverables.',
          actionItem: 'Assign 1 engineer for 2 weeks to build a clean OIDC adapter interface.',
        },
      ],
      weaknesses: [
        {
          title: 'External Dependency in Critical Login Path',
          detail: 'Vendor outage could impact authentication token refreshes.',
          actionItem: 'Use long-lived cryptographic public key verification locally so active sessions survive vendor downtime.',
        },
        {
          title: 'Per-Connection Pricing Escalation',
          detail: 'Costs scale up if mid-market customers demand SAML.',
          actionItem: 'Gate SAML/SCIM strictly to Enterprise contracts ($25k+ ACV).',
        },
      ],
      opportunities: [
        {
          title: 'Accelerate $300k+ Enterprise Pipeline Closure',
          detail: 'Delivering SCIM ahead of schedule builds high trust with Fortune 500 procurement.',
          actionItem: 'Use SSO + SCIM readiness as a lever to close annual upfront payment terms.',
        },
        {
          title: 'Monetize Enterprise Security Tier',
          detail: 'Charge a $5,000/yr Enterprise Security add-on that more than covers the vendor fee.',
          actionItem: 'Update pricing page to bundle SAML, SCIM, and Audit Logs in Enterprise tier.',
        },
      ],
      threats: [
        {
          title: 'Vendor Renewal Price Hike at Year 2',
          detail: 'Identity vendors often increase renewal pricing by 25–40% once integrated.',
          actionItem: 'Negotiate a 2-year price cap on per-connection overages before signing.',
        },
        {
          title: 'On-Premise Customer Deployment Requests',
          detail: 'Cloud-only identity providers cannot run inside air-gapped customer VPCs.',
          actionItem: 'Keep internal session verification standard OIDC so Keycloak can be swapped in for air-gapped deployments.',
        },
      ],
    },
  },
];

export const QUICK_TEMPLATES = [
  {
    label: 'Bootstrapped vs. Venture Seed Raise',
    prompt:
      'Should we raise a $2.5M Seed round at a $15M post-money valuation or stay bootstrapped now that our SaaS has reached $42,000 MRR growing 11% month-over-month?',
    context:
      'Two technical founders, profitable at current burn, competing in a vertical workflow category where 2 funded competitors just raised $5M.',
  },
  {
    label: 'Remote Distributed vs. Hybrid Hub Lease',
    prompt:
      'Should our 35-person product organization sign a 3-year office lease for a 3-day/week hybrid hub in Austin or commit to a 100% remote-first distributed model?',
    context:
      'Office lease + ops costs $280k/year. Currently 55% of team is in Austin and 45% is distributed across US/EU time zones.',
  },
  {
    label: 'Buy Starter Home Now vs. Rent & Invest',
    prompt:
      'Should we buy a $720,000 townhouse now with 20% down at a 6.1% mortgage rate or continue renting our current apartment for $3,100/month and invest the down payment in S&P 500 index funds?',
    context:
      'Combined household income is $245k, planning to stay in the same metro area for at least 5–6 years.',
  },
];
