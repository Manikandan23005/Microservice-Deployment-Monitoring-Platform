# --- GitOps Router Unit Tests ---
from unittest.mock import patch, MagicMock

def test_github_workflows_status(client):
    mock_runs = [{"id": 456, "name": "Build", "status": "completed", "conclusion": "success", "head_branch": "main", "event": "push", "html_url": "#"}]
    with patch("app.clients.github.github_client.get_workflow_runs", return_value=mock_runs):
        response = client.get("/api/v1/gitops/github/workflows")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "Build"

def test_github_repo_details(client):
    mock_commits = [{"sha": "abc123def", "commit": {"author": {"name": "Satoru"}, "message": "initial commit"}}]
    mock_branches = [{"name": "main"}, {"name": "dev"}]
    with patch("app.clients.github.github_client.get_commits", return_value=mock_commits), \
         patch("app.clients.github.github_client.get_branches", return_value=mock_branches):
        response = client.get("/api/v1/gitops/github/repo-details")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "main" in data["data"]["branches"]
        assert data["data"]["latest_commits"][0]["sha"] == "abc123d"

def test_argocd_applications(client):
    mock_apps = [{"metadata": {"name": "auth-service"}, "status": {"sync": {"status": "Synced"}, "health": {"status": "Healthy"}}, "spec": {"source": {"repoURL": "http://git", "path": "helm/auth"}}}]
    with patch("app.clients.argocd.argocd_client.list_applications", return_value=mock_apps):
        response = client.get("/api/v1/gitops/argocd/applications")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["data"]) == 1
        assert data["data"][0]["name"] == "auth-service"

def test_argocd_sync(client):
    with patch("app.clients.argocd.argocd_client.sync_application", return_value={"message": "synchronized"}):
        response = client.post("/api/v1/gitops/argocd/applications/auth-service/sync")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

def test_argocd_rollback(client):
    with patch("app.clients.argocd.argocd_client.rollback_application", return_value={"message": "rolled back"}):
        response = client.post("/api/v1/gitops/argocd/applications/auth-service/rollback?revision=2")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
