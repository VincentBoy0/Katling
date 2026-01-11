"""
Script to clear all database tables except user-related tables.
Preserves: users, user_roles, user_info, user_points
Clears: lessons, topics, questions, posts, reports, vocab, progress, etc.
"""
import asyncio
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

from sqlalchemy import text
from database.session import engine


async def clear_non_user_tables():
    """Clear all tables except user-related ones."""
    
    # Tables to preserve (user-related)
    preserve_tables = {
        'users',
        'user_roles', 
        'user_info',
        'user_points',
        'alembic_version'  # Keep migration history
    }
    
    # Tables to clear (in order to respect foreign key constraints)
    # Start with dependent tables first, then parent tables
    tables_to_clear = [
        # Progress and user activity
        'user_lesson_progress',
        'user_section_progress',
        'user_question_progress',
        'user_words',
        'user_daily_missions',
        
        # Social features
        'post_likes',
        'post_comments',
        'posts',
        'friend_requests',
        'friendships',
        
        # Reports
        'reports',
        
        # Leaderboard
        'leaderboard_snapshots',
        
        # Lesson content (from most dependent to least)
        'questions',
        'lesson_sections',
        'lessons',
        'topics',
        
        # Vocabulary
        'user_words',
        'vocabs',
    ]
    
    async with engine.begin() as conn:
        print("� Getting list of existing tables...")
        
        # Get actual tables that exist in database
        result = await conn.execute(text("""
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        """))
        existing_tables = {row[0] for row in result.fetchall()}
        
        print(f"   Found {len(existing_tables)} tables in database")
        
        print("\n🗑️  Clearing non-user tables...")
        
        cleared_count = 0
        skipped_count = 0
        
        for table in tables_to_clear:
            if table not in existing_tables:
                print(f"  - {table} (does not exist)")
                skipped_count += 1
                continue
                
            try:
                result = await conn.execute(text(f"DELETE FROM {table}"))
                count = result.rowcount
                if count > 0:
                    print(f"  ✓ Cleared {count} rows from {table}")
                    cleared_count += count
                else:
                    print(f"  - {table} (already empty)")
            except Exception as e:
                print(f"  ⚠ Error clearing {table}: {e}")
        
        print(f"\n✅ Successfully cleared {cleared_count} total rows")
        print(f"   Skipped {skipped_count} non-existent tables")
        print(f"✅ User data preserved in: {', '.join(sorted(preserve_tables))}")


async def main():
    """Main entry point."""
    print("=" * 60)
    print("DATABASE RESET - Clear Non-User Tables")
    print("=" * 60)
    print("\nThis will DELETE all data from lesson, post, vocab, and")
    print("progress tables while preserving user accounts and roles.")
    print("\n⚠️  WARNING: This action cannot be undone!")
    
    confirm = input("\nType 'yes' to continue: ").strip().lower()
    
    if confirm != 'yes':
        print("❌ Operation cancelled")
        return
    
    print()
    await clear_non_user_tables()
    print("\n" + "=" * 60)
    print("Reset complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
