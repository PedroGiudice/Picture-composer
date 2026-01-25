# Tauri Frontend Agent Knowledge Base

## 1. Tauri Integration (HotCocoa Specific)

### Overview
HotCocoa uses a dual-stack architecture (React + Rust/Tauri). The frontend interacts with the Rust backend via Tauri's `invoke` command and uses various Tauri plugins for local system access.

### Frontend Integration Service (src/services/tauri.ts)
```typescript
import { invoke } from '@tauri-apps/api/core';

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Example commands: save_photo, list_photos, delete_photo, load_config, save_config
export async function savePhotoLocally(name: string, base64Data: string): Promise<string | null> {
  if (!isTauri()) return null;
  return await invoke<string>('save_photo', { name, base64Data });
}
```

### Persistance (src/hooks/useTauriStore.ts)
Uses `@tauri-apps/plugin-store` for local JSON settings persistence with a fallback to `localStorage`.

### Key Components usage
`PhotoUploader.tsx` demonstrates using `@tauri-apps/plugin-dialog` for native file picking and `@tauri-apps/plugin-fs` for reading files as binary data.

---

## 2. General Frontend Development Guidelines

### Core Principles
1. **Lazy Load Everything Heavy**: Routes, DataGrid, charts, editors.
2. **Suspense for Loading**: Use `SuspenseLoader`, not early returns (prevents layout shift).
3. **useSuspenseQuery**: Primary data fetching pattern for new code.
4. **Organized Features**: Subdirectories for `api/`, `components/`, `hooks/`, `helpers/`, `types/`.
5. **Styles**: Use MUI `sx` prop. <100 lines inline, >100 lines separate `.styles.ts`.
6. **Import Aliases**: `@/` (src), `~types`, `~components`, `~features`.
7. **useMuiSnackbar**: For all user notifications.

### Component Pattern (React.FC)
```typescript
import React, { useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

interface Props { id: number; }

export const MyComponent: React.FC<Props> = ({ id }) => {
    const { data } = useSuspenseQuery({
        queryKey: ['feature', id],
        queryFn: () => api.get(id),
    });

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 3 }}>{data.name}</Paper>
        </Box>
    );
};
export default MyComponent;
```

### Data Fetching (useSuspenseQuery)
- **Primary**: Use `useSuspenseQuery` with Suspense boundaries.
- **Cache-First**: Check existing cache (e.g., list/grid cache) before calling API.
- **Route Format**: Use `/feature/path`, NOT `/api/feature/path`.

### File Organization
- `features/`: Domain-specific (logic + components + api).
- `components/`: Purely reusable UI primitives.
- Feature structure:
  ```
  features/name/
    api/        # featureApi.ts
    components/ # FeatureMain.tsx
    hooks/      # useFeature.ts
    types/      # index.ts
    index.ts    # Public API
  ```

### Styling (MUI v7)
- Use `sx` prop.
- **Grid v7**: `<Grid size={{ xs: 12, md: 6 }}>` (Size prop, not direct breakpoints).
- **Standards**: 4 spaces indentation, single quotes, trailing commas.

### Routing (TanStack Router)
- Folder-based: `routes/path/index.tsx`.
- Lazy load components inside routes.
- Use `loader` for breadcrumbs (`crumb`).

### Performance
- `useMemo`: Expensive filter/sort/transform.
- `useCallback`: Handlers passed to children.
- `React.memo`: Expensive leaf components.
- `use-debounce`: 300ms for search/filtering.

### TypeScript Standards
- Strict mode enabled.
- No `any` type.
- Explicit return types on functions.
- Use `import type` for type-only imports.
- JSDoc on prop interfaces.
