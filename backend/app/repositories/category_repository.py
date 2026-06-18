from .base import BaseRepository
from ..models.category import Category


class CategoryRepository(BaseRepository):
    def __init__(self):
        super().__init__(Category)

    def get_by_type(self, cat_type):
        return Category.query.filter_by(type=cat_type).order_by(Category.name).all()

    def get_by_name_and_type(self, name, cat_type):
        return Category.query.filter_by(name=name, type=cat_type).first()

    def seed_defaults(self):
        """Insert default categories if table is empty."""
        if Category.query.count() > 0:
            return
        defaults = [
            # income
            ("Lương",      "payments",       "income"),
            ("Kinh doanh", "storefront",      "income"),
            ("Đầu tư",     "trending_up",     "income"),
            ("Tiền lãi",   "savings",         "income"),
            ("Khác",       "more_horiz",      "income"),
            # expense
            ("Ăn uống",    "restaurant",      "expense"),
            ("Di chuyển",  "directions_car",  "expense"),
            ("Mua sắm",    "shopping_cart",   "expense"),
            ("Y tế",       "medical_services","expense"),
            ("Hóa đơn",    "receipt_long",    "expense"),
            ("Nhà ở",      "home",            "expense"),
            ("Khác",       "more_horiz",      "expense"),
        ]
        for name, icon, t in defaults:
            self.add(Category(name=name, icon=icon, type=t))
        self.commit()
