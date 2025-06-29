# Shared Database Setup Guide

## Goal
Make admin panel show orders from BOTH localhost and Render in one place.

## Current Problem
- Local and Render use separate in-memory databases
- Orders don't sync between environments
- Need to check two different admin panels

## Solution: MongoDB Atlas (Free Shared Database)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Create free account
3. Create new cluster (free tier)
4. Get connection string

### Step 2: Install MongoDB Dependencies
```bash
npm install mongoose
```

### Step 3: Update Server Code
Replace in-memory arrays with MongoDB collections.

### Step 4: Set Environment Variables
**Local (.env):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ongod
```

**Render Environment:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ongod
```

## Alternative: Quick API Integration

### Option A: Fetch from Both APIs
Modify admin panel to fetch orders from both:
- Local API: http://localhost:3002/api/admin/orders
- Render API: https://phone-2cv4.onrender.com/api/admin/orders

### Option B: Database Sync Script
Create a script that syncs data between environments.

## Recommended Approach

### Phase 1: Quick Solution
1. **Use Render admin** for production orders
2. **Use local admin** for development testing
3. **Manual sync** when needed

### Phase 2: Shared Database
1. **Set up MongoDB Atlas**
2. **Update server code**
3. **Deploy to both environments**
4. **Single source of truth**

## Next Steps

1. **Choose approach** (quick fix vs shared database)
2. **Implement solution**
3. **Test order visibility** in both environments
4. **Verify admin notifications** work

## Benefits of Shared Database

✅ **Single admin panel** shows all orders  
✅ **Real-time sync** between environments  
✅ **No data loss** when switching environments  
✅ **Production-ready** solution  
✅ **Scalable** for future growth  

## Current Workaround

Until shared database is set up:
- **Check Render admin** for live orders
- **Check local admin** for development orders
- **Use email notifications** to track all orders 