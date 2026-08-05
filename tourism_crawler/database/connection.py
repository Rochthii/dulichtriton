from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from tourism_crawler.config.settings import settings
from tourism_crawler.models.base import Base
from tourism_crawler.config.logging import logger

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_async_session():
    """Dependency for providing AsyncSession."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Initialize database tables if they do not exist."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization skipped or failed: {e}")
