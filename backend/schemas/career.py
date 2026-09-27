from pydantic import BaseModel
from typing import List


class CareerAnalysisRequest(BaseModel):
    student_skills: List[str]
    target_role: str