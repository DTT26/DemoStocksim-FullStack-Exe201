import os
import httpx
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any

class LLMClient:
    """
    VIP Hybrid LLM Client supporting both Google Gemini API and OpenAI API.
    Dynamically loads .env on check so changes take effect immediately without restart.
    Supports smart fallback and multi-model compatibility.
    """

    def __init__(self):
        self.last_error: Optional[str] = None
        self._reload_env()

    def _reload_env(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        for env_path in [
            os.path.join(base_dir, ".env"),
            os.path.join(base_dir, "..", "backend", ".env"),
            os.path.join(base_dir, "..", ".env"),
        ]:
            if os.path.exists(env_path):
                load_dotenv(dotenv_path=env_path, override=True)
        self.gemini_key = os.getenv("GEMINI_API_KEY", "").strip().strip("'\"")
        self.openai_key = os.getenv("OPENAI_API_KEY", "").strip().strip("'\"")

    def is_configured(self) -> bool:
        self._reload_env()
        return bool(self.gemini_key or self.openai_key)

    def generate_text(self, system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> Optional[str]:
        self.last_error = None
        if not self.is_configured():
            return None

        # Priority 1: Google Gemini (Free & High Rate Limits)
        if self.gemini_key:
            try:
                res = self._call_gemini(system_prompt, user_prompt, max_tokens)
                if res:
                    return res
            except Exception as e:
                self.last_error = str(e)
                print(f"Gemini API call failed, attempting fallback: {e}")

        # Priority 2: OpenAI (GPT-4o-mini)
        if self.openai_key:
            try:
                res = self._call_openai(system_prompt, user_prompt, max_tokens)
                if res:
                    return res
            except Exception as e:
                self.last_error = str(e)
                print(f"OpenAI API call failed: {e}")

        return None

    def _call_gemini(self, system_prompt: str, user_prompt: str, max_tokens: int = 650) -> Optional[str]:
        models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.7-flash"]
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
            payload = {
                "system_instruction": {
                    "parts": [{"text": system_prompt}]
                },
                "contents": [
                    {
                        "parts": [{"text": user_prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 1500,
                    "topP": 0.95,
                    "thinkingConfig": {
                        "thinkingBudget": 0
                    }
                }
            }
            try:
                with httpx.Client(timeout=12.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            texts = [p.get("text", "") for p in parts if "text" in p]
                            full_text = "\n".join(texts).strip()
                            if full_text:
                                self.last_error = None
                                return full_text
                    else:
                        err_json = resp.json() if "application/json" in resp.headers.get("content-type", "") else {}
                        err_msg = err_json.get("error", {}).get("message", resp.text)
                        self.last_error = f"Google Gemini ({resp.status_code}): {err_msg}"
                        print(f"Gemini ({model}) HTTP {resp.status_code}: {resp.text}")
                        # If unauthorized or permission denied, the key is invalid; no need to loop models
                        if resp.status_code in [400, 401, 403]:
                            break
            except Exception as ex:
                self.last_error = str(ex)
                print(f"Error calling {model}: {ex}")
                continue
        return None

    def _call_openai(self, system_prompt: str, user_prompt: str, max_tokens: int) -> Optional[str]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.4,
            "max_tokens": max_tokens
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get("choices", [])
                if choices and "message" in choices[0]:
                    return choices[0]["message"].get("content", "")
            else:
                print(f"OpenAI HTTP {resp.status_code}: {resp.text}")
        return None

llm_client = LLMClient()
