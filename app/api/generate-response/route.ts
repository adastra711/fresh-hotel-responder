import { NextResponse } from 'next/server';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

// Initialize the Azure OpenAI client with hardcoded values
const client = new OpenAIClient(
  "https://pgmai.openai.azure.com/", // Your Azure OpenAI endpoint
  new AzureKeyCredential("Ct9JSYy5Ewlwn9NnWmAik6ynJLl3VvJ9vodQTC3DTn5G9hgnrwnZJQQJ99BDACYeBjFXJ3w3AAABACOG1FKb") // Your Azure OpenAI API key
);

const DEPLOYMENT_NAME = "gpt-4"; // Your model deployment name

export async function POST(request: Request) {
  try {
    const { userName, userTitle, propertyName, reviewText } = await request.json();

    // Construct the prompt for the AI
    const prompt = `You are a professional hotel manager. Write a personalized response to the following guest review. The response should be warm, professional, and address specific points mentioned in the review. Keep the response under 500 characters.

Guest Review:
${reviewText}

Format the response as follows:
Dear Guest,

[Your response here]

Warm Regards,
${userName}
${userTitle}
${propertyName}`;

    // Generate the response using Azure OpenAI
    const response = await client.getChatCompletions(
      DEPLOYMENT_NAME,
      [
        {
          role: 'system',
          content: 'You are a professional hotel manager with excellent customer service skills.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      {
        maxTokens: 500,
        temperature: 0.7,
      }
    );

    const generatedResponse = response.choices[0]?.message?.content || '';

    return NextResponse.json({ response: generatedResponse });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 