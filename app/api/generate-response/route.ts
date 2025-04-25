import { NextResponse } from 'next/server';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

function getRequiredEnvVar(name: string): string {
  console.log(`Checking for ${name}...`);
  console.log(`Current env vars available:`, Object.keys(process.env).filter(key => !key.toLowerCase().includes('key')));
  console.log('Node environment:', process.env.NODE_ENV);
  console.log('Runtime environment:', process.env.RUNTIME_ENVIRONMENT);
  
  const value = process.env[name];
  if (!value) {
    console.error(`Environment variable ${name} is missing or empty`);
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  console.log(`Found ${name} with length: ${value.length}`);
  if (name === 'AZURE_OPENAI_ENDPOINT') {
    // Log the endpoint but remove any key/secret if accidentally included
    const sanitizedEndpoint = value.replace(/\?.*$/, '');
    console.log(`Endpoint value: ${sanitizedEndpoint}`);
  }
  return value;
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle POST request
export async function POST(req: Request) {
  console.log('POST request received');
  console.log('Process env keys:', Object.keys(process.env).filter(key => !key.toLowerCase().includes('key')));
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    // Get and validate environment variables
    console.log('Starting environment variable validation...');
    const azureApiKey = getRequiredEnvVar('AZURE_OPENAI_API_KEY');
    const azureEndpoint = getRequiredEnvVar('AZURE_OPENAI_ENDPOINT');
    const deploymentName = getRequiredEnvVar('AZURE_OPENAI_DEPLOYMENT_NAME');
    console.log('Environment variables validated successfully');

    // Initialize the Azure OpenAI client
    console.log('Initializing Azure OpenAI client...');
    const client = new OpenAIClient(
      azureEndpoint,
      new AzureKeyCredential(azureApiKey)
    );
    console.log('Azure OpenAI client initialized');

    // Validate request body
    console.log('Parsing request body...');
    const body = await req.json();
    const { userName, userTitle, propertyName, reviewText } = body;
    console.log('Request body parsed:', { userName: !!userName, userTitle: !!userTitle, propertyName: !!propertyName, reviewText: !!reviewText });

    if (!userName || !userTitle || !propertyName || !reviewText) {
      console.error('Missing required fields:', { userName: !userName, userTitle: !userTitle, propertyName: !propertyName, reviewText: !reviewText });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          }
        }
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
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
    }
    
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        type: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
      
      // Enhanced error type checking
      if (errorMessage.includes('environment variable')) {
        statusCode = 503;
        errorMessage = 'Azure OpenAI credentials not properly configured';
        errorDetails = {
          ...errorDetails,
          availableVars: Object.keys(process.env).filter(key => !key.toLowerCase().includes('key')),
          nodeEnv: process.env.NODE_ENV,
          runtimeEnv: process.env.RUNTIME_ENVIRONMENT
        };
      } else if (errorMessage.includes('Missing required fields')) {
        statusCode = 400;
      } else if (errorMessage.includes('authentication failed') || errorMessage.includes('unauthorized')) {
        statusCode = 503;
        errorMessage = 'Azure OpenAI authentication failed';
        errorDetails = {
          ...errorDetails,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT ? 'Endpoint is set' : 'Endpoint is missing'
        };
      }
    }

    return NextResponse.json(
      { 
        error: `Failed to generate response: ${errorMessage}`,
        details: errorDetails
      },
      { 
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 