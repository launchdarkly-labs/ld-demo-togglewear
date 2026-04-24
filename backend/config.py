import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class Config:
    LD_SDK_KEY = os.getenv('LD_SDK_KEY', '')
    LD_CLIENT_SIDE_ID = os.getenv('LD_CLIENT_SIDE_ID', '')
    LD_PROJECT_KEY = os.getenv('LD_PROJECT_KEY', 'kevinc-new-demo-app')

    AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

    FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    DEFAULT_SKIN = os.getenv('DEFAULT_SKIN', 'retail')

    FRONTEND_DIR = os.path.join(
        os.path.dirname(__file__), '..', 'frontend'
    )
    SKINS_DIR = os.path.join(
        os.path.dirname(__file__), '..', 'skins'
    )
