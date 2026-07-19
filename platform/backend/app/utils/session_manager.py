from typing import Dict, List, Optional
import json
from app.core.cache import cache_client

class SessionManager:
    """Thread-safe manager that persists conversational sessions and entity references inside Redis/Local Cache."""
    def __init__(self, max_history: int = 10):
        self.max_history = max_history

    def get_history(self, session_id: Optional[str]) -> List[Dict[str, str]]:
        if not session_id:
            return []
        try:
            key = f"session:{session_id}"
            data = cache_client.get(key)
            if data:
                return json.loads(data)
        except Exception:
            pass
        return []

    def add_message(self, session_id: Optional[str], role: str, content: str) -> None:
        if not session_id:
            return
        try:
            key = f"session:{session_id}"
            history = self.get_history(session_id)
            history.append({"role": role, "content": content})
            if len(history) > self.max_history:
                history = history[-self.max_history:]
            cache_client.set(key, json.dumps(history), ex_seconds=86400) # Persist sessions for 24 hours
        except Exception:
            pass

    def resolve_target_service(self, session_id: Optional[str], current_prompt: str) -> Optional[str]:
        """Scans current prompt and chat history to identify which service entity is currently being referred to."""
        services = ["auth", "users", "products", "orders", "payment", "notification", "gateway", "frontend"]
        
        # 1. Direct mention in the prompt takes priority
        lower_prompt = current_prompt.lower()
        for svc in services:
            if svc in lower_prompt:
                return svc

        # 2. Lookback through historical context in reverse chronological order
        history = self.get_history(session_id)
        for msg in reversed(history):
            content_lower = msg["content"].lower()
            for svc in services:
                if svc in content_lower:
                    return svc
                    
        return None

session_manager = SessionManager()
