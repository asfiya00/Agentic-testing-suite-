# Sentinel frontend

## Run on Windows (PowerShell)

1. Extract this ZIP.
2. Open the extracted `sentinel-frontend` folder in VS Code (the folder containing `package.json`).
3. In VS Code choose **Terminal → New Terminal**.
4. Confirm you are in the project root:

   ```powershell
   dir package.json
   ```

   `package.json` should be listed. If not, use `cd` to enter the folder that contains it.

5. Install packages:

   ```powershell
   npm install
   ```

6. Start the development server:

   ```powershell
   npm run dev
   ```

7. Open the URL Vite prints, usually `http://localhost:5173/`.

## Pages

- Landing: `/`
- Sign in: `/login` or `/signin`
- Create account: `/signup`
- Dashboard: `/dashboard`

The sign-in and sign-up pages use the same shared `Auth` component and therefore have the same background, colors, and layout styling.

## If Chrome displays a blank page

- Keep the terminal running.
- In Chrome press `Ctrl + Shift + R`.
- If the blank page persists, stop Vite with `Ctrl + C`, then run:

  ```powershell
  Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
  npm run dev -- --force
  ```

- The app includes a React error screen that displays render-time exceptions. Also open Chrome DevTools with `F12` and check **Console** and **Network** for failed JavaScript module requests.

## Authentication note

Login and sign-up are frontend demonstrations. Connect them to your backend authentication endpoint for real account creation, sign-in, OAuth, and password reset.
