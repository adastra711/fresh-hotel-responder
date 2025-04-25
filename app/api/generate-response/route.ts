import { NextResponse } from 'next/server';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

function getRequiredEnvVar(name: string): string {
  console.log(`Checking for ${name}...`);
  console.log(`Current env vars available:`, Object.keys(process.env));
  
  const value = process.env[name];
  if (!value) {
    console.error(`Environment variable ${name} is missing or empty`);
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  console.log(`Found ${name} with length: ${value.length}`);
  return value;
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle POST request
export async function POST(req: Request) {
  console.log('POST request received');
  console.log('Process env keys:', Object.keys(process.env));
  
  try {
    // Get and validate environment variables
    const azureApiKey = getRequiredEnvVar('AZURE_OPENAI_API_KEY');
    const azureEndpoint = getRequiredEnvVar('AZURE_OPENAI_ENDPOINT');
    const deploymentName = getRequiredEnvVar('AZURE_OPENAI_DEPLOYMENT_NAME');

    // Initialize the Azure OpenAI client
    const client = new OpenAIClient(
      azureEndpoint,
      new AzureKeyCredential(azureApiKey)
    );

    // Validate request body
    const body = await req.json();
    const { userName, userTitle, propertyName, reviewText } = body;

    if (!userName || !userTitle || !propertyName || !reviewText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Construct the prompt for the AI
    const systemPrompt = `You are a professional hotel manager with excellent customer service skills. Your task is to write a personalized response to a guest review. The response should:
- Be warm and professional
- Address specific points mentioned in the review
- Show appreciation for feedback
- Be under 500 characters
- Maintain proper formatting`;

    const userPrompt = `Write a response to this guest review. Format the response exactly as follows:

Dear Guest,

[Your response here]

Warm Regards,
${userName}
${userTitle}
${propertyName}

Guest Review:
${reviewText}`;

    // Generate the response using Azure OpenAI
    const response = await client.getChatCompletions(
      deploymentName,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      {
        maxTokens: 500,
        temperature: 0.7,
      }
    );

    const generatedResponse = response.choices[0]?.message?.content;

    if (!generatedResponse) {
      throw new Error('No response generated from AI service');
    }

    return NextResponse.json(
      { response: generatedResponse },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Detailed error:', error);
    
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      
      // Check for specific error types
      if (errorMessage.includes('environment variable')) {
        statusCode = 503; // Service Unavailable
        errorMessage = 'Azure OpenAI credentials not properly configured';
      } else if (errorMessage.includes('Missing required fields')) {
        statusCode = 400; // Bad Request
      } else if (errorMessage.includes('authentication failed') || errorMessage.includes('unauthorized')) {
        statusCode = 503;
        errorMessage = 'Azure OpenAI authentication failed';
      }
    }

    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 