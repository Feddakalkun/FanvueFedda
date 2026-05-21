function getProviderPriority(config = {}) {
  return {
    image: config.image || ["comfyui-local", "venice", "openai"],
    chat: config.chat || ["ollama-local", "grok", "openai", "venice"],
    emergency: config.emergency || ["venice", "grok", "openai"],
  };
}

function selectProvider(kind, priorityConfig) {
  const list = getProviderPriority(priorityConfig)[kind] || [];
  return list[0] || null;
}

module.exports = {
  getProviderPriority,
  selectProvider,
};
