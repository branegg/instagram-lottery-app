# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for your Instagram lottery app.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (M0 Sandbox - Free tier)
3. Complete the registration process

## Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose the **M0 FREE** tier
3. Select a cloud provider and region (closest to your users)
4. Name your cluster (e.g., "lottery-app-cluster")
5. Click "Create"

## Step 3: Set Up Database Access

1. In the left sidebar, click **Database Access** under Security
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and strong password (save these!)
5. Under "Database User Privileges", select **Read and write to any database**
6. Click **Add User**

## Step 4: Configure Network Access

1. In the left sidebar, click **Network Access** under Security
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
   - For production, you can whitelist specific IPs later
4. Click **Confirm**

## Step 5: Get Your Connection String

1. Go back to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your database password
7. Add `/lottery-app` before the `?` to specify the database name:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lottery-app?retryWrites=true&w=majority
   ```

## Step 6: Update Your Environment Variables

### For Local Development:

Update your `backend/.env` file:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lottery-app?retryWrites=true&w=majority
```

### For Vercel Deployment:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production (and Preview if needed)
5. Click **Save**
6. Redeploy your backend for changes to take effect

## Step 7: Test Your Connection

After updating the environment variables, restart your backend server:

```bash
cd backend
npm start
```

You should see: `MongoDB connected and initialized` in the console.

## Troubleshooting

### Connection Errors

- **Authentication failed**: Double-check your username and password in the connection string
- **IP not whitelisted**: Make sure you added your IP or 0.0.0.0/0 in Network Access
- **Cannot connect**: Check if your connection string is correctly formatted

### Vercel Deployment Issues

- Make sure the `MONGODB_URI` environment variable is set in Vercel
- Redeploy your backend after adding environment variables
- Check Vercel logs for any connection errors

## Database Management

To view and manage your data:

1. Go to MongoDB Atlas dashboard
2. Click **Browse Collections** on your cluster
3. You'll see the `lottery-app` database with an `entries` collection
4. Here you can view, edit, and delete entries manually

## Security Best Practices

1. **Never commit** your connection string to Git
2. Use strong passwords for database users
3. In production, whitelist only necessary IP addresses
4. Rotate database passwords periodically
5. Use separate databases for development and production
