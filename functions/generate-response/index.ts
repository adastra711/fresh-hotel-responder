import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

interface RequestBody {
  userName: string;
  userTitle: string;
  propertyName: string;
  reviewText: string;
}

// Validate environment variables
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo";

if (!endpoint || !apiKey) {
  console.error('Missing required environment variables:');
  console.error('AZURE_OPENAI_ENDPOINT:', endpoint ? 'set' : 'missing');
  console.error('AZURE_OPENAI_API_KEY:', apiKey ? 'set' : 'missing');
  throw new Error('Missing required Azure OpenAI configuration');
}

const client = new OpenAIClient(
  endpoint,
  new AzureKeyCredential(apiKey)
);

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Set CORS headers
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
    const { userName, userTitle, propertyName, reviewText } = req.body;

    if (!userName || !userTitle || !propertyName || !reviewText) {
      context.res = {
        ...context.res,
        status: 400,
        body: {
          error: "Missing required fields. Please provide userName, userTitle, propertyName, and reviewText.",
        },
      };
      return;
    }

    const prompt = `You are ${userName}, ${userTitle} at ${propertyName}. Write a professional and friendly response to the following guest review:

${reviewText}

The response should:
1. Thank the guest for their review
2. Address any specific points mentioned in the review
3. Be warm and professional
4. End with a sincere invitation to return
5. Be between 100-200 words`;

    context.log.info('Calling Azure OpenAI with deployment:', deploymentName);
    
    const response = await client.getChatCompletions(
      deploymentName,
      [
        {
          role: "system",
          content: "You are a professional hotel manager writing responses to guest reviews.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 500,
      }
    );

    const generatedResponse = response.choices[0]?.message?.content;

    if (!generatedResponse) {
      throw new Error("No response generated from Azure OpenAI");
    }

    context.res = {
      ...context.res,
      status: 200,
      body: {
        response: generatedResponse,
      },
    };
  } catch (error) {
    context.log.error("Error generating response:", error);
    context.log.error("Error details:", JSON.stringify(error, null, 2));
    
    context.res = {
      ...context.res,
      status: 500,
      body: {
        error: "An error occurred while generating the response. Please try again later.",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
    };
  }
};

export default httpTrigger; 