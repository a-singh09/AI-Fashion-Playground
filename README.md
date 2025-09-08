# AI Fashion Playground

**Live Application:** [https://ai-fashion-playground-569679889124.us-west1.run.app](https://ai-fashion-playground-569679889124.us-west1.run.app)

**Video demo:** https://youtu.be/gk8MBoIrxas


Your Closet, Reimagined. AI Fashion Playground is a web platform where users can mix and match outfits from their own wardrobe or e-commerce sites on a realistic, AI-generated avatar of themselves using Google's Gemini API.

---

## The Billion-Dollar Problems We Solve

The fashion industry, particularly online retail, faces massive challenges that impact both consumers and businesses. Our platform directly addresses these multi-billion dollar problems:

1.  **The "Try Before You Buy" Gap in E-commerce:** Online fashion retail is plagued by high return rates (often 30-40%), costing the industry billions annually in logistics, restocking, and lost sales. The primary cause is a lack of fit and style confidence.
    *   **Our Solution:** We provide a hyper-realistic virtual try-on experience. By seeing how clothes from a website look on their *actual body*, users can make purchasing decisions with near-certainty, drastically reducing the likelihood of returns.

2.  **The "Full Closet, Nothing to Wear" Paradox:** Consumers often utilize only a fraction of their wardrobe, leading to decision fatigue, dissatisfaction, and unsustainable impulse purchases.
    *   **Our Solution:** The "Get Ready With Me" AI stylist rediscovers and reimagines a user's existing wardrobe. It curates new, stylish combinations for any occasion, promoting sustainable fashion choices and maximizing the value of clothes they already own.

3.  **The Inaccessibility of Personal Styling:** Professional stylists are a luxury service, leaving the average consumer to navigate trends and outfit choices on their own.
    *   **Our Solution:** We democratize fashion expertise. Our AI acts as an on-demand personal stylist that understands a user's unique wardrobe, style preferences, and daily needs, providing expert guidance for free.

---

## Core Features

-   **Freestyle Playground:** An intuitive studio where users can upload a photo of themselves (their avatar) and photos of clothing items. They can freely mix and match items to visualize complete outfits.
-   **AI Personal Stylist ("Get Ready With Me"):** Users describe an event or mood (e.g., "work presentation," "casual brunch"), and the AI curates a complete, ready-to-wear outfit from their digital wardrobe, providing a stylish rationale for its choices.
-   **Intelligent Wardrobe Management:** The app automatically analyzes and tags uploaded clothing items by category, color, season, and style, making the user's wardrobe filterable and easy to manage.
-   **Photorealistic Image Generation:** Using advanced AI, the platform generates high-resolution, realistic images of the user wearing the selected outfits in various scenes and settings.
-   **Iterative Refinement:** Users can modify generated images with simple text prompts (e.g., "change the background to a city street," "make the lighting more dramatic").

---

## Harnessing the Power of Google's Gemini API

This application is built from the ground up using the generative AI capabilities of the Gemini API. We leverage different models and features for specific tasks.

| Feature                      | Gemini Model Used                  | Key Gemini Capabilities Utilized                                                                              |
| ---------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Virtual Try-On**           | `gemini-2.5-flash-image-preview`   | **Multimodal Input:** Combines a base image of the user, multiple clothing images, and a text prompt in a single call to generate a new, coherent image. |
| **Image Refinement**         | `gemini-2.5-flash-image-preview`   | **Image Editing:** Takes an existing generated image and a text prompt to perform modifications like background changes or style adjustments. |
| **AI Personal Stylist**      | `gemini-2.5-flash`                 | **JSON Mode & `responseSchema`:** Parses the user's wardrobe list and event description to return a structured JSON object containing the selected outfit and styling advice. |
| **Wardrobe Intelligence**    | `gemini-2.5-flash`                 | **Multimodal Input & JSON Mode with `responseSchema`:** Analyzes an uploaded clothing image to extract and return structured metadata (category, color, style) as a JSON object. |

### The "Nano-Banana" Magic (`gemini-2.5-flash-image-preview`)

The core magic of our virtual try-on and image editing features is powered by the model codenamed **"Nano-Banana"** (`gemini-2.5-flash-image-preview`). This state-of-the-art multimodal model is uniquely capable of understanding and composing elements from multiple source images based on a text prompt.

In our `generateStyledImage` function, we provide it with:
1.  The user's image.
2.  One or more images of clothing items.
3.  A carefully crafted text prompt instructing it to "dress" the person from the first image with the clothes from the subsequent images, while strictly preserving their face and body shape.

This powerful image composition capability is what makes the hyper-realistic virtual try-on possible.

---

## From Prototype to Production

Our development process leverages Google's ecosystem to move from idea to a globally-scaled application.

-   **Prototyping with Google AI Studio:** We used Google AI Studio as our rapid prototyping environment. It was instrumental in crafting, testing, and refining the complex prompts required for both the text-based stylist and the multimodal image generation, allowing us to perfect the AI's behavior before writing a single line of application code.

-   **Deployment on Google Cloud Run:** The application is deployed on **Google Cloud Run**, a fully managed, serverless platform. This allows us to:
    -   **Scale Automatically:** Cloud Run automatically scales our application from zero to handle any amount of traffic, ensuring a smooth user experience.
    -   **Deploy with Ease:** We can deploy new versions of the application with a single command, without worrying about server provisioning or management.
    -   **Run Cost-Effectively:** With its pay-per-use model, we only pay for the resources we consume, making it a highly efficient deployment solution.

---

## Project Structure

The codebase is organized into a clear, component-based structure to ensure maintainability and scalability.

```
/
├── public/                  # Public assets
├── components/              # Reusable React components
│   ├── Playground.tsx       # The main "freestyle" user interface
│   ├── AiStylist.tsx        # The "Get Ready With Me" feature
│   ├── LandingPage.tsx      # The main marketing and entry page
│   └── ...                  # Other UI components (Header, Footer, etc.)
├── services/                # Business logic and external API communication
│   ├── geminiService.ts     # All interactions with the Gemini API
│   └── db.ts                # Client-side IndexedDB logic
├── contexts/                # React context for global state
│   └── ThemeContext.tsx     # Manages light/dark mode
├── types.ts                 # TypeScript type definitions
├── constants.ts             # Application-wide constants
├── App.tsx                  # Main application component and router
└── index.tsx                # Application entry point
```

---

## Privacy First Architecture

User privacy is a core tenet of this application. All user-uploaded images (both avatars and clothing items) are handled exclusively on the client-side.

-   **Client-Side Storage:** We use **IndexedDB**, a browser-based database, to store all user photos.
-   **No Server-Side Storage:** Images are **never** uploaded to or stored on a server. They are sent directly from the user's browser to the Google Gemini API during the generation process and are not retained. This ensures that users maintain full control and privacy over their personal images.

---

## Getting Started (Local Development)

To run this project locally, you will need to have a Gemini API key.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/a-singh09/AI-Fashion-Playground/
    cd ai-fashion-playground
    ```

2.  **Set Up Environment Variables:**
    This application requires a `process.env.API_KEY` variable to be available in its environment. You must obtain a valid API key from Google AI Studio and configure it in your deployment environment.

3.  **Run the Application:**
    Follow the instructions provided by your local development server or deployment platform to run the application. The app will be accessible at a local URL (e.g., `http://localhost:3000`).

---

## Future Roadmap

This platform is just the beginning. Potential future enhancements include:

-   **Saved Outfits & Lookbooks:** Allow users to save their favorite generated outfits to a personal, shareable lookbook.
-   **Social Sharing:** Integrated tools to easily share generated looks on social media platforms like Instagram and Pinterest.
-   **E-commerce Integration:** Partner with online retailers to allow users to "try on" clothes directly from product pages and purchase them.
-   **Wardrobe Analytics:** Provide users with insights into their wardrobe, such as most-used colors, style preferences, and items that need replacing.
-   **Friend & Community Feedback:** A feature to share generated looks with friends or the community to get feedback before wearing an outfit.

## 🙏 Acknowledgments

- **Google Gemini Team** – For the incredible Nano Banana API  
- **Nano Banana Hackathon Kit** – Foundation and inspiration  
- **Open Source Community** – Libraries and tools that made this possible  

---

## 💖 Built for Everyone

**AI Fashion Playground** believes fashion should be fun, inclusive, and accessible to everyone. Whether you're exploring your personal style, planning outfits for special occasions, or just having creative fun – this platform is designed to celebrate your unique identity and boost your confidence.

Made with ❤️ for the fashion-forward and the style-curious alike.


