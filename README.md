# Hotel Review Response Generator

A web application that generates personalized responses to hotel guest reviews using Azure OpenAI.

## Features

- Modern, responsive UI built with Next.js and Tailwind CSS
- Form for entering hotel staff details and guest review
- AI-powered response generation using Azure OpenAI
- Character-limited responses (under 500 characters)
- Professional formatting with proper salutations and signatures

## Prerequisites

- Node.js 18.x or later
- Azure OpenAI service with a deployed model
- Azure OpenAI API key and endpoint

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a ` .env.local` file (with a leading space) in the root directory with the following variables:
   ```
   AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key
   AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your name, title, and property name
2. Paste the guest's review text
3. Click "Generate Response"
4. The AI will generate a personalized response that you can use

## Environment Variables

- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT_NAME`: The name of your deployed Azure OpenAI model

## License

MIT 