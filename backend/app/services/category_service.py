from ..models.category import Category
from ..repositories.category_repository import CategoryRepository

class CategoryService:
    def __init__(self):
        self._repo = CategoryRepository()

    def list_all(self, user_id):
        return self._repo.get_all_by_user(user_id)

    def list_by_type(self, cat_type, user_id):
        return self._repo.get_by_type(cat_type, user_id)

    def create(self, name, icon, cat_type, user_id):
        user_id = int(user_id) # FIX: Ép kiểu sang số nguyên
        
        if not name or not name.strip():
            raise ValueError("Tên danh mục không được để trống")
        if cat_type not in ("income", "expense"):
            raise ValueError("Loại danh mục phải là income hoặc expense")
        
        cat = Category(name=name.strip(), icon=icon or "label", type=cat_type, user_id=user_id)
        self._repo.add(cat)
        self._repo.commit()
        return cat

    def update(self, cat_id, user_id, **kwargs):
        user_id = int(user_id) # FIX: Ép kiểu sang số nguyên
        
        cat = self._repo.get_by_id(cat_id)
        if not cat or cat.user_id != user_id:
            raise ValueError(f"Không tìm thấy danh mục id={cat_id}")
            
        if "name" in kwargs:
            cat.name = kwargs["name"].strip()
        if "icon" in kwargs:
            cat.icon = kwargs["icon"]
        self._repo.commit()
        return cat

    def delete(self, cat_id, user_id):
        user_id = int(user_id) # FIX: Ép kiểu sang số nguyên
        
        cat = self._repo.get_by_id(cat_id)
        if not cat or cat.user_id != user_id:
            raise ValueError(f"Không tìm thấy danh mục id={cat_id}")
            
        if cat.transactions.count() > 0:
            raise ValueError("Không thể xoá danh mục đang có giao dịch")
        self._repo.delete(cat)
        self._repo.commit()

    def seed_defaults(self, user_id):
        self._repo.seed_defaults(user_id)