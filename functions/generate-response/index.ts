import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

// Initialize the Azure OpenAI client with hardcoded values
const client = new OpenAIClient(
  "https://pgmai.openai.azure.com/", // Your Azure OpenAI endpoint
  new AzureKeyCredential("Ct9JSYy5Ewlwn9NnWmAik6ynJLl3VvJ9vodQTC3DTn5G9hgnrwnZJQQJ99BDACYeBjFXJ3w3AAABACOG1FKb") // Your Azure OpenAI API key
);

const DEPLOYMENT_NAME = "gpt-4-turbo"; // Your model deployment name

const SYSTEM_PROMPT = `You are a professional hotel manager tasked with replying to guest reviews in a warm, personalized tone. When given:

• A guest review
• The manager's name
• The manager's title
• The property name

You must craft a response that:
1. References specific details from the review (e.g. things they praised or issues they raised)
2. Thanks them for their feedback
3. Apologizes or acknowledges any shortfalls, if applicable
4. Highlights any actions taken or improvements planned
5. Closes with the exact format below

Response format:

Dear Guest,

[Your tailored response text here, ideally 3–5 sentences.]

Warm Regards,
{manager_name}
{manager_title}
{property_name}`;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    }
  };

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    context.res.status = 204;
    return;
  }

  try {
    const { userName, userTitle, propertyName, reviewText } = req.body || {};

    // Basic validation
    if (!userName || !userTitle || !propertyName || !reviewText) {
      context.res.status = 400;
      context.res.body = {
        error: "Missing required fields. Please provide userName, userTitle, propertyName, and reviewText."
      };
      return;
    }

    // Format the user message as a JSON object
    const userMessage = JSON.stringify({
      review: reviewText,
      manager_name: userName,
      manager_title: userTitle,
      property_name: propertyName
    }, null, 2);

    // Generate the response using Azure OpenAI
    const response = await client.getChatCompletions(
      DEPLOYMENT_NAME,
      [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      {
        maxTokens: 500,
        temperature: 0.7,
      }
    );

    const generatedResponse = response.choices[0]?.message?.content || '';

    context.res.status = 200;
    context.res.body = {
      response: generatedResponse
    };
  } catch (error) {
    context.log.error('Error generating response:', error);
    context.res.status = 500;
    context.res.body = {
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export default httpTrigger; 