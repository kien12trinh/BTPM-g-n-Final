from .base import BaseRepository
from ..models.savings_goal import SavingsGoal
from ..models.savings_deposit import SavingsDeposit

class SavingsGoalRepository(BaseRepository):
    def __init__(self):
        super().__init__(SavingsGoal)

    def get_all_ordered(self, user_id):
        return SavingsGoal.query.filter_by(user_id=user_id).order_by(SavingsGoal.created_at.desc()).all()

    def get_with_deposits(self, goal_id, user_id):
        # Đảm bảo goal_id tồn tại VÀ thuộc về user_id này
        return SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()


class SavingsDepositRepository(BaseRepository):
    def __init__(self):
        super().__init__(SavingsDeposit)

    def get_by_goal(self, goal_id):
        return (
            SavingsDeposit.query
            .filter_by(goal_id=goal_id)
            .order_by(SavingsDeposit.date.desc())
            .all()
        )

    def get_by_goal_and_id(self, goal_id, deposit_id):
        return SavingsDeposit.query.filter_by(
            id=deposit_id, goal_id=goal_id
        ).first()