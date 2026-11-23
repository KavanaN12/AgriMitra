import os
import pytest
from app.main import resolve_frontend_dist

def test_resolve_frontend_dist():
    """Verify that frontend dist directory is resolved properly."""
    resolved = resolve_frontend_dist()
    assert resolved is not None
    assert os.path.isdir(resolved)
    assert os.path.isfile(os.path.join(resolved, "index.html"))
