from flask import Blueprint, jsonify, request

items_bp = Blueprint('items', __name__)


@items_bp.route('/api/<skin>/items', methods=['GET'])
def get_items(skin):
    """Get all items for a skin, optionally filtered by category."""
    category = request.args.get('category')
    group = request.args.get('group')

    # TODO: Phase 2 — query DynamoDB for items by skin + category
    return jsonify({
        'skin': skin,
        'category': category,
        'group': group,
        'items': [],
    })


@items_bp.route('/api/<skin>/items/<item_id>', methods=['GET'])
def get_item(skin, item_id):
    """Get a single item by ID."""
    # TODO: Phase 2 — query DynamoDB for single item
    return jsonify({
        'skin': skin,
        'itemId': item_id,
        'item': None,
    })
