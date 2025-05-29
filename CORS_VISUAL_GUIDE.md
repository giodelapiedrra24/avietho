# Visual Guide: Configuring CORS in Supabase

This step-by-step guide will show you exactly where to find and how to configure CORS settings in Supabase for your application.

## Step 1: Access the Supabase Dashboard

- Go to https://app.supabase.com
- Log in with your account
- Select your project from the dashboard

## Step 2: Navigate to API Settings

- Look at the left sidebar menu
- Click on **Settings** (near the bottom of the sidebar)
- In the submenu that appears, click on **API**

![Supabase Settings Navigation]
(In the Supabase dashboard, Settings is represented by a gear icon in the left sidebar)

## Step 3: Find the CORS Section

- Scroll down the API settings page
- Look for the section titled **CORS (Cross-Origin Resource Sharing)**
- This section will show your current CORS configuration

![CORS Section]
(The CORS section appears in the middle of the API settings page)

## Step 4: Add Your Production Domain

- In the **Allowed Origins** field, type your production domain
- Make sure to include the protocol (e.g., `https://your-website.com`)
- Do not include any paths, just the domain with protocol
- Click the **+ Add** button

![Adding Domain]
(Type your domain in the field and click the Add button)

## Step 5: Verify All Required Domains Are Listed

Your list of allowed origins should include:
- `http://localhost:3000` (for local development)
- Your production domain (e.g., `https://your-website.com`)
- Any other domains that need to access your Supabase resources

![Completed CORS Configuration]
(The list should show all your allowed domains)

## Step 6: Save Your Changes

- Make sure to click the **Save** button at the bottom of the CORS section
- Look for a confirmation message indicating your changes were saved successfully

## Step 7: Test Your Configuration

After saving your CORS settings:

1. Deploy your application to your production domain
2. Open the application in your browser
3. Open browser developer tools (F12 or right-click > Inspect)
4. Go to the Console tab
5. Look for any CORS-related errors

If there are no CORS errors and your images load correctly, your configuration is successful!

## Common Mistakes to Avoid

1. **Missing protocol**: Always include `http://` or `https://` in your domain
2. **Including paths**: Only add the domain, not specific paths
3. **Typos in domain name**: Double-check for spelling errors
4. **Forgetting to save**: Always click the Save button after making changes
5. **Using wildcards incorrectly**: If using wildcards (`*`), understand their implications

## Need More Help?

If you're still experiencing CORS issues after following this guide:

1. Check your browser's console for specific error messages
2. Verify your backend CORS configuration in `app.js`
3. Ensure your environment variables are set correctly
4. Test with a simple direct request to your Supabase storage URL

Remember, CORS issues are about where the request is coming FROM, not where it's going TO. Make sure the domain your application is hosted on is included in the allowed origins. 