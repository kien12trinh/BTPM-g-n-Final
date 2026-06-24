from datetime import date
from ..models.transaction import Transaction
from ..repositories.transaction_repository import TransactionRepository
from ..repositories.category_repository import CategoryRepository

class TransactionService:
    def __init__(self):
        self._repo = TransactionRepository()
        self._cat_repo = CategoryRepository()

    def list(self, user_id, date_from=None, date_to=None, tx_type=None, limit=None):
        if isinstance(date_from, str):
            date_from = date.fromisoformat(date_from)
        if isinstance(date_to, str):
            date_to = date.fromisoformat(date_to)
        return self._repo.get_filtered(user_id, date_from, date_to, tx_type, limit)

    def create(self, user_id, tx_type, amount, tx_date=None, category_id=None, note=None):
        user_id = int(user_id) # FIX: Ép kiểu sang số nguyên
        
        if tx_type not in ("income", "expense"):
            raise ValueError("Loại giao dịch phải là income hoặc expense")
        if not amount or int(amount) <= 0:
            raise ValueError("Số tiền phải lớn hơn 0")
        if category_id:
            cat = self._cat_repo.get_by_id(category_id)
            # Kiểm tra xem danh mục có tồn tại và thuộc về user này không
            if not cat or cat.user_id != user_id:
                raise ValueError(f"Không tìm thấy danh mục id={category_id} hoặc không thuộc quyền")

        tx = Transaction(
            type=tx_type,
            amount=int(amount),
            date=date.fromisoformat(tx_date) if isinstance(tx_date, str) else (tx_date or date.today()),
            category_id=category_id,
            note=note,
            user_id=user_id,
        )
        self._repo.add(tx)
        self._repo.commit()
        return tx

    def delete(self, tx_id, user_id):
        user_id = int(user_id) # FIX: Ép kiểu sang số nguyên
        
        tx = self._repo.get_by_id(tx_id)
        if not tx or tx.user_id != user_id:
            raise ValueError(f"Không tìm thấy giao dịch id={tx_id}")
        self._repo.delete(tx)
        self._repo.commit()