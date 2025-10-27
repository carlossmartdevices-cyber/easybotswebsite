# Get Required Credentials for Production

You need to update 2 values in `.env.production.local` before deploying.

## 1. Firebase Admin Private Key

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click on your project: **studio-9933426702-65d9f**

2. **Navigate to Service Accounts**
   - Click the gear icon (⚙️) → **Project settings**
   - Click on **Service accounts** tab

3. **Generate Private Key**
   - Click **"Generate new private key"** button
   - Confirm by clicking **"Generate key"**
   - A JSON file will download (e.g., `studio-9933426702-65d9f-firebase-adminsdk-xxxxx.json`)

4. **Extract the Values**

   Open the downloaded JSON file. It looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "studio-9933426702-65d9f",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@studio-9933426702-65d9f.iam.gserviceaccount.com",
     ...
   }
   ```

5. **Update `.env.production.local`**

   Copy these values from the JSON:

   ```env
   FIREBASE_ADMIN_CLIENT_EMAIL=<paste client_email here>
   FIREBASE_ADMIN_PRIVATE_KEY="<paste private_key here>"
   ```

   **IMPORTANT**:
   - Keep the quotes around the private key
   - Keep the `\n` characters (they represent line breaks)
   - The entire private key should be on ONE line

   Example:
   ```env
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc123@studio-9933426702-65d9f.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDV...\n-----END PRIVATE KEY-----\n"
   ```

## 2. Google AI API Key

### Steps:

1. **Go to Google AI Studio**
   - Visit: https://aistudio.google.com/app/apikey

2. **Sign in with your Google Account**

3. **Create API Key**
   - Click **"Create API Key"** button
   - Choose **"Create API key in new project"** or select existing project
   - Copy the generated API key (starts with `AIza...`)

4. **Update `.env.production.local`**

   Replace the placeholder:
   ```env
   GOOGLE_GENAI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Quick Edit Command

After getting the credentials, edit the file:

```powershell
notepad "c:\Users\carlo\Documents\Easy Bots Website\easybots-store\.env.production.local"
```

## Verification

After updating, your `.env.production.local` should have:

- ✓ `NEXT_PUBLIC_BASE_URL=https://pnptv.app`
- ✓ `FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@studio-9933426702-65d9f.iam.gserviceaccount.com`
- ✓ `FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...actual key...\n-----END PRIVATE KEY-----\n"`
- ✓ `GOOGLE_GENAI_API_KEY=AIzaSy...your_actual_key`
- ✓ `EPAYCO_TEST=false`
- ✓ `EPAYCO_TEST_MODE=false`
- ✓ `ADMIN_PHONE_NUMBER=+573028573797`

## Next Steps

Once you've updated the credentials:

1. Save the file
2. Run the deployment script:
   ```powershell
   cd "c:\Users\carlo\Documents\Easy Bots Website\easybots-store"
   bash deploy-to-server.sh
   ```

Or deploy manually following [DEPLOY-TO-PNPTV.md](DEPLOY-TO-PNPTV.md)
