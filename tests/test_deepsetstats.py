"""Test module for deepsetstats."""

from deepsetstats import __author__, __email__, __version__


def test_project_info():
    """Test __author__ value."""
    assert __author__ == "David Amat"
    assert __email__ == "daolondrizdaolondriz@gmail.com"
    assert __version__ == "0.0.0"
