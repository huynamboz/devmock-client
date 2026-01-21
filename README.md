# Mock API Builder

A lightweight **mock backend + mock database** built for **Frontend Developers** — no backend knowledge required.  
Create data models, generate mock data, and call real REST APIs instantly while focusing entirely on UI development.

## ✨ Features

- Create **Projects** and organize your mock data
- Define **Resources** (tables/collections) like `users`, `products`, `posts`, etc.
- Add **Fields** with supported types:
  - `string`
  - `number`
  - `boolean`
  - `date`
  - `faker` (auto-generate realistic test data)
- Switch **Data Mode**:
  - **Schema Mode** — simple structured fields
  - **JSON Template Mode** — supports complex nested objects/arrays
- Clean, RESTful dynamic API endpoints

## 🎯 Designed For

- Frontend devs learning React / Vue / Svelte / Next.js
- Rapid UI prototyping without backend setup
- Portfolio / demo / hackathon projects
- Teams who need mock data that actually looks **real**

## 🏗 Tech Stack

| Layer     | Technology             | Reason                                      |
| --------- | ---------------------- | ------------------------------------------- |
| Backend   | **NestJS**             | Scalable, clean architecture                |
| ORM       | **Prisma**             | Strong Postgres + DX                        |
| Database  | **PostgreSQL (JSONB)** | Flexible schema, no heavy migrations needed |
| Auth      | **JWT**                | Works anywhere, simple integration          |
| Mock Data | **Faker.js**           | Generate realistic sample data              |

## 🧱 Backend Roadmap (Detailed)

| Area                     | Task                                                      | Status              | Notes                                           |
| ------------------------ | --------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| **Auth / Users**         | JWT authentication                                        | ✅ Done             | Core login / identity functional                |
|                          | Authorization per project/resource                        | ✅ Done             | Owner-based access enforced                     |
| **Projects**             | Create / List / Delete projects                           | ✅ Done             | Workspaces structured                           |
|                          | Project metadata (stats, updatedAt)                       | 🔜                  | Optional for dashboard summary                  |
| **Resources**            | Create / List / Delete resources                          | ✅ Done             | Logical data tables                             |
|                          | Get Resource detail (for schema UI)                       | ✅ Done             | Returned with fields included                   |
|                          | Rename resource                                           | 🔜                  | Improves DX and data clarity                    |
| **Fields (Schema)**      | Add / Edit / Delete fields                                | ✅ Done             | Field-level schema control                      |
|                          | Support `fakerType` when type = `faker`                   | ✅ Done             | Enables controlled fake data                    |
|                          | JSON Template mode support (backend storage)              | ✅ Done             | `resource.mode` + `resource.jsonTemplate` added |
|                          | Validate template syntax on save                          | 🔜                  | Avoid invalid generation errors                 |
| **Records (Data Layer)** | Store record as JSONB (`Record.data`)                     | ✅ Data model ready | Model supports any structure                    |
|                          | CRUD API for records                                      | 🔜 Next priority    | `/records` service + validation rules           |
|                          | Pagination + sorting                                      | 🔜                  | Prevent performance issues on large sets        |
|                          | Validation against schema/JSON Template                   | 🔜                  | Ensures consistent dataset shape                |
| **Mock Data Generation** | Faker-based generation service                            | 🟡 In progress      | Used when mode = `schema`                       |
|                          | Recursive generator for JSON Template                     | 🔜                  | Supports nested objects / arrays                |
|                          | Background/bulk generation job                            | 🔜                  | Needed for large `count` values                 |
| **Public REST API**      | Dynamic CRUD endpoint → `/api/:project/:resource`         | 🔜                  | Core feature for FE integration                 |
|                          | Dynamic CRUD detail → `/api/:project/:resource/:recordId` | 🔜                  | For item-level view/edit                        |
|                          | Error responses + validation contracts                    | 🔜                  | Ensure consistent DX for frontend devs          |
| **API Access Control**   | API Keys (generate, revoke, list)                         | 🔜                  | Allows calling API without JWT                  |
|                          | Token-based access to dynamic API                         | 🔜                  | Required for embedding into frontend apps       |
|                          | Rate limit per plan (Free vs Pro)                         | 🔜                  | backend-level enforcement (likely Upstash)      |
| **Export / Integration** | Export resource schema → Supabase SQL                     | ⭐ Planned          | Converts our metadata → Postgres tables         |
|                          | Export records → Supabase INSERT batches                  | ⭐ Planned          | Moves mock → real data without rewriting FE     |
| **Performance / Infra**  | Index `Record.resourceId`                                 | ✅ Done             | Enables fast record filtering                   |
|                          | Query optimization (limit, projection)                    | ✅ Policy ready     | Default pagination avoids large payloads        |
|                          | Optional Redis cache for GET list                         | 🔜                  | Only needed >2k users or heavy load             |
| **Quality / Tooling**    | DTO validation (class-validator)                          | ✅                  | Framework-level input validation                |
|                          | Consistent error handling (global filter)                 | ✅                  | Proper structured errors                        |
|                          | Logging & request tracing                                 | 🔜                  | Helps debugging dynamic API behavior            |

## 🔜 Next Steps (In Progress)

- **Records CRUD** — Store and query JSONB data
- **Dynamic REST API** → `/api/:projectId/:resourceName/...`
- **Fake Data Generator**
  - Preview on front-end
  - Persist generated records on backend
- **API Keys** for external frontend access
- **Request Rate Limits** (Free vs Pro tiers)

## 🌱 Future Enhancements

- **AI-Assisted Data Generation**
  - Describe your dataset → AI builds schema + mock data
- **Code Snippet Generator**
  - Auto-generate usage snippets for:
    - React
    - Vue
    - Svelte
    - Axios / Fetch / TanStack Query
- **One-Click Export to Supabase**
  - Convert mock DB → real Postgres tables instantly
  - Keep the same frontend code

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### 2. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
VITE_API_BASE_URL=http://localhost:3002/api/v1
VITE_API_BASE_MOCK_URL=http://localhost:3002/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

### 3. Installation

Install the project dependencies:

```bash
npm install
# or
yarn install
```

### 4. Running the Project

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

---

## 🧭 Philosophy

> Focus on UI, not backend.
> Data should be easy to create, realistic to display, and effortless to integrate.

---

## 🚀 Status

The project backend foundation is complete and stable.  
We are currently implementing **record storage and dynamic API access**.

Frontend dashboard development is in progress.

Stay tuned ✨
