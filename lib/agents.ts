export type AgentRecord = {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
};

export const masterPrompt =
  "You are ORIVOO AI, a collaborative studio operating system. Coordinate specialized agents, preserve project context, produce useful artifacts, and keep outputs grounded in the user's request.";

export const futureAgentProviders = ["OpenAI", "Claude", "Groq", "Gemini"];

export const studioPrompts: Record<string, string> = {
  "Research Agent":
    "Studio Prompt: Investigate context, identify evidence gaps, and organize findings into a research-ready structure.",
  "Code Agent":
    "Studio Prompt: Translate goals into architecture, implementation steps, edge cases, and verification tasks.",
  "Legal Agent":
    "Studio Prompt: Frame legal drafting considerations, risks, assumptions, and review checkpoints.",
  "Business Agent":
    "Studio Prompt: Convert the request into strategy, operations, positioning, monetization, and execution priorities.",
  "Civic Agent":
    "Studio Prompt: Evaluate civic stakeholders, public processes, policy constraints, and community impact.",
  "Design Agent":
    "Studio Prompt: Shape user experience, visual hierarchy, accessibility, brand direction, and interaction flow.",
};

export function getStudioPrompt(agentName: string) {
  return (
    studioPrompts[agentName] ??
    "Studio Prompt: Apply the most relevant ORIVOO studio expertise to the user request."
  );
}

export function buildPromptStack(input: {
  agent: AgentRecord;
  projectMemory: string;
  conversationHistory: string;
  userMessage: string;
}) {
  return [
    `Master Prompt:\n${masterPrompt}`,
    `Studio Prompt:\n${getStudioPrompt(input.agent.name)}`,
    `Agent Prompt:\n${input.agent.system_prompt}`,
    `Project Memory:\n${input.projectMemory || "No project memory saved yet."}`,
    `Conversation History:\n${
      input.conversationHistory || "No conversation history was provided."
    }`,
    `User Message:\n${input.userMessage}`,
  ].join("\n\n---\n\n");
}

export function buildAgentReasoning(input: {
  agent: AgentRecord;
  projectMemory: string;
  conversationHistory: string;
  userMessage: string;
}) {
  const memorySignal = input.projectMemory
    ? "project memory"
    : "the current request";
  const historySignal = input.conversationHistory
    ? "conversation history"
    : "no prior conversation history";

  return [
    `${input.agent.name} reviewed ${memorySignal}, ${historySignal}, and the user message independently.`,
    `It applied its studio prompt to identify the most useful contribution before the merge step.`,
  ].join(" ");
}

export function buildAgentOutput(input: {
  agent: AgentRecord;
  userMessage: string;
}) {
  const base = `User task: ${input.userMessage}`;

  switch (input.agent.name) {
    case "Research Agent":
      return [
        "## Research Agent Output",
        base,
        "- Define the central question and separate known facts from assumptions.",
        "- Identify source requirements, evidence gaps, and validation checkpoints.",
        "- Recommend a research artifact with findings, analysis, recommendations, and sources.",
      ].join("\n");
    case "Code Agent":
      return [
        "## Code Agent Output",
        base,
        "- Map the task into data model, server action, UI, and validation layers.",
        "- Call out integration risks, permissions, and regression checks.",
        "- Recommend tests or build checks before release.",
      ].join("\n");
    case "Legal Agent":
      return [
        "## Legal Agent Output",
        base,
        "- Identify legal context, compliance questions, and drafting assumptions.",
        "- Separate operational guidance from items requiring professional review.",
        "- Recommend preserving citations, version history, and approval notes.",
      ].join("\n");
    case "Business Agent":
      return [
        "## Business Agent Output",
        base,
        "- Clarify audience, value proposition, business constraints, and success metrics.",
        "- Translate the request into execution priorities and owner-ready next steps.",
        "- Recommend artifact outputs that support planning, sales, or operations.",
      ].join("\n");
    case "Civic Agent":
      return [
        "## Civic Agent Output",
        base,
        "- Identify public stakeholders, policy context, and process dependencies.",
        "- Flag accessibility, transparency, and community-impact considerations.",
        "- Recommend a civic report or briefing artifact for follow-up.",
      ].join("\n");
    case "Design Agent":
      return [
        "## Design Agent Output",
        base,
        "- Translate the request into user experience goals and visual hierarchy.",
        "- Identify brand, accessibility, interaction, and information architecture needs.",
        "- Recommend concrete design artifacts for execution.",
      ].join("\n");
    default:
      return [
        `## ${input.agent.name} Output`,
        base,
        "- Analyze the request through this agent's specialty.",
        "- Produce a concise contribution for the merged ORIVOO response.",
      ].join("\n");
  }
}

export function mergeAgentOutputs(input: {
  title: string;
  userMessage: string;
  outputs: Array<{
    agentName: string;
    output: string;
  }>;
}) {
  return [
    `# ${input.title}`,
    "",
    "## Merged ORIVOO Agent Output",
    "",
    `ORIVOO assigned ${input.outputs.length} specialized agent${
      input.outputs.length === 1 ? "" : "s"
    } to work independently on the request: ${input.userMessage}`,
    "",
    "## Integrated Plan",
    "",
    "- Use the specialist outputs below as parallel perspectives.",
    "- Resolve conflicts by favoring project goals, user constraints, and verified context.",
    "- Convert the final direction into project artifacts, implementation tasks, or follow-up research as needed.",
    "",
    "## Agent Contributions",
    "",
    ...input.outputs.flatMap((item) => [
      `### ${item.agentName}`,
      "",
      item.output,
      "",
    ]),
    "## Next Steps",
    "",
    "- Review each agent section independently.",
    "- Promote the merged response into a working artifact.",
    "- Re-run with additional agents if the task needs broader coverage.",
  ].join("\n");
}
