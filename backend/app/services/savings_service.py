from datetime import date, datetime

from ..models.savings_goal import SavingsGoal
from ..models.savings_deposit import SavingsDeposit
from ..repositories.savings_repository import (
    SavingsGoalRepository,
    SavingsDepositRepository,
)

class SavingsService:
    def __init__(self):
        self._goals = SavingsGoalRepository()
        self._deposits = SavingsDepositRepository()

    # ── Goals ─────────────────────────────────────────────────────
    def list_goals(self, user_id):
        return self._goals.get_all_ordered(user_id)

    def get_goal(self, goal_id, user_id):
        goal = self._goals.get_with_deposits(goal_id, user_id)
        if not goal:
            raise ValueError(f"Không tìm thấy mục tiêu id={goal_id}")
        return goal

    def create_goal(self, user_id, name: str, target_amount: int, icon: str, deadline=None):
        if not name or not name.strip():
            raise ValueError("Tên mục tiêu không được để trống")
        if target_amount <= 0:
            raise ValueError("Số tiền mục tiêu phải lớn hơn 0")

        if deadline and isinstance(deadline, str):
            deadline = date.fromisoformat(deadline)

        goal = SavingsGoal(
            name=name.strip(),
            icon=icon or "savings",
            target_amount=target_amount,
            deadline=deadline,
            user_id=user_id, # BỔ SUNG USER_ID
        )
        self._goals.add(goal)
        self._goals.commit()
        return goal

    def update_goal(self, goal_id: int, user_id: int, **kwargs):
        goal = self.get_goal(goal_id, user_id)

        if "name" in kwargs:
            if not kwargs["name"] or not kwargs["name"].strip():
                raise ValueError("Tên mục tiêu không được để trống")
            goal.name = kwargs["name"].strip()

        if "target_amount" in kwargs:
            if kwargs["target_amount"] <= 0:
                raise ValueError("Số tiền mục tiêu phải lớn hơn 0")
            if kwargs["target_amount"] < goal.saved_amount:
                raise ValueError("Số tiền mục tiêu không thể nhỏ hơn số tiền đã tiết kiệm")
            goal.target_amount = kwargs["target_amount"]

        if "icon" in kwargs:
            goal.icon = kwargs["icon"]

        if "deadline" in kwargs:
            dl = kwargs["deadline"]
            goal.deadline = date.fromisoformat(dl) if dl and isinstance(dl, str) else dl

        self._goals.commit()
        return goal

    def delete_goal(self, goal_id: int, user_id: int):
        goal = self.get_goal(goal_id, user_id)
        self._goals.delete(goal)
        self._goals.commit()

    # ── Deposits ──────────────────────────────────────────────────
    def list_deposits(self, goal_id: int, user_id: int):
        self.get_goal(goal_id, user_id)  # raises if not found or no access
        return self._deposits.get_by_goal(goal_id)

    def add_deposit(self, goal_id: int, user_id: int, amount: int, deposit_date=None, note=None):
        goal = self.get_goal(goal_id, user_id)

        if amount <= 0:
            raise ValueError("Số tiền nạp phải lớn hơn 0")
        if goal.is_completed:
            raise ValueError("Mục tiêu đã hoàn thành, không cần nạp thêm")

        if deposit_date and isinstance(deposit_date, str):
            deposit_date = date.fromisoformat(deposit_date)

        deposit = SavingsDeposit(
            goal_id=goal_id,
            amount=amount,
            date=deposit_date or date.today(),
            note=note,
        )
        self._deposits.add(deposit)
        self._deposits.commit()
        return deposit

    def delete_deposit(self, goal_id: int, deposit_id: int, user_id: int):
        self.get_goal(goal_id, user_id) # Verify ownership
        deposit = self._deposits.get_by_goal_and_id(goal_id, deposit_id)
        if not deposit:
            raise ValueError(f"Không tìm thấy lần nạp id={deposit_id}")
        self._deposits.delete(deposit)
        self._deposits.commit()