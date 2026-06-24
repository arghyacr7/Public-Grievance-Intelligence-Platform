import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database import AsyncSessionLocal, engine, Base
from backend.models import User, RoleEnum
from backend.auth_utils import get_password_hash

async def seed_admin():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        admin_email = "iamarghyacr7@gmail.com"
        stmt = select(User).where(User.email == admin_email)
        result = await db.execute(stmt)
        existing_user = result.scalars().first()

        if existing_user:
            print("User exists. Updating role to officer and setting default password...")
            existing_user.role = RoleEnum.officer
            existing_user.hashed_password = get_password_hash("admin123")
        else:
            print("Creating admin user...")
            new_admin = User(
                name="Admin User",
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role=RoleEnum.officer
            )
            db.add(new_admin)
        
        await db.commit()
        print("Admin user seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_admin())
