import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Union, Dict, Any
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """Hash password securely using bcrypt with auto-generated salt."""
    if not password:
        raise ValueError("Password cannot be empty")
    # Truncate to 72 bytes if necessary per bcrypt specification
    pw_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """Verify a plain password against stored bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        pw_bytes = plain_password.encode('utf-8')[:72]
        return bcrypt.checkpw(pw_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False


def create_access_token(
    subject: Union[str, int],
    role: str = "farmer",
    is_admin: bool = False,
    expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """Generate signed JWT access token with user claims and expiration."""
    now = datetime.datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "is_admin": is_admin,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp())
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Validate and decode JWT access token, returning payload claims."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise e


def send_password_reset_email(to_email: str, reset_token: str, recipient_name: str = "Farmer") -> Dict[str, Any]:
    """
    Attempt to send a real password reset email via configured SMTP.
    If SMTP is not configured in this environment, returns clear status
    without faking delivery.
    """
    if not settings.SMTP_HOST:
        return {
            "delivered": False,
            "reason": "SMTP_NOT_CONFIGURED",
            "message": "SMTP host is not configured in this environment. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD to enable live email delivery.",
            "reset_token": reset_token
        }

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "AgriMitra Password Reset Request / ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email

        html_body = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
            <h2 style="color: #166534;">AgriMitra | ಕೃಷಿಮಿತ್ರ</h2>
            <p>Namaskara {recipient_name},</p>
            <p>We received a request to reset your AgriMitra account password. Use the following verification token:</p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; font-size: 18px; font-weight: bold; letter-spacing: 2px; text-align: center; color: #166534; border-radius: 6px;">
                {reset_token}
            </div>
            <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">This token expires in 1 hour. If you did not request this, please ignore this email.</p>
        </div>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())

        return {
            "delivered": True,
            "reason": "SENT_VIA_SMTP",
            "message": f"Password reset instructions dispatched to {to_email}."
        }
    except Exception as exc:
        return {
            "delivered": False,
            "reason": "SMTP_DELIVERY_ERROR",
            "message": f"Failed to send email via SMTP: {str(exc)}",
            "reset_token": reset_token
        }
