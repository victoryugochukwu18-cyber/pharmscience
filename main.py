from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime

app = FastAPI(title="PharmaChem QMS")

BASE_DIR = Path(__file__).resolve().parent

app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static"
)

templates = Jinja2Templates(
    directory=str(BASE_DIR / "templates")
)

# Temporary storage for demonstration.
# Replace with a database before production use.
records = {
    "SOP Management": [],
    "Document Control": [],
    "Training Records": [],
    "Deviation Management": [],
    "CAPA Management": [],
    "Audit Management": [],
    "Equipment Management": [],
    "Batch Documentation": [],
    "Supplier Management": [],
    "Expiry Alerts": []
}


class Record(BaseModel):
    title: str
    description: str = ""
    status: str = "Open"


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    total = sum(len(items) for items in records.values())

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "total": total,
            "records": records,
            "modules": list(records.keys())
        }
    )


@app.get("/api/modules")
async def get_modules():
    return {
        "modules": list(records.keys())
    }


@app.get("/api/records")
async def get_records():
    return records


@app.post("/api/records/{module}")
async def create_record(module: str, record: Record):
    if module not in records:
        return {"error": "Module not found"}

    new_record = {
        "id": len(records[module]) + 1,
        "title": record.title,
        "description": record.description,
        "status": record.status,
        "created_at": datetime.now().isoformat()
    }

    records[module].append(new_record)

    return {
        "message": "Record created successfully",
        "record": new_record
    }


@app.get("/health")
async def health():
    return {"status": "PharmaChem QMS is running"}