import smtplib, os
from email.mime.text import MIMEText
from datetime import datetime
from livekit.agents import function_tool

lead_data = {}

@function_tool
async def capture_lead(
    name: str = "", title: str = "", company: str = "",
    phone: str = "", email: str = "",
    interest_level: str = "", use_case: str = "",
    deal_size: str = "",
    follow_up_needed: bool = False, follow_up_date: str = "",
    route_to_agent: str = "",
    call_direction: str = "outbound",
    handled_by: str = "",
    notes: str = "",
):
    try:
        lead_data.update({
            "name": name, "title": title, "company": company,
            "phone": phone, "email": email,
            "interest_level": interest_level, "use_case": use_case,
            "deal_size": deal_size,
            "follow_up_needed": follow_up_needed,
            "follow_up_date": follow_up_date,
            "route_to_agent": route_to_agent,
            "call_direction": call_direction,
            "handled_by": handled_by,
            "notes": notes,
            "captured_at": datetime.now().isoformat(),
        })
        await send_lead_email()
        return "Lead captured."
    except Exception as e:
        return str(e)

async def send_lead_email():
    try:
        sender = os.getenv("EMAIL_USER")
        password = os.getenv("EMAIL_PASS")
        receiver = os.getenv("LEAD_RECEIVER")
        if not (sender and password and receiver):
            return "Email creds missing — skipped."
        direction = lead_data.get("call_direction", "outbound").upper()
        agent = lead_data.get("handled_by", "Agent")
        company = lead_data.get("company", "Unknown")
        subject = f"[{direction}] New Lead — {company} via {agent}"
        body = "\n".join(f"{k}: {v}" for k, v in lead_data.items())
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = receiver
        s = smtplib.SMTP("smtp.gmail.com", 587)
        s.starttls()
        s.login(sender, password)
        s.sendmail(sender, receiver, msg.as_string())
        s.quit()
        return "Email sent."
    except Exception as e:
        return str(e)

@function_tool
async def route_to_agent(target_agent: str = "", reason: str = ""):
    lead_data["routed_to"] = target_agent
    lead_data["routing_reason"] = reason
    return f"Noted — routing to {target_agent}"
