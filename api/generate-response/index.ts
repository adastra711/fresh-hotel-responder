import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT || "",
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY || "")
);

const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4-turbo";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const { userName, userTitle, propertyName, reviewText } = req.body;

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

    context.res = {
      status: 200,
      body: { response: generatedResponse },
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    context.log.error('Error generating response:', error);
    context.res = {
      status: 500,
      body: { error: 'Failed to generate response' },
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

export default httpTrigger; 