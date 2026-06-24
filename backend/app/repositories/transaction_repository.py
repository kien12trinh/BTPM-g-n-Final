from datetime import date
from ..extensions import db
from .base import BaseRepository
from ..models.transaction import Transaction

class TransactionRepository(BaseRepository):
    def __init__(self):
        super().__init__(Transaction)

    def get_filtered(self, user_id, date_from=None, date_to=None, tx_type=None, limit=None):
        # Bắt buộc lọc theo user_id trước tiên
        q = Transaction.query.filter_by(user_id=user_id)
        
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

    def sum_by_type_and_month(self, user_id, year, month, tx_type):
        result = db.session.query(
            db.func.coalesce(db.func.sum(Transaction.amount), 0)
        ).filter(
            Transaction.user_id == user_id, # Lọc theo user_id
            Transaction.type == tx_type,
            db.func.year(Transaction.date) == year,
            db.func.month(Transaction.date) == month,
        ).scalar()
        return int(result)

    def monthly_totals(self, user_id, months: list[tuple[int, int]]):
        """Returns [{year, month, income, expense}] for given (year,month) list."""
        rows = []
        for year, month in months:
            inc = self.sum_by_type_and_month(user_id, year, month, "income")
            exp = self.sum_by_type_and_month(user_id, year, month, "expense")
            rows.append({"year": year, "month": month, "income": inc, "expense": exp})
        return rows

    def sum_by_category(self, user_id, tx_type, date_from=None, date_to=None):
        from ..models.category import Category
        q = (
            db.session.query(
                Category.id,
                Category.name,
                Category.icon,
                db.func.coalesce(db.func.sum(Transaction.amount), 0).label("total"),
            )
            .join(Transaction, Transaction.category_id == Category.id, isouter=True)
            .filter(Category.type == tx_type, Category.user_id == user_id) # Chỉ lấy Category của user này
        )
        if date_from:
            q = q.filter(
                db.or_(Transaction.date == None, Transaction.date >= date_from)
            )
        if date_to:
            q = q.filter(
                db.or_(Transaction.date == None, Transaction.date <= date_to)
            )
        # Chỉ nhóm các giao dịch thuộc về user_id này (nếu có giao dịch)
        q = q.filter(db.or_(Transaction.id == None, Transaction.user_id == user_id))
        
        q = q.group_by(Category.id).having(db.func.coalesce(db.func.sum(Transaction.amount), 0) > 0).order_by(db.desc("total"))
        return [{"id": r.id, "category": r.name, "icon": r.icon, "amount": int(r.total)} for r in q.all()]