# --- OpenAI-Groq LLM Client Wrapper ---
from openai import OpenAI
from app.core.settings import settings
from app.core.logging import logger
from shared.exceptions import DevOpsNexusException

class LLMClient:
    """Manages completions request calls to Groq API using OpenAI's client SDK."""
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = settings.LLM_MODEL or "llama-3.3-70b-versatile"
        self.client = None
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not configured. AI completions will run in mock fallback mode.")
            return
        try:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )
            logger.info(f"Initialized LLMClient with Groq endpoint and model: {self.model}")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client SDK: {str(e)}")

    def generate_chat_response(self, prompt: str, system_prompt: str = "You are a DevOps Incident Analysis Assistant.") -> str:
        if not self.client:
            raise DevOpsNexusException("LLM Client is not initialized due to missing GROQ_API_KEY configuration.")
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API completions request failed: {str(e)}")
            raise DevOpsNexusException(f"LLM completions failed: {str(e)}")

llm_client = LLMClient()
