# 🐉 Dungeon Revealer - First Time Setup Guide

After Docker container starts, follow these steps to get everything working:

## Step 1: Access the App

- Open browser: `http://localhost:3000`
- You should see the login screen

## Step 2: Login as DM

- Click **"DM Area"** button
- Enter password: `DM` (or whatever you set in Docker)
- Press Enter

## Step 3: Create Your First Map

1. Click **"Maps"** in the left sidebar
2. Click **"Create New Map"** button
3. Give it a name (e.g., "Tavern")
4. Upload a map image (or leave blank for now)
5. Click **"Create"**

## Step 4: Initialize Fog-of-War (IMPORTANT!)

This step is crucial for Templates to work!

1. **Open the map** you just created
2. Look for the **"Shroud All"** button in the toolbar
3. Click it to initialize the fog-of-war system
4. You should see the entire map covered with a dark overlay

✅ **Now the Templates system will work!**

## Step 5: Add a Token to the Map

1. In the map, look for **"Add Token"** or **"Upload Token"** option
2. Add a token/marker to the map
3. Click on it to select it

## Step 6: Open Templates Panel

1. Look for the **List icon** (☰) button in the right sidebar
2. Click it to open the **Templates Panel**
3. You should see available templates (Quest, NPC, Encounter, etc.)
4. Click any template to append its content to your note!

---

## 🎯 Quick Checklist

- [ ] Logged in as DM
- [ ] Created a map
- [ ] Clicked "Shroud All" to initialize fog-of-war
- [ ] Added a token to the map
- [ ] Selected the token
- [ ] Opened Templates panel
- [ ] Successfully used a template

If all ✅, you're ready to use Dungeon Revealer!

---

## 📝 What Templates Do

**Templates are pre-built note formats** that you can append to any note:

| Template      | Purpose                                            |
| ------------- | -------------------------------------------------- |
| **Quest**     | For quests with objectives, rewards, giver         |
| **NPC**       | For non-player characters with traits, motivations |
| **Encounter** | For combat encounters with difficulty, enemies     |
| **Item**      | For magical items with rarity, effects             |
| **Location**  | For places with description, inhabitants           |
| **Shop**      | For merchants with inventory                       |
| **Plot**      | For campaign plot points and hooks                 |

Just select the template from the panel and it appends the structure to your current note!

---

## 🐛 If Templates Still Don't Work

1. Make sure you clicked **"Shroud All"** on your map (this is essential!)
2. Check browser console (F12 → Console tab) for errors
3. Refresh page (Ctrl+R) and try again
4. Check that you have a token selected on the map

---

## 🚀 Next Steps

- Create multiple maps for different campaign locations
- Use templates for all your NPCs, quests, and encounters
- Add tokens for player characters and enemies
- Share player area with your players at: `http://your-computer-ip:3000`

Enjoy! 🎲
