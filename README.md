<div align="center">

<img src="frontend/public/logo.svg" alt="Jenny Logo" width="180">

# Jenny

### 3D AI Avatar Chat Application

An interactive virtual avatar combining conversational AI, speech synthesis, facial animation, and real-time lip synchronization.

<br>

<img src="frontend/public/image.png" alt="Jenny 3D AI Avatar interface" width="900">

<br><br>

[Live Demo](https://jenny-90fq.onrender.com)
&nbsp;&nbsp;•&nbsp;&nbsp;
[Report an Issue](https://github.com/naveed-gung/jenny/issues/new/choose)
&nbsp;&nbsp;•&nbsp;&nbsp;
[Contribute](CONTRIBUTING.md)

<br><br>

![License](https://img.shields.io/github/license/naveed-gung/jenny?style=flat-square)
![Repository Stars](https://img.shields.io/github/stars/naveed-gung/jenny?style=flat-square)
![Repository Forks](https://img.shields.io/github/forks/naveed-gung/jenny?style=flat-square)
![Open Issues](https://img.shields.io/github/issues/naveed-gung/jenny?style=flat-square)

</div>

---

> [!IMPORTANT]
> **Project status**
>
> Jenny is currently in maintenance mode. Active feature development has been postponed while work continues on other projects.
>
> Bug reports and community pull requests remain welcome, but response times and maintainer-led updates may be limited.

## <img src=".github/assets/document.svg" alt="" width="24" height="24" align="center"> Overview

Jenny is an open-source 3D AI avatar application that combines conversational artificial intelligence, speech synthesis, facial animation, and lip synchronization within an interactive web experience.

The application uses React and React Three Fiber to render and control the avatar, while a Node.js and Express backend manages AI responses, speech generation, audio processing, and lip-sync data.

Jenny can serve as a foundation for:

- Virtual assistants
- Interactive characters
- Educational applications
- AI-powered customer experiences
- Digital humans
- Voice-driven interfaces
- Experimental conversational applications

Jenny is based on the original virtual girlfriend project created by **Wawa Sensei**. Full attribution and links to the original repositories are provided in the [Credits and Attribution](#credits-and-attribution) section.

## <img src=".github/assets/sparkles.svg" alt="" width="24" height="24" align="center"> Features

- Expressive 3D avatar rendered with React Three Fiber
- AI-powered conversations using Google Gemini
- Speech generation through supported text-to-speech providers
- Lip synchronization using Rhubarb Lip Sync
- Facial expressions driven by conversational context
- Multiple voice configurations
- Adjustable pitch, speed, and volume
- GLB avatar and animation support
- Separate frontend and backend architecture
- Render Blueprint deployment configuration
- Contribution and issue templates for community development

## <img src=".github/assets/computer.svg" alt="" width="24" height="24" align="center"> Application Preview

<div align="center">

<img src="frontend/public/image.png" alt="Jenny application showing the interactive 3D avatar" width="900">

</div>

## <img src=".github/assets/controls.svg" alt="" width="24" height="24" align="center"> How It Works

Jenny processes a user message through several coordinated components:

1. The user submits a message from the React interface.
2. The frontend sends the request to the Express backend.
3. The backend requests a conversational response from Google Gemini.
4. The response text is sent to the configured speech provider.
5. The generated audio is processed for lip-sync timing.
6. The frontend receives the message, audio, expressions, and mouth-cue data.
7. The avatar plays the audio while synchronizing its mouth movements and facial animations.

### Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         Web Browser                         │
│                                                             │
│   React                                                     │
│   React Three Fiber                                         │
│   Three.js                                                  │
│   Tailwind CSS                                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTP API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js / Express API                    │
│                                                             │
│   Conversation handling                                     │
│   Speech generation                                         │
│   Audio processing                                          │
│   Expression selection                                      │
│   Lip-sync generation                                       │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
                ▼                      ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│      Google Gemini       │  │        Voice Providers        │
│                          │  │                               │
│  Conversational AI       │  │  ElevenLabs                  │
│  Response generation     │  │  SpeechGen                   │
│                          │  │  Additional TTS integrations  │
└──────────────────────────┘  └───────────────┬───────────────┘
                                             │
                                             ▼
                              ┌───────────────────────────────┐
                              │       Rhubarb Lip Sync        │
                              │                               │
                              │  Audio analysis               │
                              │  Mouth-cue generation         │
                              └───────────────────────────────┘
```

## <img src=".github/assets/tools.svg" alt="" width="24" height="24" align="center"> Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | User-interface development |
| Vite | Development server and frontend build tooling |
| Three.js | 3D rendering |
| React Three Fiber | React renderer for Three.js |
| Tailwind CSS | Interface styling |
| GLB | Avatar models and animation assets |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express | Backend API |
| FFmpeg | Audio conversion and processing |
| Rhubarb Lip Sync | Mouth-cue generation |

### AI and Voice Services

| Service | Purpose |
|---|---|
| Google Gemini | Conversational response generation |
| ElevenLabs | Natural text-to-speech generation |
| SpeechGen | Additional voice-generation options |

## <img src=".github/assets/tools.svg" alt="" width="24" height="24" align="center"> Installation

### Prerequisites

Install the following software before running Jenny locally:

- Node.js 18 or later
- npm
- FFmpeg
- Rhubarb Lip Sync, when it is not already bundled or configured by the project
- A Google Gemini API key
- Credentials for any optional speech provider you intend to use

### Clone the Repository

```bash
git clone https://github.com/naveed-gung/jenny.git
cd jenny
```

### Install Dependencies

Install the frontend and backend dependencies together:

```bash
npm run install-all
```

If the combined installation command is unavailable in a modified fork, install each application separately:

```bash
cd frontend
npm install

cd ../backend
npm install
```

## <img src=".github/assets/controls.svg" alt="" width="24" height="24" align="center"> Environment Configuration

Create the following file:

```text
backend/.env
```

Add the required credentials:

```env
GEMINI_API_KEY=your_gemini_api_key

TTS_OPEN_API_KEY=your_tts_provider_api_key

SPEECHGEN_API_KEY=your_speechgen_api_key
SPEECHGEN_EMAIL=your_speechgen_account_email
```

### Environment Variable Reference

| Variable | Required | Description |
|---|---:|---|
| `GEMINI_API_KEY` | Yes | API key used to generate conversational responses |
| `TTS_OPEN_API_KEY` | Provider-dependent | Credential used by the configured text-to-speech integration |
| `SPEECHGEN_API_KEY` | No | SpeechGen API credential |
| `SPEECHGEN_EMAIL` | No | Email associated with the SpeechGen account |

Never commit a populated `.env` file to source control.

The repository should include an example file such as:

```text
backend/.env.example
```

Example:

```env
GEMINI_API_KEY=
TTS_OPEN_API_KEY=
SPEECHGEN_API_KEY=
SPEECHGEN_EMAIL=
```

## <img src=".github/assets/rocket.svg" alt="" width="24" height="24" align="center"> Running Locally

Start the frontend and backend development servers:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:5173
```

Depending on the repository configuration, the backend may run on a separate local port.

## <img src=".github/assets/globe.svg" alt="" width="24" height="24" align="center"> Deployment

Jenny includes a `render.yaml` file for deployment through Render Blueprints.

### Render Deployment

1. Fork or push the repository to your GitHub account.
2. Sign in to Render.
3. Create a new Blueprint.
4. Connect the Jenny repository.
5. Add the required environment variables.
6. Review the frontend and backend services.
7. Deploy the Blueprint.

### Live Demo

The current demonstration deployment is available at:

[Open the Jenny live demo](https://jenny-90fq.onrender.com)

> [!NOTE]
> Free hosting services may suspend inactive applications. The first request can therefore take longer while the service starts.

## <img src=".github/assets/mask.svg" alt="" width="24" height="24" align="center"> Avatar and Lip Synchronization

Jenny uses avatar morph targets, animation clips, generated audio, and timed mouth cues to create synchronized speech.

The general process is:

```text
Generated response
       │
       ▼
Text-to-speech audio
       │
       ▼
Audio conversion
       │
       ▼
Rhubarb analysis
       │
       ▼
Timed mouth cues
       │
       ▼
Avatar morph-target animation
```

### Avatar Requirements

A replacement avatar should ideally include:

- A compatible GLB or GLTF structure
- Facial morph targets
- Mouth shapes suitable for speech
- Stable morph-target naming
- Compatible skeletal animations
- Neutral facial geometry
- Expression blendshapes that do not excessively conflict with mouth movements

## <img src=".github/assets/mask.svg" alt="" width="24" height="24" align="center"> Known Limitations

### Limited Mouth Shapes

The current default avatar has a limited mouth-shape or viseme set. This can cause speech movements and facial expressions to interfere with one another.

Possible symptoms include:

- Incorrect mouth shapes during speech
- Abrupt transitions between expressions
- Expression blendshapes overriding lip movements
- Reduced accuracy for certain phonemes
- Unnatural mouth movement during highly expressive animations

A more complete solution would require:

- A model with a broader viseme set
- Improved morph-target mapping
- Weighted blending between expressions and speech
- Better transition smoothing
- Validation of mouth-cue mappings against the model
- Potential separation of upper-face expressions from lower-face speech controls

Related reports can be tracked through the repository's issue system.

## <img src=".github/assets/star.svg" alt="" width="24" height="24" align="center"> Roadmap

### Implemented

- [x] Interactive 3D avatar
- [x] Google Gemini integration
- [x] Text-to-speech support
- [x] ElevenLabs integration
- [x] SpeechGen integration
- [x] Rhubarb-based lip synchronization
- [x] Multiple voice configurations
- [x] Facial-expression support
- [x] Render deployment configuration
- [x] GitHub issue templates
- [x] Pull-request template
- [x] Contribution guidelines

### Potential Improvements

- [ ] Expanded viseme support
- [ ] Improved expression and speech blending
- [ ] More accurate phoneme-to-morph mapping
- [ ] Streaming AI responses
- [ ] Streaming speech generation
- [ ] Local language-model support
- [ ] Local text-to-speech support
- [ ] VRM avatar support
- [ ] Avatar selection and customization
- [ ] Improved animation state management
- [ ] Multilingual speech configuration
- [ ] Emotion-aware animation control
- [ ] Automated testing
- [ ] Continuous integration
- [ ] Containerized local development
- [ ] Formal API documentation

The roadmap represents possible future work and does not guarantee active development or delivery dates.

## <img src=".github/assets/handshake.svg" alt="" width="24" height="24" align="center"> Contributing

Community contributions are welcome.

Before submitting a pull request:

1. Read [`CONTRIBUTING.md`](CONTRIBUTING.md).
2. Search existing issues and pull requests.
3. Create an issue for significant changes.
4. Keep each pull request focused.
5. Explain what changed and why.
6. Include screenshots for interface changes.
7. Document any new environment variables.
8. Verify that the application builds successfully.

### Development Workflow

```bash
git checkout -b feature/your-change
```

Make and validate your changes:

```bash
npm run build
npm run dev
```

Commit with a clear message:

```bash
git commit -m "feat: describe the improvement"
```

Push the branch:

```bash
git push origin feature/your-change
```

Then open a pull request against the `main` branch.

## <img src=".github/assets/document.svg" alt="" width="24" height="24" align="center"> Issue Reporting

Use the repository's issue templates when reporting bugs or suggesting improvements:

- [Report a bug](https://github.com/naveed-gung/jenny/issues/new/choose)
- [Request a feature](https://github.com/naveed-gung/jenny/issues/new/choose)
- [Review existing issues](https://github.com/naveed-gung/jenny/issues)

A useful bug report should include:

- A clear summary
- Exact reproduction steps
- Expected behavior
- Actual behavior
- Browser and operating system
- Node.js version
- Relevant logs
- Screenshots or recordings
- Avatar or API configuration details when applicable

## <img src=".github/assets/developer.svg" alt="" width="24" height="24" align="center"> Credits and Attribution

### Repository Maintainer

Jenny is maintained by:

**Naveed Sohail Gung**

- [GitHub profile](https://github.com/naveed-gung)
- [Portfolio](https://naveed-gung.dev)

### Original Project by Wawa Sensei

Jenny is based on and extends the open-source **React Three Fiber Virtual Girlfriend** project created by **Wawa Sensei**.

The original repositories are:

- [r3f-virtual-girlfriend-frontend](https://github.com/wass08/r3f-virtual-girlfriend-frontend)
- [r3f-virtual-girlfriend-backend](https://github.com/wass08/r3f-virtual-girlfriend-backend)

The original project established the core implementation pattern for combining:

- React Three Fiber avatar rendering
- Conversational AI
- Generated speech
- Facial expressions
- Rhubarb-based lip synchronization
- Timed avatar mouth movements

This repository builds upon that foundation through additional integrations, customization, deployment configuration, repository organization, and further experimentation.

Full credit is given to Wawa Sensei for creating and openly sharing the original project.

Users intending to study the original implementation, troubleshoot inherited avatar behavior, or compare architectural decisions should consult the upstream repositories linked above.

## <img src=".github/assets/document.svg" alt="" width="24" height="24" align="center"> License

This repository is distributed under the **MIT License**.

See [`LICENSE`](LICENSE) for the complete license text.

> [!IMPORTANT]
> Changing this repository's license does not replace or override the licenses, notices, ownership, or attribution requirements of upstream code and third-party assets.
>
> Any code or assets derived from Wawa Sensei's original repositories remain subject to their applicable upstream license terms. Review those terms before redistributing, relicensing, or using this project commercially.

## <img src=".github/assets/document.svg" alt="" width="24" height="24" align="center"> Third-Party Services

Jenny can integrate with external services including Google Gemini, ElevenLabs, SpeechGen, and Render.

Use of those services is governed by their respective:

- Terms of service
- Privacy policies
- Pricing conditions
- API limitations
- Content policies
- Data-retention practices

Repository users are responsible for configuring and operating these services appropriately.

## <img src=".github/assets/brain.svg" alt="" width="24" height="24" align="center"> Security

Do not expose API keys in:

- Commits
- Pull requests
- Issues
- Screenshots
- Client-side source code
- Build output
- Public deployment logs

Store secrets through environment variables or the secret-management system provided by your hosting platform.

Security-sensitive reports should not include active credentials or private user data.

---

<div align="center">

<img src="frontend/public/logo.svg" alt="Jenny Logo" width="90">

### Jenny

3D conversational AI with speech, animation, and synchronized avatar interaction.

[Live Demo](https://jenny-90fq.onrender.com)
&nbsp;&nbsp;•&nbsp;&nbsp;
[Issues](https://github.com/naveed-gung/jenny/issues)
&nbsp;&nbsp;•&nbsp;&nbsp;
[Contributing](CONTRIBUTING.md)

</div>
