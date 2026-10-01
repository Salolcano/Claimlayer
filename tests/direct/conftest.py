"""Shared helpers for direct mode tests."""

import json


def to_hex(addr_bytes):
    """Convert address bytes to the checksummed hex the contract stores."""
    if hasattr(addr_bytes, "as_hex"):
        return addr_bytes.as_hex
    from genlayer.types import Address

    return Address(addr_bytes).as_hex


def mock_json_llm(vm, prompt_pattern, response):
    """Register a JSON object as the model's raw text answer."""
    vm.mock_llm(prompt_pattern, json.dumps(json.dumps(response)))


def mock_raw_llm(vm, prompt_pattern, text):
    """Register an arbitrary string (valid or malformed) as the model's raw answer."""
    vm.mock_llm(prompt_pattern, json.dumps(text))
