from datetime import date
from ..extensions import db
from .base import BaseRepository
from ..models.transaction import Transaction


class TransactionRepository(BaseRepository):
    def __init__(self):
        super().__init__(Transaction)

    def get_filtered(self, date_from=None, date_to=None, tx_type=None, limit=None):
        q = Transaction.query
        if date_from:
            q = q.filter(Transaction.date >= date_from)
        if date_to:
            q = q.filter(Transaction.date <= date_to)
        if tx_type:
            q = q.filter(Transaction.type == tx_type)
        q = q.order_by(Transaction.date.desc(), Transaction.created_at.desc())
        if limit:
            q = q.limit(limit)
        return q.all()

    def sum_by_type_and_month(self, year, month, tx_type):
        result = db.session.query(
            db.func.coalesce(db.func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.type == tx_type,
            db.func.year(Transaction.date) == year,
            db.func.month(Transaction.date) == month,
        ).scalar()
        return int(result)

    def monthly_totals(self, months: list[tuple[int, int]]):
        """Returns [{year, month, income, expense}] for given (year,month) list."""
        rows = []
        for year, month in months:
            inc = self.sum_by_type_and_month(year, month, "income")
            exp = self.sum_by_type_and_month(year, month, "expense")
            rows.append({"year": year, "month": month, "income": inc, "expense": exp})
        return rows

    def sum_by_category(self, tx_type, date_from=None, date_to=None):
        from ..models.category import Category
        q = (
            db.session.query(
                Category.id,
                Category.name,
                Category.icon,
                db.func.coalesce(db.func.sum(Transaction.amount), 0).label("total"),
            )
            .join(Transaction, Transaction.category_id == Category.id, isouter=True)
            .filter(Category.type == tx_type)
        )
        if date_from:
            q = q.filter(
                db.or_(Transaction.date == None, Transaction.date >= date_from)
            )
        if date_to:
            q = q.filter(
                db.or_(Transaction.date == None, Transaction.date <= date_to)
            )
        q = q.group_by(Category.id).having(db.func.coalesce(db.func.sum(Transaction.amount), 0) > 0).order_by(db.desc("total"))
        return [{"id": r.id, "category": r.name, "icon": r.icon, "amount": int(r.total)} for r in q.all()]
