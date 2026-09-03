# JackpotEye AI

JackpotEye AI is a professional slot analytics web application that uses Google's Gemini Vision API to analyze real-time game feeds (via camera or screen capture) and provide strategic insights, confidence scores, and recommendations.

## Features

- **Real-Time Analysis:** Capture frames from your camera or screen and analyze them instantly.
- **AI-Powered Insights:** Uses the Gemini Vision API to detect slot symbols, determine volatility, and provide actionable recommendations.
- **Audio Feedback:** Customizable sound profiles to alert you on high-confidence "jackpot" opportunities or low-confidence warnings.
- **Visual Analytics:** Probability mesh and audio visualizer for an immersive dashboard experience.
- **Activity Logging:** Comprehensive logging and history tracking of analyzed frames.

## Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

## Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd jackpoteye-ai
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   - Create a `.env` file in the root directory.
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Grant the application permission to access your camera or screen when prompted.

4. Click on "Engage Scanner" to start analyzing the feed!

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Icons:** Lucide React
- **AI Integration:** `@google/genai` (Gemini API)

## License

This project is open-source and available under the MIT License.
