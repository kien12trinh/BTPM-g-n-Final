from datetime import date
from calendar import monthrange
from flask import Blueprint, jsonify
from ..repositories.transaction_repository import TransactionRepository

bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")
_tx_repo = TransactionRepository()


def _ok(data):
    return jsonify({"success": True, "data": data})


@bp.get("/summary")
def summary():
    today = date.today()
    year, month = today.year, today.month
    income  = _tx_repo.sum_by_type_and_month(year, month, "income")
    expense = _tx_repo.sum_by_type_and_month(year, month, "expense")

    # Previous month for % change
    prev_month = month - 1 if month > 1 else 12
    prev_year  = year if month > 1 else year - 1
    prev_income  = _tx_repo.sum_by_type_and_month(prev_year, prev_month, "income")
    prev_expense = _tx_repo.sum_by_type_and_month(prev_year, prev_month, "expense")

    def pct_change(curr, prev):
        if prev == 0:
            return 0
        return round((curr - prev) / prev * 100, 1)

    return _ok({
        "income":          income,
        "expense":         expense,
        "balance":         income - expense,
        "income_change":   pct_change(income, prev_income),
        "expense_change":  pct_change(expense, prev_expense),
        "updated_at":      today.isoformat(),
    })


@bp.get("/recent")
def recent():
    from flask import request
    limit = request.args.get("limit", 5, type=int)
    txs = _tx_repo.get_filtered(limit=limit)
    return _ok([tx.to_dict() for tx in txs])


@bp.get("/trend")
def trend():
    """Last 6 months spending trend."""
    today = date.today()
    months = []
    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        months.append((y, m))

    rows = _tx_repo.monthly_totals(months)
    MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"]
    result = []
    for r in rows:
        balance = r["income"] - r["expense"]
        result.append({
            "label":   MONTH_LABELS[r["month"] - 1],
            "income":  r["income"],
            "expense": r["expense"],
            "balance": balance,
        })
    return _ok(result)
