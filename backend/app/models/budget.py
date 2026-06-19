from ..extensions import db

class CategoryBudget(db.Model):
    __tablename__ = "category_budgets"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    month_year = db.Column(db.String(7), nullable=False)  # Định dạng: "YYYY-MM" (VD: "2023-10")
    max_amount = db.Column(db.BigInteger, nullable=False, default=0)

    # BỔ SUNG CỘT user_id
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relationship để lấy thông tin category dễ dàng
    category = db.relationship("Category", backref="budgets")

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "month_year": self.month_year,
            "max_amount": self.max_amount,
            "user_id": self.user_id
        }