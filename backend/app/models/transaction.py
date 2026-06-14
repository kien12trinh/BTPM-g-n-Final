from datetime import date, datetime
from ..extensions import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id          = db.Column(db.Integer, primary_key=True)
    type        = db.Column(db.Enum("income", "expense"), nullable=False)
    amount      = db.Column(db.BigInteger, nullable=False)
    date        = db.Column(db.Date, nullable=False, default=date.today)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    note        = db.Column(db.String(255), nullable=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id":          self.id,
            "type":        self.type,
            "amount":      self.amount,
            "date":        self.date.isoformat(),
            "category_id": self.category_id,
            "category":    self.category.to_dict() if self.category else None,
            "note":        self.note,
            "created_at":  self.created_at.isoformat(),
        }
