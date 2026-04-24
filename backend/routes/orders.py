from flask import Blueprint, jsonify, request

orders_bp = Blueprint('orders', __name__)


@orders_bp.route('/api/<skin>/orders', methods=['POST'])
def place_order(skin):
    """Place a new order / booking / application."""
    body = request.get_json()
    # TODO: Phase 2 — save order to DynamoDB, generate order ID
    return jsonify({
        'skin': skin,
        'message': 'Order placed',
        'orderId': 'placeholder-order-id',
        'order': body,
    })
