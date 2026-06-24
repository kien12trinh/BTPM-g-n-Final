from .base import BaseRepository
from ..models.category import Category

class CategoryRepository(BaseRepository):
    def __init__(self):
        super().__init__(Category)

    # Thêm hàm lấy tất cả theo user_id
    def get_all_by_user(self, user_id):
        return Category.query.filter_by(user_id=user_id).order_by(Category.name).all()

    def get_by_type(self, cat_type, user_id):
        return Category.query.filter_by(type=cat_type, user_id=user_id).order_by(Category.name).all()

    def get_by_name_and_type(self, name, cat_type, user_id):
        return Category.query.filter_by(name=name, type=cat_type, user_id=user_id).first()

    def seed_defaults(self, user_id):
        """Tạo các danh mục mặc định cho MỘT user cụ thể nếu họ chưa có."""
        if Category.query.filter_by(user_id=user_id).count() > 0:
            return
            
        defaults = [
            # income
            ("Lương",      "payments",       "income"),
            ("Kinh doanh", "storefront",     "income"),
            ("Đầu tư",     "trending_up",    "income"),
            ("Tiền lãi",   "savings",        "income"),
            ("Khác",       "more_horiz",     "income"),
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
            self.add(Category(name=name, icon=icon, type=t, user_id=user_id))
        self.commit()