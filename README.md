# Raihan WiFi Billing Management - Client

The frontend application for the Raihan WiFi Billing Management system. This application provides robust interfaces for administrators and employees to manage internet clients, track payments, and manage system staff.

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **State Management & Data Fetching**: TanStack React Query & React Context API
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## ✨ Features

- **Role-Based Access Control (RBAC)**: Secure routes for `admin` and `employee` roles, ensuring users only access authorized areas.
- **Admin Dashboard**:
  - Comprehensive system overview.
  - **Employee Management**: Add, update, and manage staff members.
  - **Client Management**: Handle customer profiles, internet plans, and statuses.
  - **Billing Management**: Full access to all billing records and financial tracking.
- **Employee Dashboard**:
  - Day-to-day operational view.
  - **Billing Tasks**: Update and manage client billing statuses directly (e.g., mark invoices from Due to Paid).
- **Authentication**: Secure JWT-based authentication using `localStorage` caching with seamless redirection handling on expiration.
- **Dynamic API Routing**: Automatically resolves backend URLs based on environment mode.

## 📦 Project Structure

```text
src/
├── components/   # Reusable UI components (including shadcn/ui components)
├── contexts/     # Global React Context providers (AuthContext)
├── pages/        # Main application views/pages
│   ├── admin/    # Admin-specific pages (Dashboard, Clients, Employees, Billing)
│   └── employee/ # Employee-specific pages (Dashboard, Billing)
├── services/     # API integration logic and Axios instance configuration
└── App.tsx       # Main router and root layout provider
```

## 🛠️ Local Setup Guide

Follow these steps to run the application securely on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A package manager like `npm`, `yarn`, `pnpm`, or `bun`

### Installation

1. **Navigate to the project directory** (after cloning):
   ```bash
   cd raihan-wifi-billing-management-client
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or 
   bun install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```
   The application will start, typically accessible at `http://localhost:5173`.
   
   *⚠️ Note: By default, the development environment expects the backend API server to be running locally at `http://localhost:5000/api/v1`.*

### Building for Production

To create an optimized, production-ready build:

```bash
npm run build
```
This generates static files into the `dist` directory. The application includes a `vercel.json` file for routing configuration and is continuously deployed on Vercel. 

### Linters & Tests
To run the standard static code analysis checks:
```bash
npm run lint
```

## 🔗 API Environment & Configuration

API configurations are centralized within `src/services/api.ts`. The Axios instance intelligently toggles the base URL depending on your Vite environment mode limit:

- **Development Mode** (`npm run dev`): `http://localhost:5000/api/v1` 
- **Production Mode** (`npm run build`): `https://raihan-wifi-billing-management-serv.vercel.app/api/v1`

If you are running the backend repository on a different local port, please adjust the `isDevelopment` ternary check inside the `src/services/api.ts` file accordingly.
