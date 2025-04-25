import os
from openai import AzureOpenAI
import re

def read_env_file(file_path):
    env_vars = {}
    try:
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = re.sub(r'^["\'](.*)["\']$', r'\1', value)
                    env_vars[key.strip()] = value.strip()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return env_vars

# Read environment variables directly from .env.local (note the leading space)
env_vars = read_env_file(' .env.local')

print("Environment variables loaded:")
print(f"Endpoint: {env_vars.get('AZURE_OPENAI_ENDPOINT')}")
print(f"Deployment: {env_vars.get('AZURE_OPENAI_DEPLOYMENT_NAME')}")
print(f"API Key exists: {bool(env_vars.get('AZURE_OPENAI_API_KEY'))}")

client = AzureOpenAI(
    api_version="2023-12-01-preview",
    azure_endpoint=env_vars.get('AZURE_OPENAI_ENDPOINT'),
    api_key=env_vars.get('AZURE_OPENAI_API_KEY')
)

# Test the client with examples
try:
    response = client.chat.completions.create(
        model=env_vars.get('AZURE_OPENAI_DEPLOYMENT_NAME'),
        messages=[
            {"role": "system", "content": "You are a hotel manager responding to guest reviews about your property."},
            # First example (input-output pair)
            {"role": "user", "content": "Everything was fantastic, the staff was excellent in the restaurant and Front Desk!"},
            {"role": "assistant", "content": "It's wonderful to hear that our staff, service, and facilities consistently exceeded your expectations. Our hope is to deliver a memorable experience to every guest and patron who is gracious enough to choose us to be their host.  We hope to have the opportunity to welcome you back to Culver City in the future.  It was a true pleasure having you with us-- cheers!"},
            # Second example
            {"role": "user", "content": "The girl at the Front Desk was wonderful.  Great stay."},
            {"role": "assistant", "content": "I wish I could provide some insight into who welcomed you to the hotel, but it's difficult to say when our Front Desk team is so flush with stars! Whoever she was, she'll be ready to warmly welcome you back to Palihotel Culver City on the occasion of your next visit. Your patronage is very much appreciated & we'll be looking forward to hosting you again soon. Take care & thank you for your kind remarks!"},
            # Actual user question
            {"role": "user", "content": "Good hotel.  Love staying here.  Wish the restaurant had a bigger menu and was open during the week."}
            {"role": "assistant", "content": "I'm delighted to hear that you fell in love with Palihotel Culver City, just as we do every day! We've taken your comments regarding the dining options under advisement and will seek to improve upon it for your next visit, which I hope will be very soon!"}
        ],
        temperature=0.7  # Adjust for more/less creative responses
    )
    print("\nResponse:", response.choices[0].message.content)
except Exception as e:
    print("\nError:", str(e)) 