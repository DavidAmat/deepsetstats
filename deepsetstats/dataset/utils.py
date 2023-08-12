import json
from typing import Dict


def master_prettify(input_json: Dict):
    final_prettified_json = json.dumps(input_json, indent=4)
    return final_prettified_json
