from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.budget import CategoryBudget
from ..models.category import Category

bp = Blueprint("budgets", __name__, url_prefix="/api/budgets")

def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status

@bp.get("")
def get_budgets():
    # Mặc định lấy theo tháng hiện tại nếu không truyền params
    month_year = request.args.get("month_year")
    if not month_year:
        return _err("Vui lòng cung cấp month_year (VD: 2023-10)")

    budgets = CategoryBudget.query.filter_by(month_year=month_year).all()
    return _ok([b.to_dict() for b in budgets])

@bp.post("")
def set_budget():
    body = request.get_json(silent=True) or {}
    category_id = body.get("category_id")
    month_year = body.get("month_year")
    max_amount = body.get("max_amount")

    if not all([category_id, month_year, max_amount is not None]):
        return _err("Thiếu thông tin bắt buộc (category_id, month_year, max_amount)")

    if int(max_amount) < 0:
        return _err("Hạn mức không được là số âm")

    # Kiểm tra xem danh mục có tồn tại không
    cat = Category.query.get(category_id)
    if not cat:
        return _err("Danh mục không tồn tại", 404)

    # Tìm xem tháng này đã set budget cho danh mục này chưa
    budget = CategoryBudget.query.filter_by(category_id=category_id, month_year=month_year).first()
    
    if budget:
        # Nếu có rồi -> Cập nhật
        budget.max_amount = int(max_amount)
    else:
        # Nếu chưa có -> Tạo mới
        budget = CategoryBudget(category_id=category_id, month_year=month_year, max_amount=int(max_amount))
        db.session.add(budget)

    db.session.commit()
    return _ok(budget.to_dict(), 200)