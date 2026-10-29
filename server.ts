import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DECISION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Concise editorial title for the decision (max 65 characters).',
    },
    category: {
      type: Type.STRING,
      description: 'Short category label such as Career, Strategy, Finance, Architecture, or Operations.',
    },
    summary: {
      type: Type.STRING,
      description: 'Clear 2-sentence framing of the core trade-off and why this decision is difficult.',
    },
    options: {
      type: Type.ARRAY,
      description: '2 to 3 distinct options being evaluated in this decision.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: 'Clear name of the option (e.g., Option A: Accept Series A Offer).' },
          tagline: { type: Type.STRING, description: 'One-line description of what this path prioritizes.' },
          recommended: { type: Type.BOOLEAN, description: 'True for the single best tiebreaker recommendation.' },
        },
        required: ['id', 'name', 'tagline', 'recommended'],
      },
    },
    tiebreakerVerdict: {
      type: Type.OBJECT,
      properties: {
        winningOptionName: { type: Type.STRING },
        decisiveFactor: {
          type: Type.STRING,
          description: 'The single most important asymmetrical advantage or risk that breaks the tie.',
        },
        rationale: {
          type: Type.STRING,
          description: '2-3 sentences of rigorous analytical reasoning explaining why this option wins.',
        },
        keyConditionToFlip: {
          type: Type.STRING,
          description: 'Specific, concrete condition or threshold under which the alternative option would become superior.',
        },
        reversibility: {
          type: Type.STRING,
          description: 'Type 1 (High-consequence, difficult to reverse) or Type 2 (Reversible two-way door).',
        },
      },
      required: ['winningOptionName', 'decisiveFactor', 'rationale', 'keyConditionToFlip', 'reversibility'],
    },
    prosAndCons: {
      type: Type.ARRAY,
      description: 'Detailed pros and cons list for each option.',
      items: {
        type: Type.OBJECT,
        properties: {
          optionName: { type: Type.STRING },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                point: { type: Type.STRING, description: 'Concise headline of the advantage.' },
                detail: { type: Type.STRING, description: 'Concrete explanation with realistic mechanisms.' },
                impactWeight: { type: Type.INTEGER, description: 'Importance weight from 1 to 10.' },
                dimension: { type: Type.STRING, description: 'Dimension such as Financial, Time, Risk, Leverage, or Quality.' },
              },
              required: ['id', 'point', 'detail', 'impactWeight', 'dimension'],
            },
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                point: { type: Type.STRING, description: 'Concise headline of the drawback or risk.' },
                detail: { type: Type.STRING, description: 'Concrete explanation of the cost or downside.' },
                impactWeight: { type: Type.INTEGER, description: 'Severity weight from 1 to 10.' },
                dimension: { type: Type.STRING, description: 'Dimension such as Financial, Time, Risk, Leverage, or Quality.' },
              },
              required: ['id', 'point', 'detail', 'impactWeight', 'dimension'],
            },
          },
        },
        required: ['optionName', 'pros', 'cons'],
      },
    },
    comparisonTable: {
      type: Type.OBJECT,
      properties: {
        criteria: {
          type: Type.ARRAY,
          description: '5 to 6 rigorous evaluation criteria comparing all options.',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              criterion: { type: Type.STRING, description: 'Name of the evaluation criterion.' },
              description: { type: Type.STRING, description: 'What this criterion measures.' },
              weight: { type: Type.INTEGER, description: 'Default multiplier weight from 1 to 5.' },
              scores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    optionName: { type: Type.STRING },
                    score: { type: Type.INTEGER, description: 'Score from 1 to 10 (10 is always better/more favorable).' },
                    note: { type: Type.STRING, description: 'Specific justification for this score.' },
                  },
                  required: ['optionName', 'score', 'note'],
                },
              },
            },
            required: ['id', 'criterion', 'description', 'weight', 'scores'],
          },
        },
      },
      required: ['criteria'],
    },
    swot: {
      type: Type.OBJECT,
      description: 'Strategic SWOT analysis focused on the primary recommended path or decision subject.',
      properties: {
        focalSubject: {
          type: Type.STRING,
          description: 'The option or strategic move being analyzed in this SWOT grid.',
        },
        strengths: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              actionItem: { type: Type.STRING, description: 'How to capitalize on this internal strength.' },
            },
            required: ['title', 'detail', 'actionItem'],
          },
        },
        weaknesses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              actionItem: { type: Type.STRING, description: 'How to shore up or mitigate this internal weakness.' },
            },
            required: ['title', 'detail', 'actionItem'],
          },
        },
        opportunities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              actionItem: { type: Type.STRING, description: 'Concrete move to capture this external opportunity.' },
            },
            required: ['title', 'detail', 'actionItem'],
          },
        },
        threats: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              detail: { type: Type.STRING },
              actionItem: { type: Type.STRING, description: 'Contingency defense against this external threat.' },
            },
            required: ['title', 'detail', 'actionItem'],
          },
        },
      },
      required: ['focalSubject', 'strengths', 'weaknesses', 'opportunities', 'threats'],
    },
  },
  required: [
    'title',
    'category',
    'summary',
    'options',
    'tiebreakerVerdict',
    'prosAndCons',
    'comparisonTable',
    'swot',
  ],
};

const STRESS_TEST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scenarioPrompt: { type: Type.STRING },
    doesVerdictFlip: { type: Type.BOOLEAN },
    newWinningOption: { type: Type.STRING },
    impactAnalysis: {
      type: Type.STRING,
      description: '2-3 sentences explaining how this new constraint shifts the balance of pros, cons, and risks.',
    },
    adjustedCriteriaNote: {
      type: Type.STRING,
      description: 'Which specific criterion or SWOT factor is most affected and what action to take.',
    },
  },
  required: ['scenarioPrompt', 'doesVerdictFlip', 'newWinningOption', 'impactAnalysis', 'adjustedCriteriaNote'],
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post('/api/analyze-decision', async (req: Request, res: Response) => {
    try {
      const { decision, context } = req.body;
      if (!decision || typeof decision !== 'string' || !decision.trim()) {
        res.status(400).json({ error: 'Please provide a decision question or dilemma to analyze.' });
        return;
      }

      const prompt = `Analyze the following decision with intellectual rigor, concrete mechanisms, and zero clichés.

Decision Dilemma: "${decision.trim()}"
${context && context.trim() ? `Additional Context & Constraints: "${context.trim()}"` : ''}

Instructions:
1. Identify 2 or 3 clear, mutually distinct options implied or stated in the dilemma (if the user asks a "Should I do X?" question, frame Option A as executing X and Option B as the best realistic alternative / status quo).
2. Ensure option names in \`options\`, \`prosAndCons\`, and \`comparisonTable.criteria[].scores\` match each other exactly.
3. For \`comparisonTable\`, generate 5 to 6 high-signal criteria where a score of 10 always means most favorable/advantageous (e.g., for Risk/Cost, frame it as "Downside Protection & Budget Efficiency" so 10 = safest/most efficient).
4. Provide 4 to 5 substantive pros and 4 to 5 substantive cons per option with realistic impact weights (1-10).
5. Provide 3 to 4 concrete items per SWOT quadrant with actionable tactics.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are The Tiebreaker, a senior strategic decision analyst. You dissect complex personal, technical, financial, and business decisions using weighted pros and cons, multi-criteria decision matrices, and SWOT analysis. Avoid generic platitudes; provide specific second-order consequences, realistic trade-offs, and clear tie-breaking thresholds.',
          responseMimeType: 'application/json',
          responseSchema: DECISION_SCHEMA,
          temperature: 0.4,
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Model returned an empty analysis response.');
      }

      const parsed = JSON.parse(rawText.trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/analyze-decision:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze decision with Gemini.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/stress-test', async (req: Request, res: Response) => {
    try {
      const { decisionTitle, summary, currentWinner, options, whatIfScenario } = req.body;
      if (!whatIfScenario || typeof whatIfScenario !== 'string' || !whatIfScenario.trim()) {
        res.status(400).json({ error: 'Please provide a What-If scenario or constraint to test.' });
        return;
      }

      const prompt = `We are stress-testing an existing decision analysis under a new constraint or "What-If" scenario.

Decision: "${decisionTitle}"
Summary: "${summary}"
Options: ${Array.isArray(options) ? options.join(' vs. ') : ''}
Current Recommended Winner: "${currentWinner}"

New "What-If" Constraint / Scenario to Test: "${whatIfScenario.trim()}"

Evaluate whether this new constraint flips the recommendation to another option or reinforces the current winner, and explain the exact trade-off shift.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are The Tiebreaker strategic stress-testing engine. Evaluate how a new constraint or scenario changes the expected value and risk profile of a decision.',
          responseMimeType: 'application/json',
          responseSchema: STRESS_TEST_SCHEMA,
          temperature: 0.3,
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Model returned an empty stress-test response.');
      }

      const parsed = JSON.parse(rawText.trim());
      res.json(parsed);
    } catch (error: unknown) {
      console.error('Error in /api/stress-test:', error);
      const message = error instanceof Error ? error.message : 'Failed to run scenario stress test.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
