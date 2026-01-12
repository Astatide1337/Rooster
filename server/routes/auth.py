import os
import requests
from urllib.parse import urlencode
from flask import Blueprint, request, redirect, session, current_app, jsonify
from models import User

auth_bp = Blueprint('auth', __name__)

GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'


import secrets

@auth_bp.route('/auth')
def auth_callback():
    """Generic Auth Route: Handles both initiation (no code) and callback (has code)."""
    code = request.args.get('code')
    received_state = request.args.get('state')
    
    frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    redirect_uri = os.getenv('OAUTH_REDIRECT_URI', 'http://localhost:5000/auth')
    client_id = os.getenv('OAUTH_CLIENT_ID')
    client_secret = os.getenv('OAUTH_CLIENT_SECRET')

    # 1. Initiation: Redirect to Google
    if not code:
        # Generate and store random state for CSRF protection
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state
        
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state
        }
        return redirect(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")

    # 2. Callback: Verify State and Exchange Code
    # Verify state to prevent Login CSRF
    stored_state = session.pop('oauth_state', None)
    if not stored_state or not received_state or stored_state != received_state:
        # In a real app, maybe redirect to error page. For now, JSON error.
        return jsonify({'error': 'OAuth state mismatch! Possible CSRF attempt.'}), 400

    if not client_id or not client_secret:
        return jsonify({'error': 'OAuth client not configured'}), 500

    data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
        # 'state': received_state # Not strictly needed for token exchange usually, but good practice if provider asks
    }

    resp = requests.post(GOOGLE_TOKEN_URL, data=data)
    if resp.status_code != 200:
        return jsonify({'error': 'token exchange failed', 'details': resp.text}), 502

    token_data = resp.json()
    access_token = token_data.get('access_token')

    # Fetch user profile from Google
    userinfo_resp = requests.get(
        GOOGLE_USERINFO_URL,
        headers={'Authorization': f'Bearer {access_token}'}
    )
    if userinfo_resp.status_code != 200:
        return jsonify({'error': 'failed to fetch user info'}), 502

    userinfo = userinfo_resp.json()

    # Find or Create User in MongoDB
    google_id = userinfo.get('id')
    email = userinfo.get('email')
    name = userinfo.get('name')
    picture = userinfo.get('picture')

    user = User.objects(google_id=google_id).first()
    
    if not user:
        # Create new user
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture
        )
        user.save()
    else:
        # Update existing user info if changed
        if user.name != name or user.picture != picture:
            user.name = name
            user.picture = picture
            user.save()

    # Store user ID in session
    session['user_id'] = str(user.id)

    # Redirect to the frontend root after sign-in. The SPA will detect
    # the signed-in session on load by calling `/api/user`.
    redirect_target = f"{frontend}/"
    current_app.logger.info("Auth successful, redirecting to %s", redirect_target)
    return redirect(redirect_target)
