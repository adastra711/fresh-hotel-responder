import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

interface RequestBody {
  userName: string;
  userTitle: string;
  propertyName: string;
  reviewText: string;
}

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT || "",
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY || "")
);

const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4-turbo";

export async function generateResponse(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as RequestBody;
    const { userName, userTitle, propertyName, reviewText } = body;

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

    return {
      status: 200,
      jsonBody: { response: generatedResponse },
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    context.error('Error generating response:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to generate response' },
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
} 