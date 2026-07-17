# --- GitHub REST API Client ---
import httpx
from typing import List, Dict, Any, Optional
from app.core.logging import logger
from shared.exceptions import DevOpsNexusException

class GitHubClient:
    """Manages queries to the GitHub REST API."""
    def __init__(self, token: Optional[str] = None):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        if token:
            self.headers["Authorization"] = f"token {token}"

    def get_branches(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/branches"
        try:
            with httpx.Client(headers=self.headers, timeout=5.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise DevOpsNexusException(f"GitHub returned error {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch GitHub branches: {str(e)}")
            raise DevOpsNexusException(f"GitHub connection failed: {str(e)}")

    def get_commits(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/commits"
        try:
            with httpx.Client(headers=self.headers, timeout=5.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise DevOpsNexusException(f"GitHub returned error {response.status_code}: {response.text}")
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch GitHub commits: {str(e)}")
            raise DevOpsNexusException(f"GitHub connection failed: {str(e)}")

    def get_workflow_runs(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/actions/runs"
        try:
            with httpx.Client(headers=self.headers, timeout=5.0) as client:
                response = client.get(url)
                if response.status_code != 200:
                    raise DevOpsNexusException(f"GitHub returned error {response.status_code}: {response.text}")
                return response.json().get("workflow_runs", [])
        except Exception as e:
            logger.error(f"Failed to fetch GitHub workflow runs: {str(e)}")
            raise DevOpsNexusException(f"GitHub connection failed: {str(e)}")

github_client = GitHubClient()
