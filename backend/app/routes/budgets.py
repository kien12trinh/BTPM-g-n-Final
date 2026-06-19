from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity # BỔ SUNG IMPORT
from ..extensions import db
from ..models.budget import CategoryBudget
from ..models.category import Category

bp = Blueprint("budgets", __name__, url_prefix="/api/budgets")

def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status

@bp.get("")
@jwt_required() # BẮT BUỘC ĐĂNG NHẬP
def get_budgets():
    user_id = get_jwt_identity()
    month_year = request.args.get("month_year")
    
    if not month_year:
        return _err("Vui lòng cung cấp month_year (VD: 2023-10)")

    # Chỉ lấy hạn mức của user_id này
    budgets = CategoryBudget.query.filter_by(month_year=month_year, user_id=user_id).all()
    return _ok([b.to_dict() for b in budgets])

@bp.post("")
@jwt_required() # BẮT BUỘC ĐĂNG NHẬP
def set_budget():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    category_id = body.get("category_id")
    month_year = body.get("month_year")
    max_amount = body.get("max_amount")

    if not all([category_id, month_year, max_amount is not None]):
        return _err("Thiếu thông tin bắt buộc (category_id, month_year, max_amount)")

    if int(max_amount) < 0:
        return _err("Hạn mức không được là số âm")

    # Kiểm tra xem danh mục có tồn tại VÀ có phải của user này không
    cat = Category.query.filter_by(id=category_id, user_id=user_id).first()
    if not cat:
        return _err("Danh mục không tồn tại hoặc không thuộc về bạn", 404)

    # Tìm xem tháng này đã set budget cho danh mục này chưa (của user_id này)
    budget = CategoryBudget.query.filter_by(category_id=category_id, month_year=month_year, user_id=user_id).first()
    
    if budget:
        # Nếu có rồi -> Cập nhật
        budget.max_amount = int(max_amount)
    else:
        # Nếu chưa có -> Tạo mới và gán user_id
        budget = CategoryBudget(category_id=category_id, month_year=month_year, max_amount=int(max_amount), user_id=user_id)
        db.session.add(budget)

    db.session.commit()
    return _ok(budget.to_dict(), 200)