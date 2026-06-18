from datetime import date, datetime
from ..extensions import db


class SavingsDeposit(db.Model):
    __tablename__ = "savings_deposits"

    id         = db.Column(db.Integer, primary_key=True)
    goal_id    = db.Column(db.Integer, db.ForeignKey("savings_goals.id"), nullable=False)
    amount     = db.Column(db.BigInteger, nullable=False)
    date       = db.Column(db.Date, nullable=False, default=date.today)
    note       = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id":         self.id,
            "goal_id":    self.goal_id,
            "amount":     self.amount,
            "date":       self.date.isoformat(),
            "note":       self.note,
            "created_at": self.created_at.isoformat(),
        }
