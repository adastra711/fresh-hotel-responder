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

function createErrorResponse(context: Context, status: number, message: string, details?: any) {
  context.res = {
    ...context.res,
    status,
    headers: {
      ...context.res?.headers,
      'Content-Type': 'application/json'
    },
    body: {
      error: message,
      details: details || undefined
    }
  };
}

// Validate Azure OpenAI configuration
if (!endpoint) {
  console.error('Missing AZURE_OPENAI_ENDPOINT environment variable');
  throw new Error('Azure OpenAI endpoint not configured');
}

if (!apiKey) {
  console.error('Missing AZURE_OPENAI_API_KEY environment variable');
  throw new Error('Azure OpenAI API key not configured');
}

const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

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
    // Validate request body exists
    if (!req.body) {
      createErrorResponse(context, 400, 'Request body is missing');
      return;
    }

    const { userName, userTitle, propertyName, reviewText } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!userName) missingFields.push('userName');
    if (!userTitle) missingFields.push('userTitle');
    if (!propertyName) missingFields.push('propertyName');
    if (!reviewText) missingFields.push('reviewText');

    if (missingFields.length > 0) {
      createErrorResponse(
        context,
        400,
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
      return;
    }

    context.log.info('Starting request to Azure OpenAI with deployment:', deploymentName);
    context.log.info('Request parameters:', { userName, userTitle, propertyName });

    const prompt = `You are ${userName}, ${userTitle} at ${propertyName}. Write a professional and friendly response to the following guest review:

${reviewText}

The response should:
1. Thank the guest for their review
2. Address any specific points mentioned in the review
3. Be warm and professional
4. End with a sincere invitation to return
5. Be between 100-200 words`;

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
    context.log.error("Error details:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Check if it's an Azure OpenAI specific error
    if (error instanceof Error && error.message.includes('Azure OpenAI')) {
      createErrorResponse(
        context,
        500,
        'Azure OpenAI service error',
        error.message
      );
    } else {
      createErrorResponse(
        context,
        500,
        'An error occurred while generating the response',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
};

export default httpTrigger; 