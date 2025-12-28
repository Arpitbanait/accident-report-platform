from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from ..auth import Token, login

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login_route(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    return await login(form_data)
