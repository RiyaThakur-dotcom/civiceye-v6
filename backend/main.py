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
    id=Column(String,primary_key=True,default=lambda:"CEP"+uuid.uuid4().hex[:6].upper())
    name=Column(String);mobile=Column(String);address=Column(String);issue=Column(Text)
    dept=Column(String,default="Admin");level=Column(String,default="Low")
    score=Column(Float,default=50.0);status=Column(String,default="Pending")
    corrupt=Column(Boolean,default=False);alert=Column(Boolean,default=False)
    escalate=Column(Boolean,default=False);ai_data=Column(Text,default="{}")
    created_at=Column(DateTime,default=datetime.utcnow)

class Block(Base):
    __tablename__="blockchain"
    index=Column(Integer,primary_key=True,autoincrement=True)
    complaint_id=Column(String);action=Column(String);data=Column(Text)
    prev_hash=Column(String);block_hash=Column(String)
    created_at=Column(DateTime,default=datetime.utcnow)

class AgentLog(Base):
    __tablename__="agent_logs"
    id=Column(Integer,primary_key=True,autoincrement=True)
    from_agent=Column(String);to_agent=Column(String);message=Column(Text)
    severity=Column(String,default="INFO");created_at=Column(DateTime,default=datetime.utcnow)

class User(Base):
    __tablename__="users"
    id=Column(String,primary_key=True,default=lambda:"USR"+uuid.uuid4().hex[:8].upper())
    name=Column(String);mobile=Column(String,unique=True);password=Column(String)
    role=Column(String,default="citizen");ward=Column(String,default="Ward 1")
    dept=Column(String,default="");created_at=Column(DateTime,default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class ComplaintCreate(BaseModel):
    name:str;mobile:str;address:str;issue:str;ai_data:Optional[str]="{}"
class ComplaintUpdate(BaseModel):
    status:Optional[str]=None;dept:Optional[str]=None
class UserCreate(BaseModel):
    name:str;mobile:str;password:str
    ward:Optional[str]="Ward 1";role:Optional[str]="citizen"
class UserLogin(BaseModel):
    mobile:str;password:str

def make_hash(i,d,p):
    return hashlib.sha256(f"{i}{json.dumps(d,default=str)}{p}{time.time()}".encode()).hexdigest()[:32]

def add_block(db,cid,action,data):
    last=db.query(Block).order_by(Block.index.desc()).first()
    ph=last.block_hash if last else "0000000000000000"
    idx=(last.index+1) if last else 1
    b=Block(complaint_id=cid,action=action,data=json.dumps(data,default=str),prev_hash=ph,block_hash=make_hash(idx,data,ph))
    db.add(b);db.commit();return b

def add_log(db,fa,ta,msg,sev="INFO"):
    db.add(AgentLog(from_agent=fa,to_agent=ta,message=msg,severity=sev));db.commit()

def classify(text):
    t=text.lower()
    def has(*w):return any(x in t for x in w)
    corrupt=has("bribe","corrupt","rishwat","ghoos","paisa")
    safety=has("danger","emergency","accident","fire","bachao","urgent")
    health=has("hospital","health","disease","medical","dengue")
    water=has("water","paani","tap","pipeline","nalka")
    power=has("bijli","electricity","light","current","power")
    road=has("road","pothole","sadak","gaddha","crack")
    garbage=has("garbage","kachra","safai","trash","waste")
    drain=has("drain","naali","sewer","blockage","flood")
    score=91 if corrupt else 94 if safety else 87 if health else 80 if water else 74 if power else 67 if road else 62 if garbage else 71 if drain else 50
    level="Critical" if score>=85 else "High" if score>=70 else "Medium" if score>=55 else "Low"
    cat="Corruption" if corrupt else "Safety" if safety else "Health" if health else "Water" if water else "Power" if power else "Road" if road else "Garbage" if garbage else "Drainage" if drain else "Admin"
    dept="Vigilance" if corrupt else "Police" if safety else "Health Dept" if health else "Water Board" if water else "Electricity Board" if power else "Public Works" if road else "Sanitation" if garbage else "Drainage Dept" if drain else "Admin Office"
    sla=24 if level=="Critical" else 72 if level=="High" else 168 if level=="Medium" else 336
    conf=abs(73+hash(text)%22)
    return {"cat":cat,"level":level,"score":score,"dept":dept,"sla":sla,"conf":conf,
            "corrupt_flag":corrupt,"escalate":corrupt or score>80,"alert":score>75 or corrupt,
            "summary":f"{level} {cat}. {dept}. SLA:{sla}h. Conf:{conf}%",
            "wa":f"CivicEye\nIssue:{cat}\nLevel:{level}\nSLA:{sla}h"}

app=FastAPI(title="CivicEye v6 API",version="6.0.0")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

def get_db():
    db=SessionLocal()
    try:yield db
    finally:db.close()

@app.on_event("startup")
def seed():
    db=SessionLocal()
    try:
        if not db.query(User).filter_by(mobile="9999999999").first():
            db.add(User(id="OFF001",name="Insp. Sharma",mobile="9999999999",password="officer@123",role="officer",ward="Ward 1",dept="Public Works"))
            db.add(User(id="ADM001",name="Commissioner Das",mobile="8888888888",password="admin@123",role="admin",ward="All",dept="City Admin"))
            add_block(db,"GENESIS","GENESIS",{"msg":"CivicEye initialized"})
            db.commit()
    finally:db.close()

@app.get("/")
def root():return{"status":"CivicEye v6 API LIVE","version":"6.0.0"}

@app.get("/api/health")
def health(db:Session=Depends(get_db)):
    return{"status":"ok","complaints":db.query(Complaint).count(),"blocks":db.query(Block).count()}

@app.post("/api/auth/register")
def register(body:UserCreate,db:Session=Depends(get_db)):
    if db.query(User).filter_by(mobile=body.mobile).first():raise HTTPException(400,"Already registered")
    u=User(name=body.name,mobile=body.mobile,password=body.password,ward=body.ward,role=body.role)
    db.add(u);db.commit();db.refresh(u)
    return{"ok":True,"user":{"id":u.id,"name":u.name,"mobile":u.mobile,"role":u.role,"ward":u.ward}}

@app.post("/api/auth/login")
def login(body:UserLogin,db:Session=Depends(get_db)):
    u=db.query(User).filter_by(mobile=body.mobile).first()
    if not u:raise HTTPException(404,"Not registered")
    if u.password!=body.password:raise HTTPException(401,"Wrong password")
    return{"ok":True,"user":{"id":u.id,"name":u.name,"mobile":u.mobile,"role":u.role,"ward":u.ward,"dept":u.dept}}

@app.get("/api/complaints")
def get_complaints(db:Session=Depends(get_db)):
    return[{"id":c.id,"name":c.name,"mobile":c.mobile,"address":c.address,"issue":c.issue,
            "dept":c.dept,"level":c.level,"score":c.score,"status":c.status,
            "corrupt":c.corrupt,"ai":json.loads(c.ai_data or "{}"),
            "created_at":c.created_at.isoformat() if c.created_at else None}
           for c in db.query(Complaint).order_by(Complaint.created_at.desc()).all()]

@app.post("/api/complaints")
def create_complaint(body:ComplaintCreate,db:Session=Depends(get_db)):
    ai=classify(body.issue)
    c=Complaint(name=body.name,mobile=body.mobile,address=body.address,issue=body.issue,
                dept=ai["dept"],level=ai["level"],score=ai["score"],
                status="Escalated" if ai["escalate"] else "Assigned",
                corrupt=ai["corrupt_flag"],alert=ai["alert"],escalate=ai["escalate"],ai_data=json.dumps(ai))
    db.add(c);db.commit();db.refresh(c)
    add_block(db,c.id,"FILED",{"id":c.id,"issue":body.issue[:60],"dept":ai["dept"],"level":ai["level"]})
    add_log(db,"AI",ai["dept"],f"{c.id}|{ai['score']}|{ai['level']}","WARN" if ai["corrupt_flag"] else "INFO")
    return{"complaint_id":c.id,"status":c.status,"ai":ai}

@app.patch("/api/complaints/{cid}")
def update_complaint(cid:str,body:ComplaintUpdate,db:Session=Depends(get_db)):
    c=db.query(Complaint).filter_by(id=cid).first()
    if not c:raise HTTPException(404,"Not found")
    old=c.status
    if body.status:c.status=body.status
    if body.dept:c.dept=body.dept
    db.commit()
    add_block(db,c.id,body.status or "UPDATED",{"id":c.id,"old":old,"new":body.status})
    return{"ok":True,"id":c.id,"status":c.status}

@app.get("/api/blockchain")
def get_chain(db:Session=Depends(get_db)):
    return[{"index":b.index,"complaint_id":b.complaint_id,"action":b.action,
            "prev_hash":b.prev_hash,"hash":b.block_hash,
            "created_at":b.created_at.isoformat() if b.created_at else None}
           for b in db.query(Block).order_by(Block.index).all()]

@app.get("/api/agents/logs")
def get_logs(limit:int=50,db:Session=Depends(get_db)):
    return[{"from_agent":l.from_agent,"to_agent":l.to_agent,"message":l.message,
            "severity":l.severity,"created_at":l.created_at.isoformat() if l.created_at else None}
           for l in db.query(AgentLog).order_by(AgentLog.created_at.desc()).limit(limit).all()]

@app.get("/api/analytics")
def analytics(db:Session=Depends(get_db)):
    cpts=db.query(Complaint).all()
    by_dept,by_level={},{}
    for c in cpts:
        by_dept[c.dept]=by_dept.get(c.dept,0)+1
        by_level[c.level]=by_level.get(c.level,0)+1
    return{"total":len(cpts),"by_dept":by_dept,"by_level":by_level,
           "corruption_flags":sum(1 for c in cpts if c.corrupt),
           "blockchain_blocks":db.query(Block).count()}
