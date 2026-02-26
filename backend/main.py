from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import os, uuid, json, hashlib, time

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civiceye.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class Complaint(Base):
    __tablename__ = "complaints"
    id         = Column(String, primary_key=True, default=lambda: "CEP" + uuid.uuid4().hex[:6].upper())
    name       = Column(String)
    mobile     = Column(String)
    address    = Column(String)
    issue      = Column(Text)
    dept       = Column(String, default="Admin Office")
    level      = Column(String, default="Low")
    score      = Column(Float, default=50.0)
    status     = Column(String, default="Pending")
    corrupt    = Column(Boolean, default=False)
    alert      = Column(Boolean, default=False)
    escalate   = Column(Boolean, default=False)
    ai_data    = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Block(Base):
    __tablename__ = "blockchain"
    index        = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String)
    action       = Column(String)
    data         = Column(Text)
    prev_hash    = Column(String)
    block_hash   = Column(String)
    created_at   = Column(DateTime, default=datetime.utcnow)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    from_agent = Column(String)
    to_agent   = Column(String)
    message    = Column(Text)
    severity   = Column(String, default="INFO")
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id         = Column(String, primary_key=True, default=lambda: "USR" + uuid.uuid4().hex[:8].upper())
    name       = Column(String)
    mobile     = Column(String, unique=True)
    password   = Column(String)
    role       = Column(String, default="citizen")
    ward       = Column(String, default="Ward 1")
    dept       = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class ComplaintCreate(BaseModel):
    name: str
    mobile: str
    address: str
    issue: str
    ai_data: Optional[str] = "{}"

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    dept: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    mobile: str
    password: str
    ward: Optional[str] = "Ward 1"
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    mobile: str
    password: str

def make_hash(index, data, prev_hash):
    raw = f"{index}{json.dumps(data, sort_keys=True, default=str)}{prev_hash}{time.time()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]

def add_block(db, complaint_id, action, data):
    last = db.query(Block).order_by(Block.index.desc()).first()
    prev_hash = last.block_hash if last else "0000000000000000"
    idx = (last.index + 1) if last else 1
    h = make_hash(idx, data, prev_hash)
    block = Block(complaint_id=complaint_id, action=action, data=json.dumps(data, default=str), prev_hash=prev_hash, block_hash=h)
    db.add(block); db.commit()
    return block

def add_log(db, from_a, to_a, msg, sev="INFO"):
    db.add(AgentLog(from_agent=from_a, to_agent=to_a, message=msg, severity=sev))
    db.commit()

def ai_classify(text):
    t = text.lower()
    def has(*words): return any(w in t for w in words)
    corrupt = has("bribe","corrupt","rishwat","ghoos","paisa")
    water   = has("water","paani","tap","pipeline","nalka")
    power   = has("bijli","electricity","light","current","power")
    road    = has("road","pothole","sadak","gaddha","crack")
    garbage = has("garbage","kachra","safai","trash","waste")
    drain   = has("drain","naali","sewer","blockage","flood")
    health  = has("hospital","health","disease","medical","dengue")
    safety  = has("danger","emergency","accident","fire","bachao","urgent")
    score   = 91 if corrupt else 94 if safety else 87 if health else 80 if water else 74 if power else 67 if road else 62 if garbage else 71 if drain else 50
    level   = "Critical" if score>=85 else "High" if score>=70 else "Medium" if score>=55 else "Low"
    cat     = ("Corruption" if corrupt else "Safety" if safety else "Health" if health else
               "Water Supply" if water else "Electricity" if power else "Road" if road else
               "Garbage" if garbage else "Drainage" if drain else "Admin")
    dept    = ("Vigilance Dept" if corrupt else "Police" if safety else "Health Dept" if health else
               "Water Board" if water else "Electricity Board" if power else "Public Works" if road else
               "Sani


@'
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import os, uuid, json, hashlib, time

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civiceye.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class Complaint(Base):
    __tablename__ = "complaints"
    id         = Column(String, primary_key=True, default=lambda: "CEP" + uuid.uuid4().hex[:6].upper())
    name       = Column(String)
    mobile     = Column(String)
    address    = Column(String)
    issue      = Column(Text)
    dept       = Column(String, default="Admin Office")
    level      = Column(String, default="Low")
    score      = Column(Float, default=50.0)
    status     = Column(String, default="Pending")
    corrupt    = Column(Boolean, default=False)
    alert      = Column(Boolean, default=False)
    escalate   = Column(Boolean, default=False)
    ai_data    = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Block(Base):
    __tablename__ = "blockchain"
    index        = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String)
    action       = Column(String)
    data         = Column(Text)
    prev_hash    = Column(String)
    block_hash   = Column(String)
    created_at   = Column(DateTime, default=datetime.utcnow)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    from_agent = Column(String)
    to_agent   = Column(String)
    message    = Column(Text)
    severity   = Column(String, default="INFO")
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id         = Column(String, primary_key=True, default=lambda: "USR" + uuid.uuid4().hex[:8].upper())
    name       = Column(String)
    mobile     = Column(String, unique=True)
    password   = Column(String)
    role       = Column(String, default="citizen")
    ward       = Column(String, default="Ward 1")
    dept       = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class ComplaintCreate(BaseModel):
    name: str
    mobile: str
    address: str
    issue: str
    ai_data: Optional[str] = "{}"

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    dept: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    mobile: str
    password: str
    ward: Optional[str] = "Ward 1"
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    mobile: str
    password: str

def make_hash(index, data, prev_hash):
    raw = f"{index}{json.dumps(data, sort_keys=True, default=str)}{prev_hash}{time.time()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]

def add_block(db, complaint_id, action, data):
    last = db.query(Block).order_by(Block.index.desc()).first()
    prev_hash = last.block_hash if last else "0000000000000000"
    idx = (last.index + 1) if last else 1
    h = make_hash(idx, data, prev_hash)
    block = Block(complaint_id=complaint_id, action=action, data=json.dumps(data, default=str), prev_hash=prev_hash, block_hash=h)
    db.add(block); db.commit()
    return block

def add_log(db, from_a, to_a, msg, sev="INFO"):
    db.add(AgentLog(from_agent=from_a, to_agent=to_a, message=msg, severity=sev))
    db.commit()

def ai_classify(text):
    t = text.lower()
    def has(*words): return any(w in t for w in words)
    corrupt = has("bribe","corrupt","rishwat","ghoos","paisa")
    water   = has("water","paani","tap","pipeline","nalka")
    power   = has("bijli","electricity","light","current","power")
    road    = has("road","pothole","sadak","gaddha","crack")
    garbage = has("garbage","kachra","safai","trash","waste")
    drain   = has("drain","naali","sewer","blockage","flood")
    health  = has("hospital","health","disease","medical","dengue")
    safety  = has("danger","emergency","accident","fire","bachao","urgent")
    score   = 91 if corrupt else 94 if safety else 87 if health else 80 if water else 74 if power else 67 if road else 62 if garbage else 71 if drain else 50
    level   = "Critical" if score>=85 else "High" if score>=70 else "Medium" if score>=55 else "Low"
    cat     = ("Corruption" if corrupt else "Safety" if safety else "Health" if health else
               "Water Supply" if water else "Electricity" if power else "Road" if road else
               "Garbage" if garbage else "Drainage" if drain else "Admin")
    dept    = ("Vigilance Dept" if corrupt else "Police" if safety else "Health Dept" if health else
               "Water Board" if water else "Electricity Board" if power else "Public Works" if road else
               "Sanitation Dept" if garbage else "Drainage Dept" if drain else "Admin Office")
    sla     = 24 if level=="Critical" else 72 if level=="High" else 168 if level=="Medium" else 336
    conf    = abs(73 + hash(text) % 22)
    return {"cat":cat,"level":level,"score":score,"dept":dept,"sla":sla,"conf":conf,
            "corrupt_flag":corrupt,"escalate":corrupt or score>80,"alert":score>75 or corrupt,
            "summary":f"{level} priority {cat}. {dept} assigned. SLA: {sla}h. Confidence: {conf}%.",
            "wa":f"CivicEye Alert!\nIssue: {cat}\nPriority: {level}\nSLA: {sla}h"}

app = FastAPI(title="CivicEye Pro v6 API", version="6.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.on_event("startup")
def seed():
    db = SessionLocal()
    try:
        if not db.query(User).filter_by(mobile="9999999999").first():
            db.add(User(id="OFF001", name="Insp. Sharma", mobile="9999999999", password="officer@123", role="officer", ward="Ward 1", dept="Public Works"))
            db.add(User(id="ADM001", name="Commissioner Das", mobile="8888888888", password="admin@123", role="admin", ward="All", dept="City Admin"))
            add_block(db, "GENESIS", "GENESIS", {"msg": "CivicEye blockchain initialized"})
            db.commit()
    finally: db.close()

@app.get("/")
def root(): return {"status": "CivicEye Pro v6 API LIVE", "version": "6.0.0"}

@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    return {"status": "ok", "complaints": db.query(Complaint).count(), "blocks": db.query(Block).count()}

@app.post("/api/auth/register")
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter_by(mobile=body.mobile).first():
        raise HTTPException(400, "Mobile already registered")
    u = User(name=body.name, mobile=body.mobile, password=body.password, ward=body.ward, role=body.role)
    db.add(u); db.commit(); db.refresh(u)
    return {"ok": True, "user": {"id": u.id, "name": u.name, "mobile": u.mobile, "role": u.role, "ward": u.ward}}

@app.post("/api/auth/login")
def login(body: UserLogin, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(mobile=body.mobile).first()
    if not u: raise HTTPException(404, "Mobile not registered")
    if u.password != body.password: raise HTTPException(401, "Wrong password")
    return {"ok": True, "user": {"id": u.id, "name": u.name, "mobile": u.mobile, "role": u.role, "ward": u.ward, "dept": u.dept}}

@app.get("/api/complaints")
def get_complaints(db: Session = Depends(get_db)):
    cpts = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    return [{"id":c.id,"name":c.name,"mobile":c.mobile,"address":c.address,"issue":c.issue,
             "dept":c.dept,"level":c.level,"score":c.score,"status":c.status,
             "corrupt":c.corrupt,"alert":c.alert,"ai":json.loads(c.ai_data or "{}"),
             "created_at":c.created_at.isoformat() if c.created_at else None} for c in cpts]

@app.post("/api/complaints")
def create_complaint(body: ComplaintCreate, db: Session = Depends(get_db)):
    ai = ai_classify(body.issue)
    c = Complaint(name=body.name, mobile=body.mobile, address=body.address, issue=body.issue,
                  dept=ai["dept"], level=ai["level"], score=ai["score"],
                  status="Escalated" if ai["escalate"] else "Assigned",
                  corrupt=ai["corrupt_flag"], alert=ai["alert"], escalate=ai["escalate"], ai_data=json.dumps(ai))
    db.add(c); db.commit(); db.refresh(c)
    add_block(db, c.id, "FILED", {"id":c.id,"issue":body.issue[:60],"dept":ai["dept"],"level":ai["level"]})
    add_log(db, "AI Classifier", ai["dept"], f"{c.id} | Score:{ai['score']} | {ai['level']}", "WARN" if ai["corrupt_flag"] else "INFO")
    return {"complaint_id": c.id, "status": c.status, "ai": ai}

@app.patch("/api/complaints/{complaint_id}")
def update_complaint(complaint_id: str, body: ComplaintUpdate, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter_by(id=complaint_id).first()
    if not c: raise HTTPException(404, "Not found")
    old = c.status
    if body.status: c.status = body.status
    if body.dept: c.dept = body.dept
    db.commit()
    add_block(db, c.id, body.status or "UPDATED", {"id":c.id,"old":old,"new":body.status})
    return {"ok": True, "id": c.id, "status": c.status}

@app.get("/api/blockchain")
def get_chain(db: Session = Depends(get_db)):
    blocks = db.query(Block).order_by(Block.index).all()
    return [{"index":b.index,"complaint_id":b.complaint_id,"action":b.action,
             "prev_hash":b.prev_hash,"hash":b.block_hash,
             "created_at":b.created_at.isoformat() if b.created_at else None} for b in blocks]

@app.get("/api/agents/logs")
def get_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AgentLog).order_by(AgentLog.created_at.desc()).limit(limit).all()
    return [{"from_agent":l.from_agent,"to_agent":l.to_agent,"message":l.message,
             "severity":l.severity,"created_at":l.created_at.isoformat() if l.created_at else None} for l in logs]

@app.get("/api/analytics")
def analytics(db: Session = Depends(get_db)):
    cpts = db.query(Complaint).all()
    by_dept, by_level = {}, {}
    corrupt = sum(1 for c in cpts if c.corrupt)
    for c in cpts:
        by_dept[c.dept] = by_dept.get(c.dept, 0) + 1
        by_level[c.level] = by_level.get(c.level, 0) + 1
    return {"total":len(cpts),"by_dept":by_dept,"by_level":by_level,
            "corruption_flags":corrupt,"blockchain_blocks":db.query(Block).count()}
