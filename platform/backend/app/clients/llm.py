# --- Pluggable AI completions client ---
from openai import OpenAI
from app.core.settings import settings
from app.core.logging import logger
from shared.exceptions import DevOpsNexusException

class LLMClient:
    """Manages chat completions utilizing the OpenAI client SDK for pluggable backends."""
    
    def generate_chat_response(self, prompt: str, system_prompt: str = "You are a DevOps Assistant.") -> str:
        provider = (settings.AI_PROVIDER or "groq").lower()
        
        # Resolve target configurations
        if provider == "groq":
            api_key = settings.GROQ_API_KEY
            base_url = "https://api.groq.com/openai/v1"
            model = settings.LLM_MODEL or "llama-3.3-70b-versatile"
            if not api_key:
                raise DevOpsNexusException("GROQ_API_KEY is not configured. Please configure it in your .env file.")
        elif provider == "openai":
            api_key = settings.OPENAI_API_KEY
            base_url = settings.OPENAI_BASE_URL or "https://api.openai.com/v1"
            model = settings.LLM_MODEL or "gpt-4-turbo"
            if not api_key:
                raise DevOpsNexusException("OPENAI_API_KEY is not configured. Please configure it in your .env file.")
        elif provider == "ollama":
            api_key = "ollama"
            base_url = f"{settings.OLLAMA_HOST or 'http://localhost:11434'}/v1"
            model = settings.LLM_MODEL or "llama3"
        elif provider == "lmstudio":
            api_key = "lmstudio"
            base_url = settings.LMSTUDIO_HOST or "http://localhost:1234/v1"
            model = settings.LLM_MODEL or "local-model"
        else:
            raise DevOpsNexusException(f"Unsupported AI provider: {provider}")

        try:
            client = OpenAI(base_url=base_url, api_key=api_key)
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"AI completions failed for provider {provider}: {str(e)}")
            raise DevOpsNexusException(f"AI integration request failed: {str(e)}")

llm_client = LLMClient()
