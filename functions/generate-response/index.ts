import { AzureFunction, Context, HttpRequest } from "@azure/functions";
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

const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const { userName, userTitle, propertyName, reviewText } = req.body;

    if (!userName || !userTitle || !propertyName || !reviewText) {
      context.res = {
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

    const response = await client.getChatCompletions(
      DEPLOYMENT_NAME,
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
      status: 200,
      body: {
        response: generatedResponse,
      },
    };
  } catch (error) {
    context.log.error("Error generating response:", error);
    context.res = {
      status: 500,
      body: {
        error: "An error occurred while generating the response. Please try again later.",
      },
    };
  }
};

export default httpTrigger; 