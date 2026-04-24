import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from config import Config
from routes import items_bp, cart_bp, orders_bp, flags_bp, health_bp


def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(items_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(flags_bp)
    app.register_blueprint(health_bp)

    frontend_dir = os.path.abspath(Config.FRONTEND_DIR)
    skins_dir = os.path.abspath(Config.SKINS_DIR)

    @app.route('/skins/<path:filename>')
    def serve_skins(filename):
        return send_from_directory(skins_dir, filename)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        full_path = os.path.join(frontend_dir, path)
        if path and os.path.isfile(full_path):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    port = Config.FLASK_PORT
    debug = Config.FLASK_ENV == 'development'
    print(f'ToggleApp backend running on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=debug)
