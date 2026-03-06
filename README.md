# StudentOS

> track your progress. build your future.

a productivity app built for students — plan your day, log what you learn, get ai feedback, and visualize your consistency over time.

---

## features

- **day planner** — set and track daily micro goals
- **daily log** — write what you learned, rate your mood
- **ai coach** — get personalized feedback on your progress
- **progress graph** — github style contribution graph
- **profile** — public profile with your stats

---

## stack

```
frontend   → react + tailwind css
database   → postgresql + auth, Supabase
ai         → groq (llama 3.1)
hosting    → vercel
```

---

## run locally

```bash
git clone git@github.com:abhkpr/studentos.git
cd studentos
npm install
```

create `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_key
```

```bash
npm run dev
```

---

## database setup

run this in Supabase SQL editor:

```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  college text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

create table daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  summary text,
  mood int check (mood between 1 and 5),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
alter table daily_logs enable row level security;
alter table goals enable row level security;
```

---

