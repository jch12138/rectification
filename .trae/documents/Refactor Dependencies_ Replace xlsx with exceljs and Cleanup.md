I will refactor the project to replace unsupported and unused dependencies, specifically targeting `xlsx` (outdated) and `sqlite3` (unused), and upgrading `Prisma`.

### 1. Dependency Management
- **Remove**: `xlsx` (outdated/unsupported) and `sqlite3` (unused, as Prisma handles the database connection).
- **Add**: `exceljs` (a modern, maintained library for Excel handling).
- **Update**: Upgrade `prisma` and `@prisma/client` to the latest stable versions to resolve version mismatch issues.

### 2. Code Refactoring
#### Client-Side: Admin Import (`src/app/admin/page.tsx`)
- Replace `xlsx` import with `exceljs`.
- Update file reading logic:
  - Change `FileReader` to use `readAsArrayBuffer` (modern standard) instead of `readAsBinaryString`.
  - Use `ExcelJS.Workbook().xlsx.load(buffer)` to parse the file.
  - Rewrite data extraction logic to iterate through `worksheet` rows instead of using `utils.sheet_to_json`.

#### Server-Side: Data Export (`src/app/api/export/route.ts`)
- Replace `xlsx` with `exceljs`.
- Rewrite export logic:
  - Create a new `Workbook` and `Worksheet`.
  - Add headers and rows manually (giving better control over formatting if needed).
  - Use `workbook.xlsx.writeBuffer()` to generate the download stream.

### 3. Verification
- Verify that Excel files can still be imported correctly in the Admin panel.
- Verify that the "Export" button still generates valid `.xlsx` files.
- Ensure the database connection works with the updated Prisma client.
