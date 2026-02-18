# SheetAPI - Transform Google Sheets to REST API

SheetAPI is a no-code API Gateway that transforms Google Sheets into RESTful JSON APIs instantly. Perfect for rapid prototyping and data management.

## Features

- **Instant Setup**: Connect your Google Sheets and get REST APIs in seconds
- **Full CRUD Operations**: Support for GET, POST, PUT, DELETE methods
- **Secure Authentication**: Built-in support for Basic Auth and Bearer tokens
- **Real-time Sync**: Direct connection to Google Sheets
- **User-friendly Dashboard**: Manage projects and endpoints with ease

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **API Integration**: Google Sheets API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Sheety
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Set up Supabase database:
- Go to Supabase SQL Editor
- Copy and run the SQL from `supabase/schema.sql`

5. Configure Google OAuth:
- Follow instructions in `supabase/README.md`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment to Vercel

### Step 1: Prepare Your Project

Ensure all environment variables are set correctly in `.env.local`.

### Step 2: Deploy to Vercel

1. Install Vercel CLI (optional):
```bash
npm install -g vercel
```

2. Deploy using Vercel CLI:
```bash
vercel
```

Or deploy via Vercel Dashboard:
- Go to [vercel.com](https://vercel.com)
- Import your Git repository
- Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Step 4: Update OAuth Redirect URLs

Add your Vercel domain to:
1. **Supabase Dashboard** > Authentication > URL Configuration:
   - Add `https://your-domain.vercel.app/auth/callback`

2. **Google Cloud Console** > OAuth 2.0 Client > Authorized redirect URIs:
   - Add `https://your-domain.vercel.app/auth/callback`

### Step 5: Deploy

Push to your Git repository, and Vercel will automatically deploy.

## Usage

### 1. Sign in with Google

Click "Get Started" and sign in with your Google account. Make sure to grant access to Google Sheets.

### 2. Create a Project

- Click "New Project"
- Enter project name
- Paste your Google Sheets URL
- Click "Create Project"

The system will automatically:
- Extract the spreadsheet ID
- Fetch all sheet names
- Create API endpoints for each sheet

### 3. Configure API Endpoints

In the API tab:
- View all available endpoints
- Toggle HTTP methods (GET, POST, PUT, DELETE)
- Copy endpoint URLs

### 4. Set Up Authentication (Optional)

In the Authentication tab:
- Choose authentication type (None, Basic Auth, Bearer Token)
- Configure credentials
- Save settings

### 5. Use Your API

Example GET request:
```bash
curl https://your-domain.vercel.app/api/v1/{projectId}/{sheetName}
```

Example POST request:
```bash
curl -X POST https://your-domain.vercel.app/api/v1/{projectId}/{sheetName} \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

With Bearer Token:
```bash
curl https://your-domain.vercel.app/api/v1/{projectId}/{sheetName} \
  -H "Authorization: Bearer your-token"
```

## API Response Format

All responses follow the Sheety-style format:

```json
{
  "sheetName": [
    {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── v1/[projectId]/[sheetName]/  # Dynamic API routes
│   ├── auth/                              # Auth callback
│   ├── dashboard/                         # Dashboard pages
│   ├── login/                             # Login page
│   └── page.tsx                           # Landing page
├── components/
│   ├── tabs/                              # Tab components
│   ├── NewProjectModal.tsx
│   └── ProjectCard.tsx
├── lib/
│   ├── supabase/                          # Supabase clients
│   ├── auth/                              # Auth helpers
│   ├── google-sheets.ts                   # Google Sheets API
│   └── transformer.ts                     # Data transformation
└── supabase/
    ├── schema.sql                         # Database schema
    └── README.md                          # Setup instructions
```

## Troubleshooting

### "No Google refresh token found"
- Sign out and sign in again
- Make sure you granted Google Sheets access during OAuth

### "Project not found"
- Check if the project belongs to your account
- Verify the project ID in the URL

### "Failed to fetch data"
- Verify spreadsheet ID is correct
- Ensure you have access to the Google Sheet
- Check if the sheet name exists

## License

This is a private tool for personal use.

## Support

For issues and questions, refer to the documentation or create an issue in the repository.
