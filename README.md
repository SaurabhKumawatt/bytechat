<div align="left" style="position: relative;">
<img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="right" width="30%" style="margin: -20px 0 0 20px;">
<h1>BYTECHAT</h1>
<p align="left">
	<em><code>Secure Real-Time Encrypted Messaging Platform</code></em>
</p>
<p align="left">
	<img src="https://img.shields.io/github/license/SaurabhKumawatt/bytechat?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/SaurabhKumawatt/bytechat?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/SaurabhKumawatt/bytechat?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/SaurabhKumawatt/bytechat?style=default&color=0080ff" alt="repo-language-count">
</p>


<p align="left"><!-- default option, no dependency badges. -->
</p>
<p align="left">
	<!-- default option, no dependency badges. -->
</p>
</div>
<br clear="right">

##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
  - [ Project Index](#-project-index)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
  - [ Testing](#-testing)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

---

## Overview

ByteChat is a secure real-time encrypted chat application built using the MERN stack with Socket.io-powered live messaging. The platform supports OTP-based authentication, end-to-end encrypted messaging using RSA + AES encryption, online presence tracking, typing indicators, and media sharing.

The frontend is built with React, TypeScript, Vite, and Tailwind CSS, while the backend uses Node.js, Express.js, MongoDB, and Socket.io for scalable real-time communication.

ByteChat was initially accelerated using Bolt AI for rapid UI scaffolding and workflow generation, followed by custom backend integration, encryption implementation, and advanced real-time features.

---

## Features

- 🔐 End-to-End Encrypted Messaging (RSA-2048 + AES-256)
- ⚡ Real-Time Chat using Socket.io
- 🔑 OTP Authentication with JWT Authorization
- 🟢 Online/Offline Presence Tracking
- ✍️ Live Typing Indicators
- 📩 Message Status Tracking (Sent / Delivered / Seen)
- 📁 Media & File Sharing Support
- 🎤 Voice Note Support
- ☁️ Cloudinary File Storage Integration
- 📱 Fully Responsive UI (Mobile + Desktop)
- 🌙 Modern Dark-Themed Interface
- 💾 Secure Private Key Storage using IndexedDB
- 🔄 Auto Reconnection & Real-Time Sync
- 🧪 Frontend & Backend Testing Support
- 🚀 Built with React + TypeScript + Node.js + MongoDB
- 🤖 Accelerated using Bolt AI

---

##  Project Structure

```sh
└── bytechat/
    ├── LICENSE.txt
    ├── client
    │   ├── .env.example
    │   ├── .gitignore
    │   ├── BUGFIXES.md
    │   ├── ENV_SETUP.md
    │   ├── FILE_SHARING_GUIDE.md
    │   ├── FIXES_SUMMARY.md
    │   ├── FRONTEND_IMPLEMENTATION.md
    │   ├── HISTORY_FIX.md
    │   ├── MESSAGE_FIX_GUIDE.md
    │   ├── MESSAGE_STATUS_GUIDE.md
    │   ├── NOTIFICATION_GUIDE.md
    │   ├── OTP_IMPLEMENTATION.md
    │   ├── PRESENCE_SYSTEM_GUIDE.md
    │   ├── PROGRESS.md
    │   ├── QUICKSTART.md
    │   ├── TYPING_INDICATOR_GUIDE.md
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── postcss.config.js
    │   ├── src
    │   ├── tailwind.config.js
    │   ├── tsconfig.app.json
    │   ├── tsconfig.json
    │   ├── tsconfig.node.json
    │   ├── vite.config.ts
    │   └── vitest.config.ts
    ├── server
    │   ├── .env.example
    │   ├── .gitignore
    │   ├── ENCRYPTION_ANALYSIS.md
    │   ├── PRESENCE_TRACKING.md
    │   ├── README.md
    │   ├── SOCKET_IMPLEMENTATION.md
    │   ├── controllers
    │   ├── index.js
    │   ├── jest.config.js
    │   ├── models
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── routes
    │   ├── socket
    │   ├── tests
    │   └── utils
    └── supabase
        └── migrations
```


###  Project Index
<details open>
	<summary><b><code>BYTECHAT/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/LICENSE.txt'>LICENSE.txt</a></b></td>
				<td>MIT License for open-source educational and development use.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- server Submodule -->
		<summary><b>server</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/package-lock.json'>package-lock.json</a></b></td>
				<td><code>❯ Node.js backend dependency lock file generated via npm.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/index.js'>index.js</a></b></td>
				<td><code>❯ Main Express server entry point with MongoDB connection, Socket.io setup, middleware, and API initialization.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/jest.config.js'>jest.config.js</a></b></td>
				<td><code>❯ Jest testing configuration for backend unit and integration tests.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/.env.example'>.env.example</a></b></td>
				<td><code>❯ Example environment configuration template for backend setup.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/package.json'>package.json</a></b></td>
				<td><code>❯ Backend dependencies and scripts configuration for Express, Socket.io, MongoDB, JWT, and encryption utilities.</code></td>
			</tr>
			</table>
			<details>
				<summary><b>models</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/models/Message.js'>Message.js</a></b></td>
						<td><code>❯ MongoDB schema for encrypted messages, media sharing, delivery status, and chat metadata.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/models/User.js'>User.js</a></b></td>
						<td><code>❯ MongoDB schema for users, RSA public keys, OTP authentication, and online presence tracking.</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>controllers</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/controllers/messageController.js'>messageController.js</a></b></td>
						<td><code>❯ Handles encrypted messaging APIs, chat history retrieval, and message status management.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/controllers/authController.js'>authController.js</a></b></td>
						<td><code>❯ Handles OTP authentication, JWT token generation, and secure user login flow.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/controllers/fileController.js'>fileController.js</a></b></td>
						<td><code>❯ Manages media uploads, Cloudinary integration, and secure file-sharing APIs.</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>utils</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/utils/cloudinary.js'>cloudinary.js</a></b></td>
						<td><code>❯ Cloudinary storage configuration for image, video, document, and voice-note uploads.</code></td>
					</tr>
					</table>
					<details>
						<summary><b>crypto</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/utils/crypto/rsa.js'>rsa.js</a></b></td>
								<td><code>❯ RSA encryption and decryption utility functions for secure key exchange.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/utils/crypto/aes.js'>aes.js</a></b></td>
								<td><code>❯ AES encryption utility for secure real-time message encryption and decryption.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>routes</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/routes/authRoutes.js'>authRoutes.js</a></b></td>
						<td><code>❯ Authentication API routes for OTP verification and JWT-based login.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/routes/fileRoutes.js'>fileRoutes.js</a></b></td>
						<td><code>❯ API routes for secure media and file uploads.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/routes/userRoutes.js'>userRoutes.js</a></b></td>
						<td><code>❯ API routes for fetching users, contacts, and presence information.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/routes/messageRoutes.js'>messageRoutes.js</a></b></td>
						<td><code>❯ API routes for encrypted message retrieval and chat history management.</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>socket</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/socket/index.js'>index.js</a></b></td>
						<td><code>❯ Socket.io server implementation for real-time messaging, typing indicators, and live chat events.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/server/socket/presence.js'>presence.js</a></b></td>
						<td><code>❯ Handles real-time online/offline presence tracking and last-seen updates.</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- client Submodule -->
		<summary><b>client</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/package-lock.json'>package-lock.json</a></b></td>
				<td><code>❯ Frontend dependencies and scripts configuration for React, TypeScript, Vite, Tailwind CSS, and Socket.io client.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/vite.config.ts'>vite.config.ts</a></b></td>
				<td><code>❯ Vite configuration for fast frontend development and optimized production builds.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/vitest.config.ts'>vitest.config.ts</a></b></td>
				<td><code>❯ Vitest configuration for frontend testing and component validation.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/tailwind.config.js'>tailwind.config.js</a></b></td>
				<td><code>❯ Tailwind CSS configuration for responsive UI styling and theme customization.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/eslint.config.js'>eslint.config.js</a></b></td>
				<td><code>❯ ESLint rules and TypeScript linting configuration for frontend code quality.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/tsconfig.node.json'>tsconfig.node.json</a></b></td>
				<td><code>❯ TypeScript configuration for Vite and build tool configuration files.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/.env.example'>.env.example</a></b></td>
				<td><code>❯ Example environment configuration template for frontend setup with API endpoints and services.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/tsconfig.json'>tsconfig.json</a></b></td>
				<td><code>❯ TypeScript compiler configuration for React and Vite frontend application.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/tsconfig.app.json'>tsconfig.app.json</a></b></td>
				<td><code>❯ TypeScript configuration specific to the React application source code.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/index.html'>index.html</a></b></td>
				<td><code>❯ Main HTML entry point for the React application with root DOM element.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/package.json'>package.json</a></b></td>
				<td><code>❯ Frontend dependencies and scripts configuration for React, TypeScript, Vite, Tailwind CSS, and Socket.io client.</code></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/postcss.config.js'>postcss.config.js</a></b></td>
				<td><code>❯ PostCSS configuration for Tailwind CSS processing and CSS transformations.</code></td>
			</tr>
			</table>
			<details>
				<summary><b>src</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/App.tsx'>App.tsx</a></b></td>
						<td><code>❯ Root React component handling routing, authentication flow, and application layout.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/vite-env.d.ts'>vite-env.d.ts</a></b></td>
					<td><code>❯ TypeScript type definitions for Vite client environment variables and imports.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/index.css'>index.css</a></b></td>
					<td><code>❯ Global CSS styles and Tailwind CSS base styles for the application.</code></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/main.tsx'>main.tsx</a></b></td>
					<td><code>❯ React application entry point mounting the root App component to the DOM.</code></td>
					</tr>
					</table>
					<details>
						<summary><b>contexts</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/contexts/AuthContext.tsx'>AuthContext.tsx</a></b></td>
								<td><code>❯ Global authentication state management using React Context API and JWT persistence.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>utils</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/utils/jwt.ts'>jwt.ts</a></b></td>
							<td><code>❯ JWT token parsing and validation utility functions for secure authentication.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/utils/notifications.ts'>notifications.ts</a></b></td>
							<td><code>❯ Browser notifications API wrapper for displaying user notifications and alerts.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/utils/encryption.ts'>encryption.ts</a></b></td>
							<td><code>❯ RSA and AES encryption/decryption utilities for secure end-to-end messaging.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/utils/dateFormat.ts'>dateFormat.ts</a></b></td>
							<td><code>❯ Date and time formatting utility functions for displaying message timestamps.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/utils/otp.ts'>otp.ts</a></b></td>
							<td><code>❯ OTP generation, validation, and verification utility functions for secure authentication.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/utils/indexedDB.ts'>indexedDB.ts</a></b></td>
							<td><code>❯ IndexedDB wrapper for secure local storage of private encryption keys and user data.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>services</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/services/authService.ts'>authService.ts</a></b></td>
							<td><code>❯ API service for OTP verification, JWT token management, and user authentication.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/services/socketService.ts'>socketService.ts</a></b></td>
							<td><code>❯ Socket.io client service for real-time messaging, presence tracking, and event handling.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>components</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/components/OnlineIndicator.tsx'>OnlineIndicator.tsx</a></b></td>
							<td><code>❯ React component displaying user online/offline status with visual indicator.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/components/ChatBubble.tsx'>ChatBubble.tsx</a></b></td>
							<td><code>❯ React component rendering individual encrypted messages with status indicators.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/components/OTPInput.tsx'>OTPInput.tsx</a></b></td>
							<td><code>❯ React component for OTP input with auto-focus and secure digit entry.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>test</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/test/setup.ts'>setup.ts</a></b></td>
							<td><code>❯ Vitest configuration and test environment setup for frontend testing.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/test/otp.test.ts'>otp.test.ts</a></b></td>
							<td><code>❯ Unit tests for OTP generation and validation utility functions.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/test/ui.test.ts'>ui.test.ts</a></b></td>
							<td><code>❯ Component and UI integration tests for React components and user interactions.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>lib</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/lib/supabase.ts'>supabase.ts</a></b></td>
							<td><code>❯ Supabase client initialization for database operations and real-time subscriptions.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>pages</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/pages/Chat.tsx'>Chat.tsx</a></b></td>
								<td><code>❯ Main real-time chat interface with encrypted messaging, typing indicators, and media support.</code></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/client/src/pages/Login.tsx'>Login.tsx</a></b></td>
								<td><code>❯ OTP-based authentication page with secure login and user onboarding flow.</code></td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- supabase Submodule -->
		<summary><b>supabase</b></summary>
		<blockquote>
			<details>
				<summary><b>migrations</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/SaurabhKumawatt/bytechat/blob/master/supabase/migrations/20251026063050_create_users_and_otps_tables.sql'>20251026063050_create_users_and_otps_tables.sql</a></b></td>
						<td><code>❯ Supabase database migration script for creating users and OTP authentication tables.</code></td>
					</tr>
					</table>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---
##  Getting Started

###  Prerequisites

Before getting started with bytechat, ensure your runtime environment meets the following requirements:

- **Programming Language:** JavaScript
- **Package Manager:** Npm
- **Container Runtime:** Docker


###  Installation

Install bytechat using one of the following methods:

**Build from source:**

1. Clone the bytechat repository:
```sh
❯ git clone https://github.com/SaurabhKumawatt/bytechat
```

2. Navigate to the project directory:
```sh
❯ cd bytechat
```

3. Install the project dependencies:


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker build -t SaurabhKumawatt/bytechat .
```




###  Usage
Run bytechat using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm start
```


**Using `docker`** &nbsp; [<img align="center" src="https://img.shields.io/badge/Docker-2CA5E0.svg?style={badge_style}&logo=docker&logoColor=white" />](https://www.docker.com/)

```sh
❯ docker run -it {image_name}
```


###  Testing
Run the test suite using the following command:
**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm test
```


---
## Project Roadmap

- [x] Real-time encrypted messaging
- [x] JWT + OTP authentication
- [x] RSA & AES encryption implementation
- [x] Online presence tracking
- [x] Typing indicators
- [x] Media & file sharing
- [x] Voice note support
- [x] Responsive chat UI
- [ ] Group chat support
- [ ] Video & voice calling
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Message reactions & replies
- [ ] AI-powered smart chat features

---

##  Contributing

- **💬 [Join the Discussions](https://github.com/SaurabhKumawatt/bytechat/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/SaurabhKumawatt/bytechat/issues)**: Submit bugs found or log feature requests for the `bytechat` project.
- **💡 [Submit Pull Requests](https://github.com/SaurabhKumawatt/bytechat/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/SaurabhKumawatt/bytechat
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/SaurabhKumawatt/bytechat/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=SaurabhKumawatt/bytechat">
   </a>
</p>
</details>

---

##  License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

##  Acknowledgments

- React & Vite ecosystem
- Socket.io for real-time communication
- MongoDB for database management
- Cloudinary for media storage
- Tailwind CSS for UI styling
- Bolt AI for rapid frontend scaffolding and development acceleration
- Open-source community contributors

---