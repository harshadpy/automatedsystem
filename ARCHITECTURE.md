# System Architecture

## Tech Stack
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: React 19 (Vite) + Tailwind CSS v4
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **ORM**: SQLModel

## Folder Structure
```
/root
  /backend
    main.py          # Entry point
    models.py        # Database models
    database.py      # DB connection
    requirements.txt # Dependencies
  /frontend
    src/             # React source
    vite.config.js   # Vite config
  /docs              # Documentation
```

## Workflows
- **Lead Capture**: Web Form / CSV Import -> Backend API -> Database -> Automations (Email/WhatsApp)
- **Enrollment**: Payment Webhook -> Update Lead Status -> Create Student User -> Send Access Details
