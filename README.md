# Friend Network 🌐

A beautiful social network visualization app built with React, Vite, and Supabase. Visualize your friend connections as an interactive force-directed graph.

![Friend Network](https://api.dicebear.com/7.x/shapes/svg?seed=network)

## Features

- 🎨 **Interactive Graph View** - Force-directed graph visualization with zoom, pan, and click interactions
- 🔍 **Search** - Find people quickly with Ctrl+K shortcut
- 📊 **Statistics Dashboard** - Network analytics, most connected person, relationship breakdown
- 👥 **Admin Panel** - Add, edit, and delete people and relationships
- 🔗 **8 Relationship Types** - Lover, Best Friend, Family, Colleague, Crush, Rival, Ex, Acquaintance
- ⚡ **Real-time Updates** - Changes sync instantly via Supabase
- 🌙 **Dark Theme** - Beautiful glassmorphism UI with smooth animations

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Install dependencies: `npm install`
4. Run the dev server: `npm run dev`

## Tech Stack

- **React 19** + **Vite 7**
- **react-force-graph-2d** for graph visualization
- **Supabase** for backend and real-time sync
- **TailwindCSS** for styling
- **Lucide React** for icons

## Routes

- `/` - Graph visualization
- `/stats` - Network statistics
- `/admin` - Admin panel for managing people and relationships

