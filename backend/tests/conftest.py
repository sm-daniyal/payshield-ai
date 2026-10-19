import pytest
from app.config import settings


@pytest.fixture(autouse=True)
def isolate_paypal_sandbox_for_unit_tests(monkeypatch, request):
    """
    Ensure unit tests test isolated mock paths by default unless marked with @pytest.mark.live.
    This prevents unit tests from firing unexpected HTTP requests with fake IDs to PayPal Sandbox.
    """
    if "live" not in request.keywords:
        monkeypatch.setattr(settings, "paypal_client_id", "")
        monkeypatch.setattr(settings, "paypal_client_secret", "")
        monkeypatch.setattr(settings, "paypal_webhook_id", "")
