# Project Structure Documentation

## Project Specifications

### Project Description
This project delivers a **modular, reusable GIS component** for integration into a React dashboard. It leverages **react-map-gl** for interactive mapping, supports dynamic connections to various datasets, and enables seamless matching and rendering of external GEOJSON data, including province-level files.

### Architecture

- **Component-Based:** Each GIS feature is encapsulated in a reusable React component.
- **Data-Agnostic:** The component can connect to multiple datasets, with adapters for different data sources.
- **GEOJSON Integration:** Data is normalized and matched to GEOJSON for visualization, supporting province-level files.
- **Theming:** Uses a predefined `theme.css` for consistent styling across the application.
- **Extensible:** New data connectors and visualization layers can be added with minimal changes to the core.

### Technologies & Dependencies

- **React** (v18+)
- **react-map-gl**
- **TypeScript**
- **GEOJSON** (for geospatial data)
- **Jest** (for testing)
- **Styled Components** or **CSS Modules** (for styling)
- **ESLint**, **Prettier** (for code quality)

### Folder Structure

| Folder/File            | Purpose/Contents                                                     |
|------------------------|---------------------------------------------------------------------|
| `src/`                 | Main source code                                                    |
| `src/components/`      | Modular GIS components (Map, Layers, Controls)                      |
| `src/hooks/`           | Custom React hooks (e.g., data fetching, map events)                |
| `src/utils/`           | Utility functions (e.g., data adapters, GEOJSON matchers)           |
| `src/types/`           | TypeScript type definitions                                         |
| `src/datasets/`        | Example datasets and connectors                                     |
| `src/datasets/geojson/` | Province-level GEOJSON files                                        |
| `src/styles/`          | Styling files (global styles, theme, etc.)                          |
| `src/styles/theme.css` | Predefined theme stylesheet for consistent UI                       |
| `src/config/`          | Configuration files (e.g., map settings, dataset configs)           |
| `tests/`               | Unit and integration tests                                          |
| `docs/`                | Project documentation                                               |
| `public/`              | Static assets                                                       |
| `project-specs.md`     | This project structure documentation                                |

### Coding Conventions

- **File Naming:** Use kebab-case for files and folders (e.g., `map-component.tsx`).
- **Component Structure:** Functional components with hooks; each in its own file.
- **Type Safety:** All code in TypeScript with explicit types.
- **Documentation:** JSDoc comments for complex logic; concise inline comments for clarity.
- **Error Handling:** All async operations wrapped in try/catch; user-friendly error messages.
- **Styling:** Use CSS-in-JS or CSS Modules for scoped styles; global theming via `theme.css`.
- **Testing:** Follow Arrange-Act-Assert pattern; mock external dependencies.

### Development Workflow

- **Branch Naming:** `feature/`, `bugfix/`, `chore/`
- **Commit Messages:** Conventional Commits format (e.g., `feat: add dataset connector`)
- **Pull Requests:** Require code review and successful CI checks before merging
- **Testing:** Run all tests and linting before submitting PRs
- **Documentation:** Update `docs/` and `project-specs.md` with significant changes

