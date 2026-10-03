from fastapi import APIRouter
from api.v1.endpoints import auth, users, clients, projects, inventory, gemini

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación & JWT"])
api_router.include_router(users.router, prefix="/users", tags=["Usuarios & Roles"])
api_router.include_router(clients.router, prefix="/clients", tags=["Clientes Corporativos"])
api_router.include_router(projects.router, prefix="/projects", tags=["Proyectos de Recubrimiento"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Catálogo & Inventario"])
api_router.include_router(gemini.router, prefix="/gemini", tags=["Inteligencia Artificial Gemini"])
