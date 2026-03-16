function getSpeechSynthesis() {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
}

export function stopSpeech() {
  const synthesis = getSpeechSynthesis();

  if (synthesis) {
    synthesis.cancel();
  }
}

export function speakVietnamese(text, enabled) {
  if (!enabled || !text) {
    return;
  }

  const synthesis = getSpeechSynthesis();

  if (!synthesis) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "vi-VN";

  synthesis.cancel();
  synthesis.speak(utterance);
}
