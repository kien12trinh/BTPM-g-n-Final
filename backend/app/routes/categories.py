from flask import Blueprint, request, jsonify
from ..services.category_service import CategoryService

bp = Blueprint("categories", __name__, url_prefix="/api/categories")
_svc = CategoryService()


def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status


@bp.get("")
def list_categories():
    cat_type = request.args.get("type")   # ?type=income | ?type=expense
    cats = _svc.list_by_type(cat_type) if cat_type else _svc.list_all()
    return _ok([c.to_dict() for c in cats])


@bp.post("")
def create_category():
    body = request.get_json(silent=True) or {}
    try:
        cat = _svc.create(body.get("name", ""), body.get("icon"), body.get("type", ""))
        return _ok(cat.to_dict(), 201)
    except ValueError as e:
        return _err(str(e))


@bp.patch("/<int:cat_id>")
def update_category(cat_id):
    body = request.get_json(silent=True) or {}
    try:
        cat = _svc.update(cat_id, **{k: v for k, v in body.items() if k in ("name", "icon")})
        return _ok(cat.to_dict())
    except ValueError as e:
        return _err(str(e), 404 if "Không tìm thấy" in str(e) else 400)


@bp.delete("/<int:cat_id>")
def delete_category(cat_id):
    try:
        _svc.delete(cat_id)
        return _ok({"id": cat_id})
    except ValueError as e:
        return _err(str(e), 404 if "Không tìm thấy" in str(e) else 400)
