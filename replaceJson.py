import re

def update_json_keys(data, key_path, replacement_keys):
    # Regular expression to match keys that start with a date and end with '|abc'
    pattern = re.compile(r'^(\d{4}-\d{2}-\d{2}).*\|abc$')
    
    try:
        # Navigate to the target dictionary using the key path
        target_dict = data
        for elem in key_path.split('.'):
            target_dict = target_dict.get(elem, {})
            if not isinstance(target_dict, dict):
                return data  # If not a dict, return original data

        # Ensure that target_dict is a dictionary
        if not isinstance(target_dict, dict):
            return data

        # Keep track of the number of replacements made
        replacements = 0
        
        # Iterate over a copy of the keys to avoid modifying the dictionary while iterating
        for key in list(target_dict.keys()):
            if replacements >= len(replacement_keys):
                break
            
            # Check if the key matches the pattern
            if pattern.match(key):
                # Replace the key with the corresponding replacement key
                new_key = replacement_keys[replacements]
                target_dict[new_key] = target_dict.pop(key)
                replacements += 1

    except Exception as e:
        print(f"Error encountered: {e}")
    
    return data

# Sample JSON data
data = {
    "person": {
        "name": "John",
        "age": 30,
        "address": {
            "2024-01-01SomeCity|abc": {
                "zipcode": "10001"
            },
            "2023-12-01AnotherCity|abc": {
                "zipcode": "20002"
            },
            "2022-11-15OldCity|xyz": {
                "zipcode": "30003"
            }
        }
    }
}

# Key path to focus the search
key_path = 'person.address'

# Replacement keys for the first two instances
replacement_keys = ["NewCity1|abc", "NewCity2|abc"]

# Update the JSON keys
updated_data = update_json_keys(data, key_path, replacement_keys)

import json
print(json.dumps(updated_data, indent=2))
