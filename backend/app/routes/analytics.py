from datetime import date
from flask import Blueprint, request, jsonify
from ..repositories.transaction_repository import TransactionRepository

bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")
_tx_repo = TransactionRepository()

COLORS_EXPENSE = ["#d97706","#9b3e3b","#2563eb","#7c3aed","#0891b2","#6d7a72","#dc2626","#059669"]
COLORS_INCOME  = ["#006948","#16a34a","#0891b2","#d97706","#7c3aed","#3b82f6"]


def _ok(data):
    return jsonify({"success": True, "data": data})


@bp.get("/report")
def report():
    date_from = request.args.get("date_from")
    date_to   = request.args.get("date_to")
    tx_type   = request.args.get("type")

    transactions = _tx_repo.get_filtered(date_from, date_to, tx_type or None)

    total_income  = sum(tx.amount for tx in transactions if tx.type == "income")
    total_expense = sum(tx.amount for tx in transactions if tx.type == "expense")

    # Category breakdown
    expense_cats = _tx_repo.sum_by_category("expense", date_from, date_to)
    income_cats  = _tx_repo.sum_by_category("income",  date_from, date_to)

    for i, c in enumerate(expense_cats):
        c["color"] = COLORS_EXPENSE[i % len(COLORS_EXPENSE)]
    for i, c in enumerate(income_cats):
        c["color"] = COLORS_INCOME[i % len(COLORS_INCOME)]

    return _ok({
        "transactions":       [tx.to_dict() for tx in transactions],
        "total_income":       total_income,
        "total_expense":      total_expense,
        "balance":            total_income - total_expense,
        "expense_by_category": expense_cats,
        "income_by_category":  income_cats,
    })
