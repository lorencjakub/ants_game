from distinct_types import CORSSettings, SecuritySettings
import os

BE_ENV = os.environ.get("BE_ENV")


def set_cors() -> CORSSettings:
    cors_settings = {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS", "HEAD"],
        "allow_headers": ["CorsTrigger", "Content-Type"]
    }

    return cors_settings


def set_security_headers() -> SecuritySettings:
    security_headers = {
        "permissions_policy": {
            "camera": "'none'",
            "display-capture": "'none'",
            "fullscreen": "'none'",
            "geolocation": "'none'",
            "microphone": "'none'",
        },
        "x_content_type_options": "nosniff",
        "x_xss_protection": "1; mode-block",
        "frame_options": "SAMEORIGIN",
        "referrer_policy": "strict-origin-when-cross-origin",
        "strict_transport_security": "; ".join([
            "max_age=31556926",
            "includeSubDomains"
        ]),
        "content_security_policy": {
            "default-src": "'self'",
            "connect-src": "'self'",
            "img-src": " ".join([
                "'self'",
                "data:",
                "https:"
            ]),
            "style-src": " ".join([
                "'self'",
                "'unsafe-inline'",
                "'nonce-" + os.environ.get("NONCE", default="rAnd0mNonce") + "'"
            ]),
            "script-src": " ".join([
                "'self'",
                "blob:",
                "cdnjs.cloudflare.com"
            ]),
            "child-src": "'self'",
            "frame-src": "'self'",
            "frame-ancestors": "'self'",
            "font-src": "'self'"
        },
        "session_cookie_secure": True,
        "session_cookie_http_only": True,
        "session_cookie_samesite": "Lax",
        "cache_control": " ".join([
            "max-age=0",
            "must-revalidate",
            "no-cache",
            "no-store"
            "private"
        ])
    }

    return security_headers
