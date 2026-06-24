from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.category_service import CategoryService

bp = Blueprint("categories", __name__, url_prefix="/api/categories")
_svc = CategoryService()

def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status

@bp.get("")
@jwt_required()
def list_categories():
    user_id = get_jwt_identity() # Lấy ID người dùng từ Token
    cat_type = request.args.get("type")
    
    cats = _svc.list_by_type(cat_type, user_id) if cat_type else _svc.list_all(user_id)
    return _ok([c.to_dict() for c in cats])

@bp.post("")
@jwt_required()
def create_category():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    try:
        cat = _svc.create(body.get("name", ""), body.get("icon"), body.get("type", ""), user_id)
        return _ok(cat.to_dict(), 201)
    except ValueError as e:
        return _err(str(e))

@bp.patch("/<int:cat_id>")
@jwt_required()
def update_category(cat_id):
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    try:
        cat = _svc.update(cat_id, user_id, **{k: v for k, v in body.items() if k in ("name", "icon")})
        return _ok(cat.to_dict())
    except ValueError as e:
        return _err(str(e), 404 if "Không tìm thấy" in str(e) else 400)

@bp.delete("/<int:cat_id>")
@jwt_required()
def delete_category(cat_id):
    user_id = get_jwt_identity()
    try:
        _svc.delete(cat_id, user_id)
        return _ok({"id": cat_id})
    except ValueError as e:
        return _err(str(e), 404 if "Không tìm thấy" in str(e) else 400)
