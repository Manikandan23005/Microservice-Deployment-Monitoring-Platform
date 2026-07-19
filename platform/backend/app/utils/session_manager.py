from typing import Dict, List, Optional
import threading

class SessionManager:
    """Thread-safe in-memory manager for conversational session state and entity tracking."""
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.sessions: Dict[str, List[Dict[str, str]]] = {}
        self.lock = threading.Lock()

    def get_history(self, session_id: Optional[str]) -> List[Dict[str, str]]:
        if not session_id:
            return []
        with self.lock:
            if session_id not in self.sessions:
                self.sessions[session_id] = []
            return self.sessions[session_id]

    def add_message(self, session_id: Optional[str], role: str, content: str) -> None:
        if not session_id:
            return
        with self.lock:
            if session_id not in self.sessions:
                self.sessions[session_id] = []
            
            self.sessions[session_id].append({"role": role, "content": content})
            # Keep history trimmed
            if len(self.sessions[session_id]) > self.max_history:
                self.sessions[session_id] = self.sessions[session_id][-self.max_history:]

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
