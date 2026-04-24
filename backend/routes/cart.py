from flask import Blueprint, jsonify, request

cart_bp = Blueprint('cart', __name__)


@cart_bp.route('/api/<skin>/cart/<user_id>', methods=['GET'])
def get_cart(skin, user_id):
    """Fetch cart for a user."""
    # TODO: Phase 2 — query DynamoDB for user's cart
    return jsonify({
        'skin': skin,
        'userId': user_id,
        'items': [],
        'subtotal': 0,
    })


@cart_bp.route('/api/<skin>/cart/<user_id>', methods=['POST'])
def update_cart(skin, user_id):
    """Add or update an item in the user's cart."""
    body = request.get_json()
    # TODO: Phase 2 — write to DynamoDB
    return jsonify({
        'skin': skin,
        'userId': user_id,
        'message': 'Cart updated',
        'item': body,
    })


@cart_bp.route('/api/<skin>/cart/<user_id>/<item_id>', methods=['DELETE'])
def remove_from_cart(skin, user_id, item_id):
    """Remove an item from the user's cart."""
    # TODO: Phase 2 — delete from DynamoDB
    return jsonify({
        'skin': skin,
        'userId': user_id,
        'removedItemId': item_id,
        'message': 'Item removed from cart',
    })
