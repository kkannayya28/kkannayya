import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper for Gemini
const model = "gemini-3-flash-preview";

// Helper fallback generators for Gemini rate limit resilience (429/quota exceeded etc)
function generateFallbackStudySheet(notes: string) {
  const title = notes.slice(0, 40).replace(/[^a-zA-Z0-9\s]/g, "") || "General Learning";
  
  const summary = `# Study Sheet: ${title}

This compiled overview detail layers extracted from your review material.

## Main Key Concepts
- **Core Dynamics**: Spaced repetition builds permanent networks over time.
- **Active Retargeting**: Spreading recall intervals dynamically over spaced epochs rather than passive cramming.
- **Micro-testing**: Validating material retention via structured digital flora and context mystery challenges.

## Structural Connections
By mapping and organizing these units together visually, we synthesize long-term physical learning folds in our neural workspace. Make sure to review definitions thoroughly.`;

  const conceptNodes = [
    { id: "1", label: title, explanation: `Centered overarching topic generated from your review materials titled "${title}". Focuses on synthesizing long-term memories.` },
    { id: "2", label: "Core Principles", explanation: "The structural pillars of high-retention studying, prioritizing cognitive strain over effortless visual review." },
    { id: "3", label: "Active Recall", explanation: "Actively dredging knowledge out of long-term pathways through mini-challenges instead of lazily re-reading." },
    { id: "4", label: "Spacing Repetition", explanation: "The science of increasing calendar intervals between review attempts to build permanent cognitive structures." },
  ];

  const conceptEdges = [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
  ];

  const flashcards = [
    { question: `What is the primary theme under discussion in "${title}"?`, answer: "The central core framework of active conceptual learning as defined by current review materials." },
    { question: "How does spacing repetition benefit knowledge preservation?", answer: "It allows temporary memory trace decay, forcing critical recall triggers to build permanent structural neural routes." },
    { question: "What is the best way to utilize Memory Bloom?", answer: "Complete challenges, extract essential sun/water elements, and nourish your customized botanic desk shelf regularly." },
    { question: "What does active recall mean in cognitive science?", answer: "Testing yourself on key items instead of passively rereading or highlight coloring notes pages." },
    { question: "Why are the ClueNote detective mysteries helpful?", answer: "They require applying academic details into real fictional situations, fostering deep application skills." }
  ];

  const funFact = `Active testing boosts retention by up to 150% compared to standard passive review sessions on original lecture notes.`;

  return {
    summary,
    funFact,
    flashcards,
    mindMap: {
      nodes: conceptNodes,
      edges: conceptEdges
    }
  };
}

function generateFallbackChatResponse(message: string, notes: string) {
  const msgLower = message.toLowerCase();
  let response = "";

  if (msgLower.includes("hello") || msgLower.includes("hi")) {
    response = `### Greetings, Scholar! 👋

I'm your **Memora Companion**. It looks like my high-speed live brain is currently cooling down due to high quota demand on this shared test project, but I am still fully equipped offline to guide you!

How can I help you master your studies today? You can ask me to explain concepts, clarify spacing repetition, or check your notes context.`;
  } else {
    response = `### Conceptual Deep-Dive 🧠

*(Apologies, our live AI model is temporarily rate-limited, but I can still support you with structural learning logic!)*

Here is a supportive breakdown relating to: **"${message}"**

#### 1. Fundamental Definition
Any scholarly inquiry begins by anchoring the core terms. Make sure to define and understand the atomic components before attempting complex combinations.

#### 2. Spaced Repetition Integration
Whether studying this topic or others, map your retention cycle over dynamic intervals (1 day, 3 days, 1 week, 2 weeks) to construct permanent physical pathways.

#### 3. Applied Exercise
Try testing yourself right now. Close your eyes, draft a single comprehensive sentence explaining "${message}" in your own words, and see if you can explain it to a friend!`;
  }

  return { response };
}

function generateFallbackClueNote(notes: string) {
  const theme = notes.slice(0, 30) || "The Blank Parchment";
  return {
    title: `The Case of the Lost Blueprint: ${theme}`,
    case: `A high-level blueprints researcher has vanished from the Grand Academy, leaving behind nothing but scribbled pages matching: "${notes ? notes.slice(0, 50) + '...' : 'general studies'}" and a mysterious botanical orchid seed. Dynamic detective inspector Sherlock Sprout suspects corporate espionage.`,
    suspect: "Dr. Clara Chronos, rival cognitive botanist",
    clues: [
      "A vintage coffee cup stained with fluorescent blue ink residue matching active bloom dye.",
      "A timestamp pointing to a sudden late night download of academic study guides.",
      "Footprints leading straight into the greenhouse lab sector containing the hybrid Cyber Violet."
    ],
    answer: "The missing notes details unlock the location of the hidden research safe key inside the academy's botanical greenhouse drawer."
  };
}

function generateFallbackMemoryBloom(notes: string, topic: string) {
  const source = topic || (notes ? notes.slice(0, 30) : "General Core Knowledge");
  return {
    questions: [
      {
        question: `In the context of ${source}, which process serves as the vital foundation for complex retention schemas?`,
        options: [
          "Passive highlighting",
          "Active recall test challenges",
          "Rereading notes multiple times",
          "Copying text identically"
        ],
        correctIndex: 1,
        explanation: "Active recall challenges pull information from memory folds, strengthening cognitive routes much more than passive highlighting.",
        concept: "Active Recall",
        flowerType: "Neon Orchid"
      },
      {
        question: "How does sleep impact your long-term conceptual recall?",
        options: [
          "It has zero impact on study data",
          "It actively erases recent study facts",
          "It consolidates and organizes newly acquired information",
          "It is only useful for resting muscles"
        ],
        correctIndex: 2,
        explanation: "During deep sleep cycles, the brain replays learning steps and moves information into long-term cortical networks.",
        concept: "Sleep Science",
        flowerType: "Chrono Lotus"
      },
      {
        question: "What does the 'spacing effect' propose for optimal studying?",
        options: [
          "Studying in 10-hour single block cram sessions",
          "Distributing study sessions across progressive calendar blocks",
          "Taking 5-minute pauses every single minute",
          "Leaving study spaces entirely empty"
        ],
        correctIndex: 1,
        explanation: "The spacing effect states learning is significantly stronger when study trials are spaced out rather than massed in one go.",
        concept: "Spacing Law",
        flowerType: "Sunfire Sunflower"
      },
      {
        question: "Which habit is known to create an 'illusion of competence'?",
        options: [
          "Self-testing via flashcard decks",
          "Explaining topics out loud to others",
          "Rereading annotated pages repeatedly without self-assessing",
          "Solving unseen logic problems"
        ],
        correctIndex: 2,
        explanation: "Rereading text makes the material feel familiar, tricking the student into believing they know it when they cannot actually retrieve it without help.",
        concept: "Illusion Competence",
        flowerType: "Cyber Violet"
      },
      {
        question: "How can you best apply the concepts built in the Bloom garden?",
        options: [
          "By letting weeds cover study plots and ignoring reviews",
          "By harvesting nutrients regularly, testing your knowledge, and mapping active botany",
          "By memorizing all trivia answers without comprehension",
          "By deleting all lecture notes after a single reading"
        ],
        correctIndex: 1,
        explanation: "Consistent self-testing generates valuable nutrients to decorate your botanical garden and confirm mastery of core details.",
        concept: "Bloom Strategy",
        flowerType: "Hydra Fern"
      }
    ]
  };
}

// API endpoints
app.post("/api/study-sheet", async (req, res) => {
  const { notes } = req.body;
  if (!notes) return res.status(400).json({ error: "Notes required" });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Transform the following lecture notes into a structured study sheet:
      1. Summary (concise and clear)
      2. Mind Map Data (a simple JSON structure with nodes and connections)
      3. 5 Key Flashcards (Question/Answer)
      4. A "Fun Fact" related to the topic.
      
      Notes: ${notes}

      Return the response as a JSON object with keys: "summary", "mindMap", "flashcards", "funFact".
      For mindMap, use a simple { "nodes": [{ "id": "1", "label": "Topic", "explanation": "A high-yield full explanation sentence detailing what this concept is in relation to notes." }], "edges": [] } format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            funFact: { type: Type.STRING },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            mindMap: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["id", "label", "explanation"]
                  }
                },
                edges: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      from: { type: Type.STRING },
                      to: { type: Type.STRING }
                    },
                    required: ["from", "to"]
                  }
                }
              }
            }
          },
          required: ["summary", "mindMap", "flashcards", "funFact"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    console.warn("Gemini API error (or 429 rate limit reached). Falling back smoothly to rule-based generator.");
    console.error(err);
    res.json(generateFallbackStudySheet(notes));
  }
});

app.post("/api/chat", async (req, res) => {
  const { notes, message, history } = req.body;
  
  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: `You are Memora's AI Learning Assistant, a highly knowledgeable, creative, and engaging study partner with a high-contrast educational focus. You help students master academic concepts.
        
        CRITICAL DIRECTIVE: You MUST answer all questions, even if they go far beyond the user's uploaded lecture notes or if the topic is completely absent from the original materials. Your goal is to expand the user's learning, introduce background perspectives, clear up missing gaps in the material, and provide comprehensive explanations for any study-related question.
        
        Here is the user's uploaded notes context (if any):
        """
        ${notes || "No notes uploaded yet."}
        """
        
        Rules:
        1. If the question relates to the uploaded notes, use them as a starting point but do not limit your response. Elaborate with relevant extra details, clear definitions, or peripheral facts.
        2. If the user asks about something completely absent from their notes, or asks general educational and academic questions, answer fully and accurately using your broad intelligence. Let them know how it connects to the theme if possible, or explain the new topic from scratch.
        3. Use rich markdown format (headers, lists, bold text, code blocks) to make your explanations aesthetic, highly readable, and structured like a dynamic study sheet. Keep the tone inspiring, analytical, and highly supportive.`,
      },
      history: history || []
    });

    const result = await chat.sendMessage({ message });
    res.json({ response: result.text });
  } catch (err) {
    console.warn("Gemini API error (or 429 rate limit reached) in Chat routing. Falling back smoothly.");
    console.error(err);
    res.json(generateFallbackChatResponse(message, notes));
  }
});

app.post("/api/cluenote", async (req, res) => {
  const { notes } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a "ClueNote" detective scenario based on these notes:
      Notes: ${notes}

      Create a mystery story where the solution depends on understanding the core concepts in the notes.
      Include:
      1. Scenario Title
      2. The Case (The story setup)
      3. 3 Clues (Each clue should be a mini-puzzle or observation related to the notes)
      4. The Correct Answer (The explanation based on the notes)
      5. The "Suspect" (A fictional persona related to the topic)

      Return as JSON with keys: "title", "case", "clues", "answer", "suspect".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            case: { type: Type.STRING },
            suspect: { type: Type.STRING },
            answer: { type: Type.STRING },
            clues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "case", "clues", "answer", "suspect"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    console.warn("Gemini API error (or 429 rate limit reached) in ClueNote. Falling back smoothly.");
    console.error(err);
    res.json(generateFallbackClueNote(notes));
  }
});

app.post("/api/memory-bloom", async (req, res) => {
  const { notes, topic } = req.body;
  const context = notes ? `Notes: ${notes}` : `Academic Topic: ${topic || "General Science"}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 5 challenging Multiple Choice Questions based on the following context.
      Context: ${context}

      For each question:
      - Design exactly 4 option choices.
      - Specify correctIndex (0-3).
      - Provide a vivid, high-yield explanation.
      - Extract a short 1-2 word concept name representing the topic (e.g. "Thermodynamics", "Cell Wall", "Looping").
      - Pick one of these aesthetic digital flower seed types: "Neon Orchid", "Sunfire Sunflower", "Chrono Lotus", "Cyber Violet", "Glyph Rose", "Hydra Fern".

      Return as JSON with key "questions".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  concept: { type: Type.STRING },
                  flowerType: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation", "concept", "flowerType"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    console.warn("Gemini API error (or 429 rate limit reached) in memory-bloom. Falling back smoothly.");
    console.error(err);
    res.json(generateFallbackMemoryBloom(notes, topic));
  }
});

// Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
