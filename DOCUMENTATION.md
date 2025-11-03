# AI Video Clipper Documentation

## 1. Overview

AI Video Clipper is a modern web application designed to demonstrate the power of generative AI in content creation. It provides a user-friendly interface to simulate the process of converting long-form videos into multiple short, engaging, and "viral-worthy" clips suitable for social media platforms like TikTok, Instagram Reels, and YouTube Shorts.

The user provides a video URL, and the application uses the Google Gemini API to analyze a mock transcript of the video. The AI identifies the most impactful segments and generates catchy titles, compelling descriptions, and virality scores. Crucially, it then presents these segments as fully interactive video previews that the user can play, control, edit, and download.

---

## 2. Features

-   **Simple URL Input**: Users can easily start the process by pasting a video link.
-   **AI-Powered Clip Generation**: Leverages the Google Gemini API to intelligently identify the best moments from a video transcript.
-   **Structured Clip Suggestions**: For each suggested clip, the AI generates a catchy title, an engaging description, and a "Virality Score".
-   **Interactive Video Editor**: Each suggested clip is presented within its own powerful mini-editor.
    -   **Precise Segmentation**: The player automatically seeks to the `startTime` and pauses at the `endTime` of the AI-identified segment.
    -   **Precision Trimming**: The seek bar includes draggable handles, allowing users to fine-tune the exact start and end points of the clip.
    -   **Editable Phrases**: Users can directly edit the start and end phrases for a clip. This triggers an automatic recalculation of the clip's timestamps, instantly updating the video player and trimmer.
    -   **Full Playback Controls**: A sleek, modern control bar appears on hover or during playback, providing a play/pause button, a visual seek bar, and a time display (`current time / duration`).
    -   **Volume Control**: A volume slider and mute toggle are included in the controls. The user's volume preference is remembered across all clips for the entire session.
    -   **Manual Scrubbing**: Users can click or drag the seek bar to manually scrub through the specific clip segment.
-   **Flexible Download Options**: Clicking the download button opens a modal, allowing users to choose their preferred format (MP4 in 1080p/720p, Animated GIF).
-   **Download Confirmation**: After selecting a format, the download button provides clear visual feedback, transitioning through "Downloading..." and "Downloaded!" states.
-   **Dynamic UI States**: The interface provides clear feedback to the user, with distinct views for input, processing, and results.
-   **Engaging Processing Animation**: A visually appealing loading screen keeps the user informed while the AI works.
-   **Responsive Design**: The application is fully responsive and provides an excellent experience on all devices.
-   **Modern & Sleek Aesthetics**: A dark-themed UI with custom icons and fluid animations enhances the user experience.

---

## 3. How It Works

The application flow is divided into three main states:

1.  **UPLOAD**: The user is presented with an input field to paste a video URL.
2.  **PROCESSING**: Once a URL is submitted, the application transitions to a loading state.
    -   *(Simulation)*: In this demonstration, the app simulates fetching and transcribing the video.
    -   **AI Analysis**: The application sends the mock transcript to the Gemini API, instructing it to act as a viral video expert and return 3-5 potential clips in a structured JSON format, including start and end phrases.
3.  **RESULTS**: The application receives the JSON response from the Gemini API.
    -   **Timestamp Calculation**: The start and end phrases for each clip are used to calculate precise `startTime` and `endTime` values based on their position in the full transcript.
    -   **Interactive Rendering**: The data is parsed and rendered as a series of "Clip Cards". Each card is now an interactive component containing an HTML5 video player and editor.
    -   **User Interaction**: The user can play each clip, use the custom controls, trim the segment with draggable handles, edit the phrases to recalculate timestamps, initiate a download, and then choose to analyze another video, which resets the application state.

---

## 4. Technology Stack

-   **Frontend Framework**: [React](https://react.dev/) (v19) with TypeScript & Hooks (`useState`, `useRef`, `useEffect`)
-   **Generative AI**: [Google Gemini API](https://ai.google.dev/) (`@google/genai` SDK)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Module Loading**: ES Modules with Import Maps (no build step needed)

---

## 5. Project Structure

The project is organized into a modular structure for maintainability and clarity.

```
.
├── index.html              # Main HTML entry point, includes import maps and tailwindcss CDN
├── index.tsx               # Renders the main React App component into the DOM
├── App.tsx                 # Core application component, manages state and renders different views
├── types.ts                # Contains all TypeScript type definitions and enums (AppState, Clip)
├── metadata.json           # Application metadata
│
├── components/             # Directory for reusable React components
│   ├── ClipCard.tsx        # An interactive component that displays a single clip with a video player and controls
│   ├── ClipResults.tsx     # Displays the grid of all generated clip cards
│   ├── Header.tsx          # The main application header
│   ├── Icons.tsx           # A collection of SVG icon components
│   ├── ProcessingView.tsx  # The loading/processing state component
│   └── UrlInput.tsx        # The initial component for user to input a video URL
│
└── services/               # Directory for business logic and API communication
    └── geminiService.ts    # Handles all communication with the Google Gemini API
```

---

## 6. Key Components Breakdown

-   **`App.tsx`**: The main state machine of the application. It manages the `AppState`, handles the primary logic for calling the Gemini service, and crucially, **calculates the start/end timestamps** for each clip and **manages the session-wide volume state**. It also provides a handler function to update clips when a user edits the phrases, re-calculating timestamps on the fly.

-   **`geminiService.ts`**: This module is responsible for the core AI functionality. It defines the JSON schema that the Gemini API should conform to, constructs the prompt with the system instruction, and makes the API call.

-   **`ClipResults.tsx`**: A presentational component that takes the array of generated clips and maps over them, rendering a `ClipCard` for each one. It passes down the video URL, calculated timestamps, and state handlers.

-   **`ClipCard.tsx`**: A complex, stateful component that serves as the centerpiece of the user experience.
    -   It manages an HTML5 `<video>` element using a `useRef`.
    -   It uses `useState` to track playback state (`isPlaying`), progress, current time, and the visibility of the download modal.
    -   It uses `useEffect` to attach event listeners to the video element to sync the component's state with the video's playback status.
    -   It implements the logic to enforce the user-defined `startTime` and `endTime` boundaries.
    -   It renders the custom playback controls, including volume management, and handles user interactions like play/pause and seeking.
    -   It renders an interactive trimmer with draggable handles, managing the trimmed start/end state.
    -   It provides editable input fields for clip phrases and calls back to the parent component to update timestamps.
    -   It manages the download process, from showing the options modal to providing visual feedback on the download button.
