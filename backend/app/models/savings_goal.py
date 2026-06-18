from datetime import datetime
from ..extensions import db


class SavingsGoal(db.Model):
    __tablename__ = "savings_goals"

    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(120), nullable=False)
    icon          = db.Column(db.String(60), nullable=False, default="savings")
    target_amount = db.Column(db.BigInteger, nullable=False)
    deadline      = db.Column(db.Date, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    deposits = db.relationship(
        "SavingsDeposit",
        backref="goal",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    # ── Computed helpers ──────────────────────────────────────────
    @property
    def saved_amount(self):
        return int(
            db.session.query(
                db.func.coalesce(
                    db.func.sum(
                        __import__(
                            "app.models.savings_deposit",
                            fromlist=["SavingsDeposit"],
                        ).SavingsDeposit.amount
                    ),
                    0,
                )
            )
            .filter_by(goal_id=self.id)
            .scalar()
        )

    @property
    def progress_pct(self):
        if self.target_amount == 0:
            return 0
        return round(min(self.saved_amount / self.target_amount * 100, 100), 1)

    @property
    def remaining_amount(self):
        return max(self.target_amount - self.saved_amount, 0)

    @property
    def is_completed(self):
        return self.saved_amount >= self.target_amount

    def to_dict(self, include_deposits=False):
        data = {
            "id":               self.id,
            "name":             self.name,
            "icon":             self.icon,
            "target_amount":    self.target_amount,
            "deadline":         self.deadline.isoformat() if self.deadline else None,
            "saved_amount":     self.saved_amount,
            "remaining_amount": self.remaining_amount,
            "progress_pct":     self.progress_pct,
            "is_completed":     self.is_completed,
            "created_at":       self.created_at.isoformat(),
        }
        if include_deposits:
            data["deposits"] = [d.to_dict() for d in self.deposits.order_by(
                __import__(
                    "app.models.savings_deposit",
                    fromlist=["SavingsDeposit"],
                ).SavingsDeposit.date.desc()
            )]
        return data
