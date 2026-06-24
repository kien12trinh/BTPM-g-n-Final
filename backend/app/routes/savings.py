from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.savings_service import SavingsService

bp = Blueprint("savings", __name__, url_prefix="/api/savings")
_svc = SavingsService()

def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status

@bp.get("")
@jwt_required()
def list_goals():
    user_id = get_jwt_identity()
    goals = _svc.list_goals(user_id)
    return _ok([g.to_dict() for g in goals])

@bp.get("/<int:goal_id>")
@jwt_required()
def get_goal(goal_id):
    user_id = get_jwt_identity()
    try:
        goal = _svc.get_goal(goal_id, user_id)
        return _ok(goal.to_dict(include_deposits=True))
    except ValueError as e:
        return _err(str(e), 404)

@bp.post("")
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    try:
        goal = _svc.create_goal(
            user_id=user_id,
            name=body.get("name", ""),
            target_amount=int(body.get("target_amount", 0)),
            icon=body.get("icon", "savings"),
            deadline=body.get("deadline"),
        )
        return _ok(goal.to_dict(), 201)
    except (ValueError, TypeError) as e:
        return _err(str(e))

@bp.patch("/<int:goal_id>")
@jwt_required()
def update_goal(goal_id):
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    allowed = {"name", "target_amount", "icon", "deadline"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if "target_amount" in updates:
        updates["target_amount"] = int(updates["target_amount"])
    try:
        goal = _svc.update_goal(goal_id, user_id, **updates)
        return _ok(goal.to_dict())
    except ValueError as e:
        return _err(str(e), 404 if "Không tìm thấy" in str(e) else 400)

@bp.delete("/<int:goal_id>")
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    try:
        _svc.delete_goal(goal_id, user_id)
        return _ok({"id": goal_id})
    except ValueError as e:
        return _err(str(e), 404)

@bp.get("/<int:goal_id>/deposits")
@jwt_required()
def list_deposits(goal_id):
    user_id = get_jwt_identity()
    try:
        deposits = _svc.list_deposits(goal_id, user_id)
        return _ok([d.to_dict() for d in deposits])
    except ValueError as e:
        return _err(str(e), 404)

@bp.post("/<int:goal_id>/deposits")
@jwt_required()
def add_deposit(goal_id):
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    try:
        deposit = _svc.add_deposit(
            goal_id=goal_id,
            user_id=user_id,
            amount=int(body.get("amount", 0)),
            deposit_date=body.get("date"),
            note=body.get("note"),
        )
        goal = _svc.get_goal(goal_id, user_id)
        return _ok({
            "deposit": deposit.to_dict(),
            "goal":    goal.to_dict(),
        }, 201)
    except (ValueError, TypeError) as e:
        return _err(str(e), 404 if "Không tìm thấy" in str(e) else 400)

@bp.delete("/<int:goal_id>/deposits/<int:deposit_id>")
@jwt_required()
def delete_deposit(goal_id, deposit_id):
    user_id = get_jwt_identity()
    try:
        _svc.delete_deposit(goal_id, deposit_id, user_id)
        goal = _svc.get_goal(goal_id, user_id)
        return _ok({"deposit_id": deposit_id, "goal": goal.to_dict()})
    except ValueError as e:
        return _err(str(e), 404)