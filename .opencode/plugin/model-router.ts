import type { Plugin } from "@opencode-ai/plugin";

// Dynamic model router: switch the LLM per agent so casual/build chat uses a
// cheap model while plan mode gets a strong reasoning model — without the user
// manually hitting Tab every time.
const PROVIDER = "arise-bifrost";

const MODEL_BY_AGENT: Record<string, string> = {
  plan: `${PROVIDER}/dashscope/deepseek-v4-pro`,
  build: `${PROVIDER}/dashscope/qwen3.7-flash`,
};

const DEFAULT_MODEL = `${PROVIDER}/dashscope/qwen3.7-flash`;

function splitModel(id: string) {
  const [providerID, ...rest] = id.split("/");
  return { providerID, modelID: rest.join("/") };
}

export default (async () => {
  return {
    "chat.message": async (input, output) => {
      const agent = input.agent ?? "build";
      const target = MODEL_BY_AGENT[agent] ?? DEFAULT_MODEL;
      const { providerID, modelID } = splitModel(target);

      // Mutate the saved user message's model. The assistant turn resolves its
      // model from here, so this routes the actual request per agent.
      output.message.model = { providerID, modelID };
    },
  };
}) satisfies Plugin;
