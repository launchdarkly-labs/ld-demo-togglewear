from flask import Blueprint, jsonify, request

flags_bp = Blueprint('flags', __name__)


@flags_bp.route('/api/flags', methods=['GET'])
def get_flags():
    """
    Return current flag states for a given user context.
    Called by the frontend after identify.
    """
    user_key = request.args.get('userKey', 'anonymous')

    # TODO: Phase 3 — evaluate flags via LD Python server SDK
    return jsonify({
        'userKey': user_key,
        'flags': {
            'modern-theme-enabled': False,
            'modern-hero-banner': False,
            'modern-navigation': False,
            'modern-product-cards': False,
            'modern-typography-palette': False,
        },
    })
